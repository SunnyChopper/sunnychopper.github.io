import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { AssistantToolApprovalMode, AssistantToolRegistryEntry } from '@/types/api-contracts';

const MODE_OPTIONS: { value: AssistantToolApprovalMode; label: string; hint: string }[] = [
  {
    value: 'dangerousOnly',
    label: 'Confirm dangerous tools only',
    hint: 'Only tools you mark below require an in-chat approval before they run.',
  },
  {
    value: 'allWrites',
    label: 'Confirm all write actions',
    hint: 'Every tool that changes data needs your approval in the assistant chat.',
  },
  {
    value: 'none',
    label: 'Auto-approve everything',
    hint: 'No approval prompts; the assistant runs write tools as soon as the model plans them.',
  },
];

export function AssistantToolApprovalSettings() {
  const [mode, setMode] = useState<AssistantToolApprovalMode>('dangerousOnly');
  const [dangerousSet, setDangerousSet] = useState<Set<string>>(() => new Set());
  const [registry, setRegistry] = useState<AssistantToolRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      const [cfgRes, regRes] = await Promise.all([
        apiClient.getAssistantToolApprovalConfig(),
        apiClient.getAssistantToolRegistry(),
      ]);
      if (cancelled) return;
      if (regRes.success && regRes.data) {
        setRegistry(regRes.data);
      } else {
        setError(regRes.error?.message ?? 'Failed to load tool list');
      }
      if (cfgRes.success && cfgRes.data) {
        setMode(cfgRes.data.mode);
        setDangerousSet(new Set(cfgRes.data.dangerousTools));
      } else if (!cfgRes.success) {
        setError(cfgRes.error?.message ?? 'Failed to load approval settings');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const writeToolsByCategory = useMemo(() => {
    const m = new Map<string, AssistantToolRegistryEntry[]>();
    for (const t of registry.filter((x) => !x.safeRead)) {
      const list = m.get(t.category) ?? [];
      list.push(t);
      m.set(t.category, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [registry]);

  const toggleTool = useCallback((name: string) => {
    setDangerousSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    setSavedOk(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const res = await apiClient.setAssistantToolApprovalConfig({
      mode,
      dangerousTools: Array.from(dangerousSet),
    });
    setSaving(false);
    if (res.success && res.data) {
      setMode(res.data.mode);
      setDangerousSet(new Set(res.data.dangerousTools));
      setSavedOk(true);
    } else {
      setError(res.error?.message ?? 'Save failed');
    }
  }, [dangerousSet, mode]);

  if (loading) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Loading assistant safety settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Assistant tool safety
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Control when the Personal OS Assistant must ask you to approve a tool before it runs.
          Approvals appear in the chat execution trace while a reply is streaming.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {savedOk && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
          Settings saved.
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Approval mode
        </legend>
        {MODE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer gap-3 rounded-lg border-2 p-3 transition ${
              mode === opt.value
                ? 'border-blue-500 bg-blue-50/80 dark:border-blue-600 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="assistant-hitl-mode"
              value={opt.value}
              checked={mode === opt.value}
              onChange={() => {
                setMode(opt.value);
                setSavedOk(false);
              }}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{opt.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{opt.hint}</div>
            </div>
          </label>
        ))}
      </fieldset>

      {mode === 'dangerousOnly' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Tools that require approval
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Checked write tools will trigger an in-chat approve / reject step. Read-only tools are
            never listed here.
          </p>
          {writeToolsByCategory.map(([category, tools]) => (
            <div key={category}>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                {category}
              </div>
              <ul className="space-y-2">
                {tools.map((t) => (
                  <li key={t.name}>
                    <label className="flex items-start gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={dangerousSet.has(t.name)}
                        onChange={() => toggleTool(t.name)}
                        className="mt-0.5 rounded border-gray-300 dark:border-gray-600"
                      />
                      <span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                          {t.name}
                        </code>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          {t.description}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}
