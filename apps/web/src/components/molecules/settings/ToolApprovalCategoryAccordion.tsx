import { motion, useReducedMotion } from 'framer-motion';
import { ToolApprovalCategoryHeader } from '@/components/molecules/settings/ToolApprovalCategoryHeader';
import { ToolApprovalToolRow } from '@/components/molecules/settings/ToolApprovalToolRow';
import type { AssistantToolRegistryEntry } from '@/types/api-contracts';

export type ToolApprovalCategoryAccordionProps = {
  category: string;
  tools: AssistantToolRegistryEntry[];
  approvedCount: number;
  isOpen: boolean;
  isToolChecked: (name: string) => boolean;
  onToggleCategory: (category: string) => void;
  onToggleTool: (name: string) => void;
  disabled?: boolean;
};

export function ToolApprovalCategoryAccordion({
  category,
  tools,
  approvedCount,
  isOpen,
  isToolChecked,
  onToggleCategory,
  onToggleTool,
  disabled = false,
}: ToolApprovalCategoryAccordionProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelId = `tool-approval-panel-${category.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 dark:border-gray-600/80">
      <ToolApprovalCategoryHeader
        category={category}
        approvedCount={approvedCount}
        totalCount={tools.length}
        isOpen={isOpen}
        panelId={panelId}
        onToggle={() => onToggleCategory(category)}
        reduceMotion={shouldReduceMotion ?? false}
      />
      <motion.div
        id={panelId}
        role="region"
        aria-label={`${category} tools`}
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
        data-testid={`tool-approval-panel-${panelId}`}
        data-panel-open={isOpen ? 'true' : 'false'}
      >
        <ul className="divide-y divide-gray-100 border-t border-gray-200/80 bg-white dark:divide-gray-700/80 dark:border-gray-600/80 dark:bg-gray-800/30">
          {tools.map((tool) => (
            <ToolApprovalToolRow
              key={tool.name}
              tool={tool}
              checked={isToolChecked(tool.name)}
              onToggle={onToggleTool}
              disabled={disabled}
            />
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
