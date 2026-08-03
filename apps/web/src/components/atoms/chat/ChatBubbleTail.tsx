import { cn } from '@/lib/utils';

type ChatBubbleTailProps = {
  role: 'user' | 'assistant';
  className?: string;
};

/** SVG tail mimicking iMessage bubble corner (last/solo cluster only). */
export function ChatBubbleTail({ role, className }: ChatBubbleTailProps) {
  const isUser = role === 'user';
  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-0 h-[17px] w-[15px]',
        isUser ? '-right-[5px]' : '-left-[5px]',
        className
      )}
      viewBox="0 0 15 17"
      fill="none"
    >
      {isUser ? (
        <path d="M15 17C15 17 10.5 14.5 6 10.5C2 7 0 0 0 0H15V17Z" className="fill-[#0A84FF]" />
      ) : (
        <path
          d="M0 17C0 17 4.5 14.5 9 10.5C13 7 15 0 15 0H0V17Z"
          className="fill-[#E9E9EB] dark:fill-[#1C1C1E]"
        />
      )}
    </svg>
  );
}
