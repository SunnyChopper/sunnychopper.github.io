import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { ChatMessage, ChatThread } from '@/types/chatbot';
import { queryKeys } from '@/lib/react-query/query-keys';

type ListCache<T> = { data?: T[] } | T[];

const extractListData = <T>(value: ListCache<T> | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
};

const mergeListData = <T>(value: ListCache<T> | undefined, data: T[]): ListCache<T> => {
  if (Array.isArray(value)) return data;
  if (value && typeof value === 'object') {
    return { ...value, data };
  }
  return { data };
};

const updateListQueries = <T>(
  queryClient: QueryClient,
  queryKeyBase: QueryKey,
  updater: (items: T[]) => T[]
): void => {
  const queries = queryClient.getQueriesData<ListCache<T>>({ queryKey: queryKeyBase });
  queries.forEach(([key, data]) => {
    const next = updater(extractListData<T>(data));
    queryClient.setQueryData(key, mergeListData<T>(data, next));
  });
};

const upsertById = <T extends { id: string }>(items: T[], item: T): T[] => {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string): T[] =>
  items.filter((item) => item.id !== id);

const sortThreads = (threads: ChatThread[]): ChatThread[] =>
  [...threads].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

const sortMessages = (messages: ChatMessage[]): ChatMessage[] =>
  [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

export const upsertChatThreadCache = (queryClient: QueryClient, thread: ChatThread): void => {
  updateListQueries<ChatThread>(queryClient, queryKeys.chatbot.threads.lists(), (items) =>
    sortThreads(upsertById(items, thread))
  );
  queryClient.setQueryData(queryKeys.chatbot.threads.detail(thread.id), thread);
};

export const removeChatThreadCache = (queryClient: QueryClient, threadId: string): void => {
  updateListQueries<ChatThread>(queryClient, queryKeys.chatbot.threads.lists(), (items) =>
    removeById(items, threadId)
  );
  queryClient.removeQueries({ queryKey: queryKeys.chatbot.threads.detail(threadId) });
  queryClient.removeQueries({ queryKey: queryKeys.chatbot.messages.list(threadId) });
};

export const upsertChatMessageCache = (queryClient: QueryClient, message: ChatMessage): void => {
  updateListQueries<ChatMessage>(
    queryClient,
    queryKeys.chatbot.messages.list(message.thread_id),
    (items) => sortMessages(upsertById(items, message))
  );
};

export const replaceChatThreadMessages = (
  queryClient: QueryClient,
  threadId: string,
  messages: ChatMessage[]
): void => {
  queryClient.setQueryData(queryKeys.chatbot.messages.list(threadId), sortMessages(messages));
};
