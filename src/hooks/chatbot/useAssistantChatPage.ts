import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { extractApiError, extractErrorMessage } from '@/lib/react-query/error-utils';
import { wsLogger } from '@/lib/logger';
import { useAdminShell } from '@/contexts/AdminShellContext';
import { useAuth } from '@/contexts/Auth';
import { createLocalAssistantThreadId, isLocalAssistantThreadId } from '@/lib/chat/local-thread-id';
import {
  useChatThreads,
  useChatThread,
  useChatThreadMutations,
  useChatMessageMutations,
  useMessageTree,
  useBranchSelection,
  useEditMessage,
} from '@/hooks/useChatbot';
import { useAssistantStreaming } from '@/hooks/useAssistantStreaming';
import { useChatbotSidebarLayout } from '@/hooks/chatbot/useChatbotSidebarLayout';
import { useAssistantShellOverlay } from '@/hooks/chatbot/useAssistantShellOverlay';
import { useAssistantStreamingToasts } from '@/hooks/chatbot/useAssistantStreamingToasts';
import { useThinkingAccordionSync } from '@/hooks/chatbot/useThinkingAccordionSync';
import { useExecutionTraceAccordionSync } from '@/hooks/chatbot/useExecutionTraceAccordionSync';
import { useChatbotThreadRoute } from '@/hooks/chatbot/useChatbotThreadRoute';
import { useChatbotTranscriptViewModel } from '@/hooks/chatbot/useChatbotTranscriptViewModel';
import { useChatbotSendHandlers } from '@/hooks/chatbot/useChatbotSendHandlers';
import type { ChatThreadListProps } from '@/components/organisms/ChatThreadList';

