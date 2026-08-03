import type { ReactNode, RefObject } from 'react';
import { Globe } from 'lucide-react';
import { Textarea } from '@/components/atoms/Textarea';
import { ChatSendButton } from '@/components/atoms/chat/ChatSendButton';
import { chatComposerInputPillClassName } from '@/lib/chat/imessage-surfaces';
import { cn } from '@/lib/utils';

type MessagesComposerBarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  activeRunId?: string | null;
  onCancelRun?: (runId: string) => void;
  webSearchEnabled?: boolean;
  onWebSearchToggle?: () => void;
  maxHeightPx?: number;
  banners?: ReactNode;
  className?: string;
};

export function MessagesComposerBar({
  textareaRef,
  value,
  onChange,
  onSend,
  placeholder = 'iMessage',
  disabled = false,
  isStreaming = false,
  activeRunId = null,
  onCancelRun,
  webSearchEnabled = false,
  onWebSearchToggle,
  maxHeightPx = 200,
  banners,
  className,
}: MessagesComposerBarProps) {
  const sendMode = isStreaming ? 'stop' : 'send';

  return (
    <div
      className={cn('px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4', className)}
    >
      {banners}
      <div className="flex items-end gap-2">
        <div className={cn(chatComposerInputPillClassName)}>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isStreaming) return;
                onSend();
              }
            }}
            rows={1}
            placeholder={placeholder}
            aria-label="Message"
            disabled={disabled}
            style={{ maxHeight: maxHeightPx }}
            className={cn(
              'min-h-0 flex-1 rounded-none border-0 bg-transparent px-0 py-1.5 text-[15px] leading-snug text-gray-900 shadow-none',
              'resize-none overflow-y-auto placeholder:text-gray-500 focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400'
            )}
          />
          {onWebSearchToggle ? (
            <button
              type="button"
              role="switch"
              aria-checked={webSearchEnabled}
              onClick={onWebSearchToggle}
              title={
                webSearchEnabled
                  ? 'Web search on for your next message'
                  : 'Turn on web search for your next message'
              }
              className={cn(
                'mb-0.5 shrink-0 rounded-full p-1.5 transition',
                webSearchEnabled
                  ? 'text-sky-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <Globe size={18} aria-hidden />
            </button>
          ) : null}
        </div>
        <ChatSendButton
          mode={sendMode}
          disabled={sendMode === 'send' ? !value.trim() || disabled : !activeRunId}
          onClick={() => {
            if (sendMode === 'stop' && activeRunId && onCancelRun) {
              onCancelRun(activeRunId);
              return;
            }
            onSend();
          }}
        />
      </div>
    </div>
  );
}
