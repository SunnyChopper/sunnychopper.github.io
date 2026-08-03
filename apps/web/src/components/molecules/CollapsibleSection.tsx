import { useId, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/atoms/Card';
import { cn } from '@/lib/utils';

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Optional summary shown on the right side of the header when collapsed. */
  summary?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  /** Animate height/opacity on expand/collapse; respects prefers-reduced-motion. */
  animated?: boolean;
};

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  summary,
  className,
  headerClassName,
  bodyClassName,
  animated = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();
  const headingId = useId();
  const panelId = `${headingId}-panel`;

  const headerButton = (
    <button
      type="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className="flex w-full items-center gap-2 rounded text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      aria-expanded={isOpen}
      aria-controls={panelId}
    >
      {isOpen ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      )}
      <span
        id={headingId}
        className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white"
      >
        {title}
      </span>
      {!isOpen && summary != null && (
        <span className="max-w-[50%] truncate text-xs text-gray-500 dark:text-gray-400">
          {summary}
        </span>
      )}
    </button>
  );

  if (!animated) {
    return (
      <Card className={className}>
        <CardHeader className={cn('py-2.5 sm:py-3', headerClassName)}>{headerButton}</CardHeader>
        {isOpen && (
          <CardBody id={panelId} className={cn('pt-0', bodyClassName)}>
            {children}
          </CardBody>
        )}
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={cn('py-2.5 sm:py-3', headerClassName)}>{headerButton}</CardHeader>
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        initial={false}
        animate={
          shouldReduceMotion
            ? { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }
            : isOpen
              ? 'visible'
              : 'hidden'
        }
        variants={{
          visible: {
            height: 'auto',
            opacity: 1,
            transition: { duration: 0.2, ease: 'easeOut' },
          },
          hidden: {
            height: 0,
            opacity: 0,
            transition: { duration: 0.2, ease: 'easeOut' },
          },
        }}
        className="overflow-hidden"
      >
        <CardBody className={cn('pt-0', bodyClassName)}>{children}</CardBody>
      </motion.div>
    </Card>
  );
}