export function useAssistantChatPage({
  onRestoreInput,
}: {
  /** Called with the original content when a draft-thread send fails (so the composer can restore it). */
  onRestoreInput: (content: string) => void;
}) {
  const queryClient = useQueryClient();
  const [streamingThreadOverrideId, setStreamingThreadOverrideId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});
  const [executionTraceExpanded, setExecutionTraceExpanded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { threadId: routeThreadId } = useParams<{ threadId?: string }>();
  const { showToast, dismissToast, ToastContainer } = useToast();
  const { assistantChatsOpen, closeAssistantChats } = useAdminShell();
  const { user } = useAuth();

  const { sidebarCollapsed, setSidebarCollapsed } = useChatbotSidebarLayout();
  useAssistantShellOverlay(assistantChatsOpen, closeAssistantChats);

  const {
    threads,
    isLoading: isThreadsLoading,
    isError: isThreadsError,
    error: threadsError,
    refetch: refetchThreads,
  } = useChatThreads();

  const { resolvedThreadId, syntheticDraftThread, displayThreads } = useChatbotThreadRoute({
    routeThreadId,
    threads,
    navigate,
    showToast,
    userId: user?.id,
  });

  const serverThreadQueryId =
    resolvedThreadId && !isLocalAssistantThreadId(resolvedThreadId) ? resolvedThreadId : undefined;
  const streamingThreadId = streamingThreadOverrideId ?? serverThreadQueryId;
  const { thread: serverThread } = useChatThread(serverThreadQueryId);
  const {
    tree,
    isLoading: isTreeLoading,
    isError: isTreeError,
    error: treeError,
    refetch: refetchTree,
  } = useMessageTree(resolvedThreadId || undefined);

  const activeThread = syntheticDraftThread ?? serverThread;

  const { createThread, updateThread, deleteThread, isUpdating } = useChatThreadMutations();
  const { createMessage } = useChatMessageMutations();
  const { editMessage } = useEditMessage();

  const {
    runs,
    isStreaming,
    isAwaitingRunStart,
    error: streamingError,
    connectionState,
    sendFollowUp: streamSendFollowUp,
    cancelRun,
    reconnect,
    retryRun,
    respondToToolApproval,
  } = useAssistantStreaming(streamingThreadId);

  useAssistantStreamingToasts(
    showToast,
    dismissToast,
    streamingError,
    isAwaitingRunStart,
    isStreaming
  );

  const { treeForBranch, nodeByIdForBranch, runByAssistantMessageId, activeRunId } =
    useChatbotTranscriptViewModel({
      resolvedThreadId,
      tree,
      runs,
    });

  const { selectedLeafId, transcript, setSelectedLeafId, getSiblings, selectSibling } =
    useBranchSelection({
      threadId: resolvedThreadId || undefined,
      tree: treeForBranch,
      nodeById: nodeByIdForBranch,
      activeLeafMessageId: activeThread?.activeLeafMessageId,
    });

  const sendFollowUp = useCallback(
    (userMessageId: string) => {
      setSelectedLeafId(userMessageId);
      streamSendFollowUp(userMessageId);
    },
    [setSelectedLeafId, streamSendFollowUp]
  );

  const latestUserMessageId = useMemo(() => {
    for (let index = transcript.length - 1; index >= 0; index -= 1) {
      if (transcript[index].role === 'user') {
        return transcript[index].id;
      }
    }
    return null;
  }, [transcript]);

  useThinkingAccordionSync(runs, setThinkingExpanded);
  useExecutionTraceAccordionSync(runs, setExecutionTraceExpanded);

  const isLocalDraft =
    Boolean(resolvedThreadId) && isLocalAssistantThreadId(resolvedThreadId ?? '');

  const sendHandlers = useChatbotSendHandlers({
    queryClient,
    navigate,
    showToast,
    activeThread,
    selectedLeafId,
    setSelectedLeafId,
    createThread,
    createMessage,
    sendFollowUp,
    connectionState,
    streamingThreadId,
    setStreamingThreadOverrideId,
    isAwaitingRunStart,
    isLocalDraft,
    onRestoreInput,
  });

  const {
    isLoading,
    editingMessageId,
    setEditingMessageId,
    awaitingWsFollowUp,
    handleSendMessage,
    handleRetryUserMessage,
  } = sendHandlers;

  const isInputDisabled =
    isLoading ||
    awaitingWsFollowUp ||
    isAwaitingRunStart ||
    (!isLocalDraft && (connectionState === 'failed' || connectionState === 'disconnected'));

  const showDisconnectedBanner =
    !isLocalDraft && connectionState === 'disconnected' && Boolean(streamingError);
  const showReconnectingBanner =
    !isLocalDraft && connectionState === 'reconnecting' && (isStreaming || isAwaitingRunStart);

  const handleCreateThread = useCallback(() => {
    navigate(`/admin/assistant/${createLocalAssistantThreadId()}`);
  }, [navigate]);

  const handleDeleteThread = useCallback(
    async (id: string) => {
      try {
        if (isLocalAssistantThreadId(id)) {
          const remainingThread = threads.find((t) => t.id !== id);
          if (resolvedThreadId === id) {
            if (remainingThread) {
              navigate(`/admin/assistant/${remainingThread.id}`, { replace: true });
            } else {
              navigate('/admin/assistant', { replace: true });
            }
          }
          return;
        }
        const remainingThread = threads.find((t) => t.id !== id);
        await deleteThread(id);
        if (resolvedThreadId === id) {
          if (remainingThread) {
            navigate(`/admin/assistant/${remainingThread.id}`, { replace: true });
          } else {
            navigate('/admin/assistant', { replace: true });
          }
        }
      } catch (error) {
        wsLogger.error('Error deleting thread', error);
      }
    },
    [deleteThread, navigate, resolvedThreadId, threads]
  );

  const handleRenameThread = useCallback(
    async (id: string) => {
      if (!editingTitle.trim()) {
        setEditingThreadId(null);
        return;
      }
      if (isLocalAssistantThreadId(id)) {
        setEditingThreadId(null);
        return;
      }
      try {
        await updateThread({ id, title: editingTitle.trim() });
        setEditingThreadId(null);
      } catch (error) {
        wsLogger.error('Error renaming thread', error);
        const apiError = extractApiError(error);
        const message = apiError?.message || extractErrorMessage(error, 'Failed to rename chat');
        showToast({
          type: 'error',
          title: 'Unable to rename chat',
          message,
        });
      }
    },
    [editingTitle, showToast, updateThread]
  );

  const handleRetryAssistantRun = useCallback(
    (userMessageId?: string, failedAssistantId?: string) => {
      if (!userMessageId || !failedAssistantId) return;
      retryRun(userMessageId, failedAssistantId);
    },
    [retryRun]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim() || !activeThread || isLocalAssistantThreadId(activeThread.id)) return;

      try {
        const updated = await editMessage({
          threadId: activeThread.id,
          messageId,
          data: { content: newContent },
        });
        setEditingMessageId(null);
        setSelectedLeafId(updated.id);
        sendFollowUp(updated.id);
      } catch (error) {
        wsLogger.error('Error editing message', error);
      }
    },
    [activeThread, editMessage, sendFollowUp, setEditingMessageId, setSelectedLeafId]
  );

  const handleThreadSelect = useCallback(
    (threadId: string) => {
      navigate(`/admin/assistant/${threadId}`);
      if (window.innerWidth < 1024) {
        closeAssistantChats();
      }
    },
    [closeAssistantChats, navigate]
  );

  const onStartEditThread = useCallback((threadId: string, title: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(title);
  }, []);

  const onCancelEditThread = useCallback(() => setEditingThreadId(null), []);

  const onToggleThinking = useCallback((messageId: string) => {
    setThinkingExpanded((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  }, []);

  const onToggleExecutionTrace = useCallback((messageId: string) => {
    setExecutionTraceExpanded((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  }, []);

  const threadListProps: ChatThreadListProps = useMemo(
    () => ({
      onCreateThread: handleCreateThread,
      isThreadsLoading,
      isThreadsError,
      threadsError,
      onRefetchThreads: refetchThreads,
      displayThreads,
      resolvedThreadId,
      editingThreadId,
      editingTitle,
      onEditingTitleChange: setEditingTitle,
      onStartEdit: onStartEditThread,
      onCancelEdit: onCancelEditThread,
      onConfirmRename: handleRenameThread,
      isUpdating,
      onDeleteThread: handleDeleteThread,
      onSelectThread: handleThreadSelect,
    }),
    [
      displayThreads,
      editingThreadId,
      editingTitle,
      handleCreateThread,
      handleDeleteThread,
      handleRenameThread,
      handleThreadSelect,
      isThreadsError,
      isThreadsLoading,
      isUpdating,
      onCancelEditThread,
      onStartEditThread,
      refetchThreads,
      resolvedThreadId,
      threadsError,
    ]
  );

  return {
    assistantChatsOpen,
    closeAssistantChats,
    sidebarCollapsed,
    setSidebarCollapsed,
    threadListProps,
    ToastContainer,
    activeThread,
    isTreeLoading,
    isTreeError,
    treeError,
    refetchTree,
    transcript,
    isStreaming,
    isAwaitingRunStart,
    runByAssistantMessageId,
    getSiblings,
    selectSibling,
    sendFollowUp,
    thinkingExpanded,
    onToggleThinking,
    executionTraceExpanded,
    onToggleExecutionTrace,
    editingMessageId,
    setEditingMessageId,
    handleEditMessage,
    handleRetryAssistantRun,
    handleRetryUserMessage,
    handleSendMessage,
    isLoading,
    awaitingWsFollowUp,
    isInputDisabled,
    isLocalDraft,
    connectionState,
    showReconnectingBanner,
    showDisconnectedBanner,
    reconnect,
    activeRunId,
    cancelRun,
    respondToToolApproval,
    latestUserMessageId,
  };
}
