import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatThreadList, type ChatThreadListProps } from '@/components/organisms/ChatThreadList';
import {
  chatShellCollapseBtnClassName,
  chatShellColumnClassName,
} from '@/lib/chat/imessage-surfaces';
import { cn } from '@/lib/utils';

export type AssistantMessagesShellProps = {
  threadListProps: ChatThreadListProps;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  assistantChatsOpen: boolean;
  onCloseAssistantChats: () => void;
  children: ReactNode;
  className?: string;
};

/** Messages.app-style list column + thread column layout for Assistant. */
export function AssistantMessagesShell({
  threadListProps,
  sidebarCollapsed,
  onToggleSidebar,
  assistantChatsOpen,
  onCloseAssistantChats,
  children,
  className,
}: AssistantMessagesShellProps) {
  return (
    <div className={cn('relative flex min-h-0 flex-1 min-w-0 overflow-hidden', className)}>
      {assistantChatsOpen && (
        <button
          type="button"
          aria-label="Close chat list"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onCloseAssistantChats}
        />
      )}
      {assistantChatsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat threads"
          className="fixed right-0 top-0 bottom-0 w-80 sm:w-80 md:w-96 z-40 border-l border-gray-200 dark:border-gray-800 shadow-2xl lg:hidden flex flex-col max-lg:pt-[calc(3.5rem+env(safe-area-inset-top,0px))] max-lg:pb-[env(safe-area-inset-bottom,0px)] max-lg:pl-[env(safe-area-inset-left,0px)]"
        >
          <ChatThreadList {...threadListProps} />
        </div>
      )}

      <div
        className={cn(
          'hidden lg:flex border-r border-gray-200 dark:border-gray-800 flex-col transition-[width] duration-300 relative z-10 h-full overflow-hidden',
          sidebarCollapsed ? 'w-0 border-r-0' : 'w-80'
        )}
      >
        <ChatThreadList {...threadListProps} />
      </div>

      <button
        type="button"
        onClick={onToggleSidebar}
        className={cn(chatShellCollapseBtnClassName, sidebarCollapsed ? 'left-4' : 'left-80')}
        aria-label={sidebarCollapsed ? 'Open chat list' : 'Close chat list'}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          chatShellColumnClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
