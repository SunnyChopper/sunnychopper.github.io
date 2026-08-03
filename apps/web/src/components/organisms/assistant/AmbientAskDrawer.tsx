import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Send, X } from 'lucide-react';

import MarkdownRenderer from '@/components/molecules/MarkdownRenderer';
import OverlayPortal from '@/components/molecules/OverlayPortal';
import { AIThinkingIndicator } from '@/components/atoms/AIThinkingIndicator';
import { Textarea } from '@/components/atoms/Textarea';
import { useAmbientAsk } from '@/contexts/AmbientAskContext';
import { useBranchSelection } from '@/hooks/chatbot/useBranchSelection';
import { useMessageTree } from '@/hooks/chatbot/useChatMessages';
import { useChatThreadMutations } from '@/hooks/chatbot/useChatMutations';
import { useAssistantStreaming } from '@/hooks/useAssistantStreaming';
import {
  draftFromDefaultModels,
  runConfigFromModelPickerDraft,
} from '@/lib/assistant/run-config-picker-draft';
import { chatMessageMarkdownComponents } from '@/lib/markdown/chat-message-markdown-components';
import { overlayBackdropClassName, overlaySurfaceClassName } from '@/lib/overlay-layer';
import { queryKeys } from '@/lib/react-query/query-keys';
import { chatbotService } from '@/services/chatbot.service';
import type { AmbientAskSession } from '@/types/chatbot';
import { buildWhisperThreadTitle } from '@/lib/chat/whisper-thread-title';
import { chatTranscriptBgClassName } from '@/lib/chat/imessage-surfaces';
import { cn } from '@/lib/utils';
import { ChatBubble } from '@/components/molecules/chat/ChatBubble';
import {
  getClusterGapClassName,
  getClusterPosition,
  type MessageRole,
} from '@/lib/chat/message-cluster';

const AMBIENT_SOURCE = 'ambientPresence' as const;

interface AmbientAskDrawerProps {
  session: AmbientAskSession;
  onClose: () => void;
}

function buildAmbientWireMessage(askPrompt: string, question: string): string {
  return `# Ambient context\n\n${askPrompt}\n\n## Question\n\n${question}`;
}

