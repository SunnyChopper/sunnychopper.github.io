import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { ApprovalModeRadioCard } from '@/components/molecules/settings/ApprovalModeRadioCard';
import { assistantSettingsNestedPanelClassName } from '@/components/molecules/settings/assistant-settings-surfaces';
import { ToolApprovalCategoryAccordion } from '@/components/molecules/settings/ToolApprovalCategoryAccordion';
import {
  MODE_OPTIONS,
  toolApprovalSearchClassName,
  toolApprovalToolbarButtonClassName,
} from '@/lib/settings/assistant-tool-approval-ui';
import type { AssistantToolApprovalMode, AssistantToolRegistryEntry } from '@/types/api-contracts';

export type AssistantToolApprovalFormProps = {
  mode: AssistantToolApprovalMode;
  dangerousSet: Set<string>;
  deniedReadSet: Set<string>;
  registry: AssistantToolRegistryEntry[];
  onModeChange: (mode: AssistantToolApprovalMode) => void;
  onDangerousSetChange: (next: Set<string>) => void;
  onDeniedReadSetChange: (next: Set<string>) => void;
  onFormInteraction?: () => void;
};

function groupToolsByCategory(
  registry: AssistantToolRegistryEntry[],
  safeRead: boolean
): [string, AssistantToolRegistryEntry[]][] {
  const m = new Map<string, AssistantToolRegistryEntry[]>();
  for (const t of registry.filter((x) => x.safeRead === safeRead)) {
    const list = m.get(t.category) ?? [];
    list.push(t);
    m.set(t.category, list);
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function filterToolCategories(
  categories: [string, AssistantToolRegistryEntry[]][],
  query: string
): [string, AssistantToolRegistryEntry[]][] {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map(([category, tools]) => {
      const filtered = tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
      return [category, filtered] as [string, AssistantToolRegistryEntry[]];
    })
    .filter(([, tools]) => tools.length > 0);
}

type ToolPanelProps = {
  title: string;
  description: string;
  categories: [string, AssistantToolRegistryEntry[]][];
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  isToolChecked: (name: string) => boolean;
  onToggleTool: (name: string) => void;
  countSelected: (tools: AssistantToolRegistryEntry[]) => number;
  disabled?: boolean;
  toolSearch: string;
  onToolSearchChange: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

function ToolPanel({
  title,
  description,
  categories,
  expandedCategories,
  onToggleCategory,
  isToolChecked,
  onToggleTool,
  countSelected,
  disabled = false,
  toolSearch,
  onToolSearchChange,
  onExpandAll,
  onCollapseAll,
}: ToolPanelProps) {
  return (
    <div className={assistantSettingsNestedPanelClassName}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-1 max-w-xl text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex shrink-0 gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onExpandAll}
            className={toolApprovalToolbarButtonClassName}
            aria-label="Expand all tool categories"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className={toolApprovalToolbarButtonClassName}
            aria-label="Collapse all tool categories"
          >
            Collapse all
          </button>
        </div>

        <label className={`col-span-full ${toolApprovalSearchClassName}`}>
          <Search size={16} className="shrink-0 text-gray-500" aria-hidden />
          <input
            type="search"
            value={toolSearch}
            onChange={(e) => onToolSearchChange(e.target.value)}
            placeholder="Filter tools by name or description…"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100"
            autoComplete="off"
            aria-label="Filter tools by name or description"
          />
        </label>

        <div className="col-span-full -mr-1 max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No tools match your filter.
            </p>
          ) : (
            categories.map(([category, tools]) => (
              <ToolApprovalCategoryAccordion
                key={category}
                category={category}
                tools={tools}
                approvedCount={countSelected(tools)}
                isOpen={expandedCategories.has(category)}
                isToolChecked={isToolChecked}
                onToggleCategory={onToggleCategory}
                onToggleTool={onToggleTool}
                disabled={disabled}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function AssistantToolApprovalForm({
  mode,
  dangerousSet,
  deniedReadSet,
  registry,
  onModeChange,
  onDangerousSetChange,
  onDeniedReadSetChange,
  onFormInteraction,
}: AssistantToolApprovalFormProps) {
  const [readSearch, setReadSearch] = useState('');
  const [writeSearch, setWriteSearch] = useState('');
  const [expandedReadCategories, setExpandedReadCategories] = useState<Set<string>>(
    () => new Set()
  );
  const [expandedWriteCategories, setExpandedWriteCategories] = useState<Set<string>>(
    () => new Set()
  );
  const didSeedWriteExpanded = useRef(false);

  const readToolsByCategory = useMemo(() => groupToolsByCategory(registry, true), [registry]);
  const writeToolsByCategory = useMemo(() => groupToolsByCategory(registry, false), [registry]);

  const filteredReadCategories = useMemo(
    () => filterToolCategories(readToolsByCategory, readSearch),
    [readToolsByCategory, readSearch]
  );
  const filteredWriteCategories = useMemo(
    () => filterToolCategories(writeToolsByCategory, writeSearch),
    [writeToolsByCategory, writeSearch]
  );

  useEffect(() => {
    if (didSeedWriteExpanded.current || mode !== 'dangerousOnly') return;
    const initial = new Set<string>();
    for (const [cat, tools] of writeToolsByCategory) {
      if (tools.some((t) => dangerousSet.has(t.name))) {
        initial.add(cat);
      }
    }
    if (initial.size > 0) {
      didSeedWriteExpanded.current = true;
      setExpandedWriteCategories(initial);
    }
  }, [mode, writeToolsByCategory, dangerousSet]);

  const toggleReadCategory = useCallback((category: string) => {
    setExpandedReadCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const toggleWriteCategory = useCallback((category: string) => {
    setExpandedWriteCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const toggleDangerousTool = useCallback(
    (name: string) => {
      const next = new Set(dangerousSet);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      onDangerousSetChange(next);
      onFormInteraction?.();
    },
    [dangerousSet, onDangerousSetChange, onFormInteraction]
  );

  const toggleDeniedReadTool = useCallback(
    (name: string) => {
      const next = new Set(deniedReadSet);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      onDeniedReadSetChange(next);
      onFormInteraction?.();
    },
    [deniedReadSet, onDeniedReadSetChange, onFormInteraction]
  );

  const handleModeSelect = useCallback(
    (nextMode: AssistantToolApprovalMode) => {
      onModeChange(nextMode);
      onFormInteraction?.();
    },
    [onModeChange, onFormInteraction]
  );

  const showWritePanel = mode === 'dangerousOnly' || mode === 'allWrites';
  const writePanelDisabled = mode === 'allWrites';

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Approval mode
        </legend>
        <p className="-mt-1 mb-1 text-xs text-gray-600 dark:text-gray-400">
          Read tools run automatically unless you block them below. Write tools follow the mode you
          pick.
        </p>
        <div className="space-y-2.5">
          {MODE_OPTIONS.map((opt) => (
            <ApprovalModeRadioCard
              key={opt.value}
              option={opt}
              selected={mode === opt.value}
              name="assistant-hitl-mode"
              onSelect={handleModeSelect}
            />
          ))}
        </div>
      </fieldset>

      <ToolPanel
        title="Read tools"
        description={
          mode === 'none'
            ? 'Auto-approve mode runs all tools; these toggles apply when you switch back to a confirm mode.'
            : 'Checked tools are allowed to run without asking. Uncheck to block a read tool.'
        }
        categories={filteredReadCategories}
        expandedCategories={expandedReadCategories}
        onToggleCategory={toggleReadCategory}
        isToolChecked={(name) => !deniedReadSet.has(name)}
        onToggleTool={toggleDeniedReadTool}
        countSelected={(tools) => tools.filter((t) => !deniedReadSet.has(t.name)).length}
        disabled={mode === 'none'}
        toolSearch={readSearch}
        onToolSearchChange={setReadSearch}
        onExpandAll={() =>
          setExpandedReadCategories(new Set(filteredReadCategories.map(([c]) => c)))
        }
        onCollapseAll={() => setExpandedReadCategories(new Set())}
      />

      {showWritePanel && (
        <ToolPanel
          title="Write tools"
          description={
            mode === 'allWrites'
              ? 'All write tools require in-chat approval before they run.'
              : 'Checked write tools trigger an in-chat approve / reject step.'
          }
          categories={filteredWriteCategories}
          expandedCategories={expandedWriteCategories}
          onToggleCategory={toggleWriteCategory}
          isToolChecked={(name) => (mode === 'allWrites' ? true : dangerousSet.has(name))}
          onToggleTool={toggleDangerousTool}
          countSelected={(tools) =>
            mode === 'allWrites'
              ? tools.length
              : tools.filter((t) => dangerousSet.has(t.name)).length
          }
          disabled={writePanelDisabled}
          toolSearch={writeSearch}
          onToolSearchChange={setWriteSearch}
          onExpandAll={() =>
            setExpandedWriteCategories(new Set(filteredWriteCategories.map(([c]) => c)))
          }
          onCollapseAll={() => setExpandedWriteCategories(new Set())}
        />
      )}
    </div>
  );
}
