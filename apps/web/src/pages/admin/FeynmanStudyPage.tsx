import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer';
import { FeynmanClarityBar } from '@/components/molecules/knowledge-vault/FeynmanClarityBar';
import { FeynmanExplanationHistoryStrip } from '@/components/molecules/knowledge-vault/FeynmanExplanationHistoryStrip';
import Button from '@/components/atoms/Button';
import { vaultItemsService } from '@/services/knowledge-vault/vault-items.service';
import { vaultPrimitivesService } from '@/services/knowledge-vault/vault-primitives.service';
import { apiClient } from '@/lib/api-client';
import { pushExplanationHistory } from '@/lib/knowledge-vault/feynman-explanation-history';
import type { FeynmanRespondResult, Note } from '@/types/knowledge-vault';
import { Textarea } from '@/components/atoms/Textarea';

export default function FeynmanStudyPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [log, setLog] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<FeynmanRespondResult | null>(null);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [explanationHistory, setExplanationHistory] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itemId) return;
    void (async () => {
      const res = await vaultItemsService.getById(itemId);
      if (res.success && res.data && res.data.type === 'note') {
        setNote(res.data as Note);
      }
    })();
  }, [itemId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, lastFeedback]);

  const start = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const res = await apiClient.post<{ initialPrompt: string }>('/knowledge/ai/feynman/start', {
        vaultItemId: itemId,
      });
      if (res.success && res.data?.initialPrompt) {
        setLog([{ role: 'assistant', content: String(res.data.initialPrompt) }]);
        setLastFeedback(null);
        setExplanationHistory([]);
        setFeedbackVersion((v) => v + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendExplanation = async (text: string) => {
    if (!itemId || !text.trim()) return;
    const trimmed = text.trim();
    const next = [...log, { role: 'user', content: trimmed }];
    setLog(next);
    setInput('');
    setLoading(true);
    setLastFeedback(null);
    try {
      const res = await vaultPrimitivesService.feynmanRespond(itemId, next);
      if (res.success && res.data) {
        setLastFeedback(res.data);
        setExplanationHistory((history) => pushExplanationHistory(history, trimmed));
        setFeedbackVersion((v) => v + 1);
        const fb = res.data.feedback ?? '';
        const fq = res.data.followUpQuestion ?? '';
        const line = [fb, fq].filter(Boolean).join('\n\n');
        if (line) setLog((l) => [...l, { role: 'assistant', content: line }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const send = () => void sendExplanation(input);

  const restoreExplanation = (text: string) => {
    setInput(text);
    void sendExplanation(text);
  };

  if (!itemId) {
    return <p className="p-6 text-red-600">Missing item</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] p-2 md:p-4 gap-3">
      <div className="flex items-center gap-3 shrink-0 px-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-bold leading-tight text-gray-900 dark:text-white">
            Feynman study
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] md:max-w-md">
            {note?.title ?? 'Loading…'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={() => void start()}
        >
          Start / reset prompt
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
        <div className="flex-1 min-h-[200px] md:min-h-0 min-w-0 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 bg-white dark:bg-gray-900">
          {note?.content ? (
            <MarkdownRenderer content={note.content} />
          ) : (
            <p className="text-gray-500 text-sm">Loading note…</p>
          )}
        </div>
        <div className="flex-1 min-h-[280px] min-w-0 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
          <FeynmanClarityBar
            clarityScore={lastFeedback?.clarityScore ?? null}
            jargonHighlights={lastFeedback?.jargonHighlights ?? []}
            feedbackVersion={feedbackVersion}
          />
          <FeynmanExplanationHistoryStrip
            explanations={explanationHistory}
            onSelect={restoreExplanation}
            disabled={loading}
          />
          <div className="flex-1 overflow-auto p-4 space-y-4 text-sm flex flex-col min-h-0">
            {log.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'self-end max-w-[85%] min-w-0 rounded-2xl rounded-tr-sm px-4 py-2.5 bg-blue-600 text-white shadow-sm'
                    : 'self-start max-w-[85%] min-w-0 rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                }
              >
                {m.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                ) : (
                  <MarkdownRenderer content={m.content} variant="chat" className="!prose-sm" />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-end shrink-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Explain the concept in your own words…"
              rows={1}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button type="button" onClick={send} disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