export function AmbientAskDrawer({ session, onClose }: AmbientAskDrawerProps) {
  const { setThreadId, setThreadCreating, setThreadError } = useAmbientAsk();
  const { createThread } = useChatThreadMutations();
  const [composerValue, setComposerValue] = useState('');
  const [seeded, setSeeded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadId = session.threadId;

  useEffect(() => {
    let cancelled = false;
    const create = async () => {
      if (session.threadId) return;
      setThreadCreating(true);
      try {
        const thread = await createThread({
          title: buildWhisperThreadTitle(session.title),
          whisperOriginated: true,
        });
        if (!cancelled) {
          setThreadId(thread.id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setThreadError(err instanceof Error ? err.message : 'Failed to start whisper chat');
        }
      }
    };
    void create();
    return () => {
      cancelled = true;
    };
  }, [
    createThread,
    session.threadId,
    session.title,
    setThreadCreating,
    setThreadError,
    setThreadId,
  ]);

  const modelCatalogQuery = useQuery({
    queryKey: queryKeys.chatbot.modelCatalog(),
    queryFn: () => chatbotService.getAssistantModelCatalog(),
    staleTime: 5 * 60 * 1000,
  });

  const runConfig = useMemo(() => {
    const draft = draftFromDefaultModels(null, modelCatalogQuery.data ?? null);
    return runConfigFromModelPickerDraft(draft, modelCatalogQuery.data ?? null);
  }, [modelCatalogQuery.data]);

  const { tree, nodeById } = useMessageTree(threadId ?? undefined);
  const { selectedLeafId, transcript, setSelectedLeafId } = useBranchSelection({
    threadId: threadId ?? undefined,
    tree,
    nodeById,
  });

  const {
    sendUserMessage,
    isStreaming,
    isAwaitingRunStart,
    connectionState,
    runs,
    reconnect,
    error: streamError,
  } = useAssistantStreaming(threadId ?? undefined);

  const isSendBlocked =
    !threadId ||
    session.isCreatingThread ||
    Boolean(session.threadError) ||
    isStreaming ||
    isAwaitingRunStart ||
    connectionState === 'connecting' ||
    (connectionState === 'failed' && Boolean(streamError));

  const handleSend = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || !threadId || isSendBlocked) return;

      sendUserMessage({
        content: buildAmbientWireMessage(session.askPrompt, trimmed),
        parentId: selectedLeafId,
        metadata: {
          source: AMBIENT_SOURCE,
          ...(runConfig ? { assistantModelConfig: runConfig } : {}),
        },
        runConfig,
      });
      setComposerValue('');
    },
    [
      isSendBlocked,
      runConfig,
      selectedLeafId,
      sendUserMessage,
      session.askPrompt,
      session.surface,
      threadId,
    ]
  );

  useEffect(() => {
    if (!threadId || seeded || isSendBlocked) return;
    setSeeded(true);
    handleSend(session.askPrompt);
  }, [handleSend, isSendBlocked, seeded, session.askPrompt, threadId]);

  useEffect(() => {
    if (!tree?.leafIds?.length) return;
    const latestLeaf = tree.leafIds.reduce((best, leafId) => {
      const bestTime = new Date(nodeById.get(best)?.createdAt ?? 0).getTime();
      const leafTime = new Date(nodeById.get(leafId)?.createdAt ?? 0).getTime();
      return leafTime >= bestTime ? leafId : best;
    }, tree.leafIds[0]);
    if (latestLeaf && latestLeaf !== selectedLeafId) {
      setSelectedLeafId(latestLeaf);
    }
  }, [nodeById, selectedLeafId, setSelectedLeafId, tree?.leafIds]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length, isStreaming, isAwaitingRunStart]);

  const activeAssistantContent = useMemo(() => {
    const activeRuns = Object.values(runs).filter((run) => run.threadId === threadId);
    if (activeRuns.length === 0) return '';
    const latest = activeRuns.reduce((best, run) =>
      run.runStartedAt >= best.runStartedAt ? run : best
    );
    return latest.buffer ?? '';
  }, [runs, threadId]);

  return (
    <OverlayPortal>
      <div
        className={cn('fixed inset-0 bg-black/50 transition-opacity', overlayBackdropClassName)}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close whisper chat"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={cn(
          'fixed right-0 top-0 bottom-0 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900',
          overlaySurfaceClassName
        )}
        aria-label="Assistant whisper"
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-300">
              Assistant whisper
            </p>
            <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {session.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className={cn('flex-1 overflow-y-auto px-3 py-3', chatTranscriptBgClassName)}>
          {session.threadError ? (
            <p className="text-sm text-rose-400">{session.threadError}</p>
          ) : null}
          {session.isCreatingThread ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting mini-conversation…
            </div>
          ) : null}
          {transcript.map((node, index) => {
            const isUser = node.role === 'user';
            const text =
              node.content?.replace(/^# Ambient context[\s\S]*?## Question\n\n/, '') ??
              node.content;
            const prev = index > 0 ? transcript[index - 1] : null;
            const next = index < transcript.length - 1 ? transcript[index + 1] : null;
            const role = node.role as MessageRole;
            const clusterPosition = getClusterPosition(
              (prev?.role as MessageRole) ?? null,
              role,
              (next?.role as MessageRole) ?? null
            );
            const gapClass = getClusterGapClassName((prev?.role as MessageRole) ?? null, role);
            return (
              <div key={node.id} className={gapClass}>
                <ChatBubble role={role} clusterPosition={clusterPosition} density="compact">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <MarkdownRenderer
                      content={node.content}
                      components={chatMessageMarkdownComponents}
                    />
                  )}
                </ChatBubble>
              </div>
            );
          })}
          {(isStreaming || isAwaitingRunStart) && activeAssistantContent ? (
            <div className="mt-3">
              <ChatBubble role="assistant" clusterPosition="solo" density="compact">
                <MarkdownRenderer
                  content={activeAssistantContent}
                  components={chatMessageMarkdownComponents}
                />
              </ChatBubble>
            </div>
          ) : null}
          {(isStreaming || isAwaitingRunStart) && !activeAssistantContent ? (
            <div className="mt-3">
              <AIThinkingIndicator message="Assistant is thinking…" />
            </div>
          ) : null}
          {streamError ? (
            <div className="text-sm text-rose-600 dark:text-rose-400">
              {streamError.message}{' '}
              <button type="button" className="underline" onClick={() => reconnect()}>
                Retry
              </button>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <footer className="border-t border-gray-200 p-3 dark:border-gray-700">
          <div className="flex gap-2">
            <Textarea
              value={composerValue}
              onChange={(e) => setComposerValue(e.target.value)}
              placeholder="Follow up…"
              rows={2}
              className="min-h-[44px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(composerValue);
                }
              }}
              disabled={isSendBlocked}
            />
            <button
              type="button"
              onClick={() => handleSend(composerValue)}
              disabled={isSendBlocked || !composerValue.trim()}
              className="self-end rounded-md bg-violet-700 p-2 text-white hover:bg-violet-800 disabled:opacity-50 dark:bg-violet-600"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </motion.aside>
    </OverlayPortal>
  );
}
