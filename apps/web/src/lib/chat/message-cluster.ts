export type ClusterPosition = 'solo' | 'first' | 'middle' | 'last';
export type MessageRole = 'user' | 'assistant';

export function getClusterPosition(
  prevRole: MessageRole | null,
  currentRole: MessageRole,
  nextRole: MessageRole | null
): ClusterPosition {
  const hasPrevSame = prevRole === currentRole;
  const hasNextSame = nextRole === currentRole;
  if (!hasPrevSame && !hasNextSame) return 'solo';
  if (!hasPrevSame && hasNextSame) return 'first';
  if (hasPrevSame && hasNextSame) return 'middle';
  return 'last';
}

/** Vertical gap between transcript rows (Tailwind mt-*). */
export function getClusterGapClassName(
  prevRole: MessageRole | null,
  currentRole: MessageRole
): string {
  if (prevRole === null) return '';
  if (prevRole === currentRole) return 'mt-0.5';
  return 'mt-3';
}
