import { useEffect, useRef, useState } from 'react';
import {
  MAX_FACT_CRITERIA_ITEMS,
  MAX_FACT_CRITERIA_ITEM_CHARS,
} from '@/lib/settings/assistantMemoryIngestionFactCriteria';
import { cn } from '@/lib/utils';

type FactCriteriaListEditorProps = {
  idPrefix: string;
  title: string;
  hint?: string;
  emptyMessage: string;
  items: string[];
  disabled?: boolean;
  onChange: (items: string[]) => void;
};

export function FactCriteriaListEditor({
  idPrefix,
  title,
  hint,
  emptyMessage,
  items,
  disabled,
  onChange,
}: FactCriteriaListEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setEditingIndex((current) => {
      if (current == null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const addItem = () => {
    if (items.length >= MAX_FACT_CRITERIA_ITEMS) return;
    const nextIndex = items.length;
    onChange([...items, '']);
    setEditingIndex(nextIndex);
    setFocusIndex(nextIndex);
  };

  const commitEdit = (index: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      removeItem(index);
      return;
    }
    if (trimmed !== items[index]) {
      updateItem(index, trimmed);
    }
    setEditingIndex(null);
  };

  useEffect(() => {
    if (focusIndex == null) return;
    const input = inputRefs.current.get(focusIndex);
    if (!input) return;
    requestAnimationFrame(() => {
      input.focus();
      setFocusIndex(null);
    });
  }, [focusIndex, items.length]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {items.length} / {MAX_FACT_CRITERIA_ITEMS}
        </span>
      </div>
      {hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {items.map((item, index) => {
            const isEditing = editingIndex === index || !item.trim();
            if (isEditing) {
              return (
                <li key={`${idPrefix}-${index}`} className="w-full min-w-[12rem] flex-1">
                  <input
                    ref={(node) => {
                      if (node) inputRefs.current.set(index, node);
                      else inputRefs.current.delete(index);
                    }}
                    id={`${idPrefix}-${index}`}
                    type="text"
                    className={inputClass}
                    value={item}
                    maxLength={MAX_FACT_CRITERIA_ITEM_CHARS}
                    disabled={disabled}
                    placeholder="Describe a rule…"
                    onChange={(e) => updateItem(index, e.target.value)}
                    onBlur={(e) => commitEdit(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitEdit(index, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        if (!item.trim()) {
                          removeItem(index);
                        } else {
                          setEditingIndex(null);
                        }
                      }
                    }}
                  />
                </li>
              );
            }

            return (
              <li key={`${idPrefix}-${index}`}>
                <span
                  className={cn(
                    'inline-flex max-w-full items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-100',
                    !disabled && 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                  title={item}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setEditingIndex(index)}
                    className="min-w-0 truncate text-left disabled:cursor-not-allowed"
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    aria-label="Remove rule"
                    disabled={disabled}
                    onClick={() => removeItem(index)}
                    className="shrink-0 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled || items.length >= MAX_FACT_CRITERIA_ITEMS}
        onClick={addItem}
        className="text-xs text-gray-500 hover:text-gray-800 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline dark:text-gray-400 dark:hover:text-gray-200 dark:disabled:hover:text-gray-400"
      >
        + Add rule
      </button>
    </div>
  );
}
