import { Loader2, Send, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatSendButtonProps = {
  mode: 'send' | 'stop' | 'loading';
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
};

export function ChatSendButton({
  mode,
  disabled,
  onClick,
  className,
  'aria-label': ariaLabel,
}: ChatSendButtonProps) {
  const label =
    ariaLabel ??
    (mode === 'stop' ? 'Stop generating' : mode === 'loading' ? 'Sending' : 'Send message');

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(
        'shrink-0 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition',
        mode === 'stop'
          ? 'bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50'
          : 'bg-[#0A84FF] hover:bg-[#0077ED] text-white disabled:bg-gray-400 dark:disabled:bg-gray-600',
        className
      )}
    >
      {mode === 'loading' ? (
        <Loader2 size={18} className="animate-spin" aria-hidden />
      ) : mode === 'stop' ? (
        <StopCircle size={18} aria-hidden />
      ) : (
        <Send size={18} className="ml-0.5" aria-hidden />
      )}
    </button>
  );
}
