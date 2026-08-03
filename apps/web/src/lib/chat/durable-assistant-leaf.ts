import type { ChatMessage } from '@/types/chatbot';

/** Server-persisted assistant message ids use the ``msg-`` prefix. */
export function isDurableAssistantMessageId(messageId: string | null | undefined): boolean {
  if (!messageId) {
    return false;
  }
  if (messageId.startsWith('client-user-') || messageId.startsWith('client-')) {
    return false;
  }
  return messageId.startsWith('msg-');
}

/**
 * Leaf eligible for ``POST /assistant/threads/{id}/context-usage`` (must exist in Dynamo).
 */
export function isDurableContextUsageLeaf(
  leafId: string | null | undefined,
  nodeById?: Map<string, ChatMessage>
): boolean {
  if (!isDurableAssistantMessageId(leafId)) {
    return false;
  }
  if (nodeById && leafId) {
    const node = nodeById.get(leafId);
    if (node?.clientStatus === 'sending') {
      return false;
    }
  }
  return true;
}

/**
 * Prefer the selected branch leaf when durable; otherwise fall back to thread active leaf.
 */
export function resolveDurableContextUsageLeaf(
  selectedLeafId: string | null | undefined,
  activeLeafMessageId: string | null | undefined,
  nodeById?: Map<string, ChatMessage>
): string | null {
  if (isDurableContextUsageLeaf(selectedLeafId, nodeById)) {
    return selectedLeafId ?? null;
  }
  if (isDurableContextUsageLeaf(activeLeafMessageId, nodeById)) {
    return activeLeafMessageId ?? null;
  }
  return null;
}
