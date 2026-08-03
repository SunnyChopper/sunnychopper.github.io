type AssistantNavUnreadBadgeProps = {
  count: number;
};

export function AssistantNavUnreadBadge({ count }: AssistantNavUnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? '99+' : String(count);

  return (
    <span
      className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
      aria-label={`${count} unread assistant messages`}
    >
      {label}
    </span>
  );
}
