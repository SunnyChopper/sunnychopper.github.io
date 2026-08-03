import type { ReactNode } from 'react';
import { ChatBubbleTail } from '@/components/atoms/chat/ChatBubbleTail';
import { getBubbleSurfaceClassName, showBubbleTail } from '@/lib/chat/imessage-surfaces';
import type { ClusterPosition } from '@/lib/chat/message-cluster';
import { cn } from '@/lib/utils';

export type ChatBubbleProps = {
  role: 'user' | 'assistant';
  clusterPosition: ClusterPosition;
  density?: 'default' | 'compact';
  className?: string;
  children: ReactNode;
};

export function ChatBubble({
  role,
  clusterPosition,
  density = 'default',
  className,
  children,
}: ChatBubbleProps) {
  const align = role === 'user' ? 'ml-auto' : 'mr-auto';
  const showTail = showBubbleTail(role, clusterPosition);

  return (
    <div
      className={cn('flex w-full', role === 'user' ? 'justify-end' : 'justify-start', className)}
    >
      <div
        className={cn(getBubbleSurfaceClassName(role, clusterPosition, density), align)}
        role={role === 'assistant' ? 'article' : undefined}
        aria-label={role === 'assistant' ? 'Assistant message' : undefined}
      >
        {children}
        {showTail ? <ChatBubbleTail role={role} /> : null}
      </div>
    </div>
  );
}
