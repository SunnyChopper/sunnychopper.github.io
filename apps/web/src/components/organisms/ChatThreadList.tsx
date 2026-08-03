import { Loader2, SquarePen } from 'lucide-react';
import { ConversationListRow } from '@/components/molecules/chat/ConversationListRow';
import { formatThreadListPreview } from '@/lib/chat/format-thread-list-preview';
import { resolveThreadListBadge, resolveThreadTitleDisplay } from '@/lib/chat/whisper-thread-title';
import { extractErrorMessage } from '@/lib/react-query/error-utils';
import { threadRecencyTimestamp } from '@/lib/chat/thread-recency';
import {
  chatThreadListHeaderBorderClassName,
  chatThreadListShellClassName,
} from '@/lib/chat/imessage-surfaces';
import { isLocalAssistantThreadId } from '@/lib/chat/local-thread-id';
import type { ChatThread } from '@/types/chatbot';
import { cn } from '@/lib/utils';

export type ChatThreadListProps = {
  onCreateThread: () => void;
  isThreadsLoading: boolean;
  isThreadsError: boolean;
  threadsError: unknown;
  onRefetchThreads: () => void;
  displayThreads: ChatThread[];
  resolvedThreadId: string | null;
  editingThreadId: string | null;
  editingTitle: string;
  onEditingTitleChange: (title: string) => void;
  onStartEdit: (threadId: string, title: string) => void;
  onCancelEdit: () => void;
  onConfirmRename: (threadId: string) => void;
  isUpdating: boolean;
  onDeleteThread: (id: string) => void;
  onSelectThread: (threadId: string) => void;
  /** Optional per-thread display timestamp (e.g. active row uses visible transcript time). */
  getThreadDisplayTimestamp?: (thread: ChatThread) => string;
};

export function ChatThreadList({
  onCreateThread,
  isThreadsLoading,
  isThreadsError,
  threadsError,
  onRefetchThreads,
  displayThreads,
  resolvedThreadId,
  editingThreadId,
  editingTitle,
  onEditingTitleChange,
  onStartEdit,
  onCancelEdit,
  onConfirmRename,
  isUpdating,
  onDeleteThread,
  onSelectThread,
  getThreadDisplayTimestamp,
}: ChatThreadListProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col', chatThreadListShellClassName)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-between',
          chatThreadListHeaderBorderClassName
        )}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        <button
          type="button"
          onClick={onCreateThread}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#0A84FF] transition hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="Compose new message"
        >
          <SquarePen size={20} aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isThreadsLoading && (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 size={16} className="shrink-0 animate-spin" />
            <span>Loading chats...</span>
          </div>
        )}
        {isThreadsError && (
          <div className="mx-3 my-2 space-y-1.5 rounded-lg border border-red-800 bg-red-900/20 px-3 py-2 text-xs text-red-200">
            <div>{extractErrorMessage(threadsError, 'Failed to load chats')}</div>
            <button
              type="button"
              onClick={() => onRefetchThreads()}
              className="text-xs underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
        {!isThreadsLoading && !isThreadsError && displayThreads.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No conversations yet.
            <button
              type="button"
              onClick={onCreateThread}
              className="mt-2 block w-full text-[#0A84FF] font-medium"
            >
              Start a new message
            </button>
          </div>
        )}
        {!isThreadsLoading &&
          !isThreadsError &&
          displayThreads.map((thread) => {
            const isActive = resolvedThreadId === thread.id;
            const isLocalThread = isLocalAssistantThreadId(thread.id);
            const timestamp = getThreadDisplayTimestamp?.(thread) ?? threadRecencyTimestamp(thread);
            const { displayTitle } = resolveThreadTitleDisplay(thread);
            const badge = resolveThreadListBadge(thread);

            return (
              <ConversationListRow
                key={thread.id}
                title={displayTitle}
                preview={formatThreadListPreview(thread.lastMessageRole, thread.lastMessagePreview)}
                timestamp={timestamp}
                isActive={isActive}
                isEditing={editingThreadId === thread.id}
                editingTitle={editingTitle}
                onEditingTitleChange={onEditingTitleChange}
                onConfirmRename={() => onConfirmRename(thread.id)}
                onCancelEdit={onCancelEdit}
                isUpdating={isUpdating}
                onSelect={() => onSelectThread(thread.id)}
                onStartEdit={
                  !isLocalThread ? () => onStartEdit(thread.id, displayTitle) : undefined
                }
                onDelete={() => onDeleteThread(thread.id)}
                badge={badge}
              />
            );
          })}
      </div>
    </div>
  );
}
