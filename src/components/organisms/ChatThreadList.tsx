import { Check, Edit2, Loader2, MessageCircle, Plus, Trash2, X } from 'lucide-react';
import { extractErrorMessage } from '@/lib/react-query/error-utils';
import { isLocalAssistantThreadId } from '@/lib/chat/local-thread-id';
import type { ChatThread } from '@/types/chatbot';

function titleStartsWithEmoji(title: string): boolean {
  return /^[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u.test(title.trimStart());
}

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
}: ChatThreadListProps) {
  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          type="button"
          onClick={onCreateThread}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
        >
          <Plus size={18} />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isThreadsLoading && (
          <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading chats...</span>
          </div>
        )}
        {isThreadsError && (
          <div className="mx-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-3 text-xs text-red-700 dark:text-red-200 space-y-2">
            <div>{extractErrorMessage(threadsError, 'Failed to load chats')}</div>
            <button
              type="button"
              onClick={() => onRefetchThreads()}
              className="text-xs underline underline-offset-2 hover:text-red-800 dark:hover:text-red-100"
            >
              Retry
            </button>
          </div>
        )}
        {!isThreadsLoading && !isThreadsError && displayThreads.length === 0 && (
          <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
            No chats yet. Create one to get started.
          </div>
        )}
        {!isThreadsLoading &&
          !isThreadsError &&
          displayThreads.map((thread) => {
            const isActive = resolvedThreadId === thread.id;
            const isLocalThread = isLocalAssistantThreadId(thread.id);
            const hasLeadingEmoji = titleStartsWithEmoji(thread.title);
            return (
              <div
                key={thread.id}
                className={`group relative p-3 rounded-lg mb-1 cursor-pointer transition ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectThread(thread.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectThread(thread.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {editingThreadId === thread.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => onEditingTitleChange(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') onConfirmRename(thread.id);
                        if (e.key === 'Escape') onCancelEdit();
                      }}
                      disabled={isUpdating}
                      className="flex-1 min-w-0 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onConfirmRename(thread.id)}
                      disabled={isUpdating}
                      className="flex-shrink-0 p-1 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded disabled:opacity-50"
                      aria-label="Confirm rename"
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onCancelEdit}
                      disabled={isUpdating}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 rounded disabled:opacity-50"
                      aria-label="Cancel rename"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {!hasLeadingEmoji && (
                        <MessageCircle
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                        {thread.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition absolute right-2 top-2">
                      {!isLocalThread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartEdit(thread.id, thread.title);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          aria-label="Rename chat"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                        aria-label="Delete chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
