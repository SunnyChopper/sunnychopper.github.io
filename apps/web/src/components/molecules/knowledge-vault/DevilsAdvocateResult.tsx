import { useId, useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronRight, Info } from 'lucide-react';

import {
  formatCritiqueBullet,
  formatSectionItemCount,
  getDevilsAdvocateNonEmptySections,
  normalizeDevilsAdvocatePayload,
  type DevilsAdvocateIconKey,
  type DevilsAdvocateSectionView,
  type DevilsAdvocateSeverity,
} from '@/lib/knowledge-vault/devils-advocate-result';
import { cn } from '@/lib/utils';

const severityStyles: Record<
  DevilsAdvocateSeverity,
  {
    border: string;
    headerBg: string;
    icon: string;
    accent: string;
  }
> = {
  critical: {
    border: 'border-red-200 dark:border-red-800',
    headerBg: 'bg-red-50/80 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    accent: 'bg-red-500',
  },
  warning: {
    border: 'border-orange-200 dark:border-orange-800',
    headerBg: 'bg-orange-50/80 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    accent: 'bg-orange-500',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800',
    headerBg: 'bg-blue-50/80 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-500',
  },
};

const iconComponents: Record<
  DevilsAdvocateIconKey,
  typeof AlertCircle | typeof AlertTriangle | typeof Info
> = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
};

interface DevilsAdvocateResultProps {
  data: unknown;
  className?: string;
}

function DevilsAdvocateSectionRow({ section }: { section: DevilsAdvocateSectionView }) {
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();
  const panelId = `${headingId}-panel`;
  const styles = severityStyles[section.severity];
  const Icon = iconComponents[section.icon];

  return (
    <div className={cn('overflow-hidden rounded-lg border', styles.border, styles.headerBg)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className={cn('w-1 self-stretch shrink-0 rounded-full', styles.accent)} aria-hidden />
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        )}
        <Icon className={cn('h-4 w-4 shrink-0', styles.icon)} aria-hidden />
        <span
          id={headingId}
          className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white"
        >
          {section.label}
        </span>
        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {formatSectionItemCount(section.items.length)}
        </span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="border-t border-gray-200/80 bg-white/70 px-3 py-2 dark:border-gray-700/80 dark:bg-gray-900/40"
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-800 dark:text-gray-200">
            {section.items.map((item, index) => {
              const { lead, body } = formatCritiqueBullet(item);
              return (
                <li key={`${section.key}-${index}`}>
                  {lead ? (
                    <>
                      <span className="font-medium">{lead}</span> {body}
                    </>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DevilsAdvocateResult({ data, className }: DevilsAdvocateResultProps) {
  const payload = normalizeDevilsAdvocatePayload(data);
  const sections = getDevilsAdvocateNonEmptySections(payload);

  if (sections.length === 0) {
    return (
      <p className={cn('text-xs text-gray-500 dark:text-gray-400', className)}>
        No critique sections returned.
      </p>
    );
  }

  return (
    <div className={cn('max-h-48 space-y-2 overflow-auto', className)}>
      {sections.map((section) => (
        <DevilsAdvocateSectionRow key={section.key} section={section} />
      ))}
    </div>
  );
}
