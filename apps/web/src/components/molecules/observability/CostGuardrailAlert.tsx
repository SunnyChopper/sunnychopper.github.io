import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CostGuardrailAlertProps = {
  messages: string[];
  className?: string;
  action?: ReactNode;
};

export default function CostGuardrailAlert({
  messages,
  className,
  action,
}: CostGuardrailAlertProps) {
  if (!messages.length) return null;

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100',
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        {messages.map((msg) => (
          <p key={msg}>{msg}</p>
        ))}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
