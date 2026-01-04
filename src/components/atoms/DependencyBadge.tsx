import { Link2, AlertCircle } from 'lucide-react';

interface DependencyBadgeProps {
  type: 'blocked' | 'blocking';
  count: number;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

export function DependencyBadge({ type, count, onClick, size = 'md', className = '' }: DependencyBadgeProps) {
  if (count === 0) return null;

  const isBlocked = type === 'blocked';
  const bgColor = isBlocked
    ? 'bg-red-100 dark:bg-red-900/30'
    : 'bg-blue-100 dark:bg-blue-900/30';
  const textColor = isBlocked
    ? 'text-red-700 dark:text-red-400'
    : 'text-blue-700 dark:text-blue-400';
  const hoverColor = onClick
    ? isBlocked
      ? 'hover:bg-red-200 dark:hover:bg-red-900/50'
      : 'hover:bg-blue-200 dark:hover:bg-blue-900/50'
    : '';

  const Icon = isBlocked ? AlertCircle : Link2;
  const label = isBlocked ? `Blocked by ${count}` : `Blocking ${count}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center rounded-full font-medium transition-colors ${bgColor} ${textColor} ${hoverColor} ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{label}</span>
    </button>
  );
}
