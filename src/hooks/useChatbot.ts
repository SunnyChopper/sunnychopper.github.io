import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '@/services/chatbot.service';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import { queryKeys } from '@/lib/react-query/query-keys';
import { extractApiError, isNetworkError } from '@/lib/react-query/error-utils';
import {
  removeChatThreadCache,
  replaceChatThreadMessages,
  upsertChatMessageCache,
  upsertChatThreadCache,
} from '@/lib/react-query/chatbot-cache';
import type {
  ChatMessage,
  CreateThreadRequest,
  CreateMessageRequest,
  UpdateThreadRequest,
} from '@/types/chatbot';

/**
 * Hook to fetch all chat threads
 */
export function useChatThreads() {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.chatbot.threads.lists(),
    queryFn: async () => {
      try {
        const threads = await chatbotService.getThreads();
        recordSuccess();
        return threads;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: true,
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    threads: isError && isNetworkErr ? [] : data || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Hook to fetch a single chat thread by ID
 */
export function useChatThread(id: string | undefined) {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.chatbot.threads.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        return null;
      }
      try {
        const thread = await chatbotService.getThread(id);
        if (thread) {
          recordSuccess();
        }
        return thread;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !!id,
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    thread: data || null,
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Hook to fetch messages for a chat thread
 */
export function useChatMessages(threadId: string | undefined) {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.chatbot.messages.list(threadId || ''),
    queryFn: async () => {
      if (!threadId) {
        return [];
      }
      try {
        const messages = await chatbotService.getMessages(threadId);
        recordSuccess();
        return messages;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    enabled: !!threadId,
  });

  const apiError = error ? extractApiError(error) : null;
  const isNetworkErr = apiError ? isNetworkError(apiError) : false;

  return {
    messages: isError && isNetworkErr ? [] : data || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Hook for chat thread mutations
 */
export function useChatThreadMutations() {
  const queryClient = useQueryClient();

  const createThread = useMutation({
    mutationFn: (request: CreateThreadRequest) => chatbotService.createThread(request),
    onSuccess: (thread) => {
      upsertChatThreadCache(queryClient, thread);
    },
  });

  const updateThread = useMutation({
    mutationFn: (request: UpdateThreadRequest) => chatbotService.updateThread(request),
    onSuccess: (thread) => {
      upsertChatThreadCache(queryClient, thread);
    },
  });

  const deleteThread = useMutation({
    mutationFn: (id: string) => chatbotService.deleteThread(id),
    onSuccess: (_response, threadId) => {
      removeChatThreadCache(queryClient, threadId);
    },
  });

  return {
    createThread: createThread.mutateAsync,
    updateThread: updateThread.mutateAsync,
    deleteThread: deleteThread.mutateAsync,
    isCreating: createThread.isPending,
    isUpdating: updateThread.isPending,
    isDeleting: deleteThread.isPending,
  };
}

/**
 * Hook for chat message mutations
 */
export function useChatMessageMutations() {
  const queryClient = useQueryClient();

  const createMessage = useMutation({
    mutationFn: (request: CreateMessageRequest) => chatbotService.createMessage(request),
    onSuccess: (message) => {
      upsertChatMessageCache(queryClient, message);
    },
  });

  const updateMessage = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      chatbotService.updateMessage(id, content),
    onSuccess: (message) => {
      upsertChatMessageCache(queryClient, message);
    },
  });

  const deleteMessagesAfter = useMutation({
    mutationFn: ({ messageId, threadId }: { messageId: string; threadId: string }) =>
      chatbotService.deleteMessagesAfter(messageId, threadId),
    onSuccess: (_response, variables) => {
      const current = queryClient.getQueryData<ChatMessage[]>(
        queryKeys.chatbot.messages.list(variables.threadId)
      );
      if (current) {
        const index = current.findIndex((message) => message.id === variables.messageId);
        const next = index >= 0 ? current.slice(0, index + 1) : current;
        replaceChatThreadMessages(queryClient, variables.threadId, next);
      }
    },
  });

  return {
    createMessage: createMessage.mutateAsync,
    updateMessage: updateMessage.mutateAsync,
    deleteMessagesAfter: deleteMessagesAfter.mutateAsync,
    isCreating: createMessage.isPending,
    isUpdating: updateMessage.isPending,
    isDeleting: deleteMessagesAfter.isPending,
  };
}
