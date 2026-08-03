import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Loader2, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer';
import OverlayPortal from '@/components/molecules/OverlayPortal';
import { AIThinkingIndicator } from '@/components/atoms/AIThinkingIndicator';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Textarea } from '@/components/atoms/Textarea';
import { useEntityExplainChat } from '@/contexts/EntityExplainChatContext';
import { useBranchSelection } from '@/hooks/chatbot/useBranchSelection';
import { useMessageTree } from '@/hooks/chatbot/useChatMessages';
import { useChatThreadMutations } from '@/hooks/chatbot/useChatMutations';
import { useAssistantStreaming } from '@/hooks/useAssistantStreaming';
import {
  buildEntityExplainWireMessage,
  displayTextForEntityExplainMessage,
} from '@/lib/entity-explain/build-entity-explain-context';
import { applyEntityExplainDesktopInset } from '@/lib/entity-explain/panel-inset';
import type { EntityExplainContext, EntityExplainRef } from '@/lib/entity-explain/types';
import {
  draftFromDefaultModels,
  runConfigFromModelPickerDraft,
} from '@/lib/assistant/run-config-picker-draft';
import { overlayBackdropClassName, overlaySurfaceClassName } from '@/lib/overlay-layer';
import { queryKeys } from '@/lib/react-query/query-keys';
import { chatMessageMarkdownComponents } from '@/lib/markdown/chat-message-markdown-components';
import { chatbotService } from '@/services/chatbot.service';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';
import { ChatBubble } from '@/components/molecules/chat/ChatBubble';
import {
  getClusterGapClassName,
  getClusterPosition,
  type MessageRole,
} from '@/lib/chat/message-cluster';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DRAWER_MOTION_MS = 0.18;

interface EntityExplainSession {
  ref: EntityExplainRef;
  context: EntityExplainContext;
  threadId: string | null;
  isCreatingThread: boolean;
  threadError: string | null;
}

interface EntityExplainChatDrawerProps {
  session: EntityExplainSession;
  onClose: () => void;
  restoreFocusRef: MutableRefObject<HTMLElement | null>;
}

function entityDisplayTitle(ref: EntityExplainRef): string {
  if (ref.entityType === 'project') {
    return (ref.entity as { name: string }).name;
  }
  return (ref.entity as { title: string }).title;
}

function SuggestionChipRow({
  chips,
  disabled,
  onSelect,
  className,
}: {
  chips: string[];
  disabled: boolean;
  onSelect: (chip: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="inline-flex min-h-9 max-w-full items-center rounded-full border border-gray-200/80 bg-gray-50/60 px-3 py-1.5 text-left text-xs font-medium text-gray-700 transition hover:border-blue-300/80 hover:bg-blue-50/80 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/80 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-blue-600/60 dark:hover:bg-blue-950/30 dark:hover:text-gray-100"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

export function EntityExplainChatDrawer({
  session,
  onClose,
  restoreFocusRef,
}: EntityExplainChatDrawerProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { setThreadId, setThreadCreating, setThreadError } = useEntityExplainChat();
  const { createThread } = useChatThreadMutations();
  const [composerValue, setComposerValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const threadId = session.threadId;

  useEffect(() => applyEntityExplainDesktopInset(), []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const syncOverflow = () => {
      document.body.style.overflow = mq.matches ? 'unset' : 'hidden';
    };
    syncOverflow();
    mq.addEventListener('change', syncOverflow);
    return () => {
      mq.removeEventListener('change', syncOverflow);
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const create = async () => {
      if (session.threadId) return;
      setThreadCreating(true);
      try {
        const thread = await createThread({ title: session.context.threadTitle });
        if (!cancelled) {
          setThreadId(thread.id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setThreadError(err instanceof Error ? err.message : 'Failed to start explain chat');
        }
      }
    };
    void create();
    return () => {
      cancelled = true;
    };
  }, [
    createThread,
    session.context.threadTitle,
    session.threadId,
    setThreadCreating,
    setThreadError,
    setThreadId,
  ]);

  useLayoutEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    };
  }, [onClose, restoreFocusRef]);

  const modelCatalogQuery = useQuery({
    queryKey: queryKeys.chatbot.modelCatalog(),
    queryFn: () => chatbotService.getAssistantModelCatalog(),
    staleTime: 5 * 60 * 1000,
  });

  const runConfig = useMemo(() => {
    const draft = draftFromDefaultModels(null, modelCatalogQuery.data ?? null);
    return runConfigFromModelPickerDraft(draft, modelCatalogQuery.data ?? null);
  }, [modelCatalogQuery.data]);

  const { tree, nodeById, isLoading: isLoadingMessages } = useMessageTree(threadId ?? undefined);
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
    connectionState === 'failed' ||
    connectionState === 'disconnected';

  const handleSend = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || !threadId || isSendBlocked) return;

      const wireContent = buildEntityExplainWireMessage(session.context, trimmed);
      const metadata = {
        ...session.context.metadata,
        ...(runConfig ? { assistantModelConfig: runConfig } : {}),
      };

      sendUserMessage({
        content: wireContent,
        parentId: selectedLeafId,
        metadata,
        runConfig,
      });
      setComposerValue('');
    },
    [isSendBlocked, runConfig, selectedLeafId, sendUserMessage, session.context, threadId]
  );

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
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [transcript.length, isStreaming, isAwaitingRunStart, shouldReduceMotion]);

  const activeAssistantContent = useMemo(() => {
    const activeRuns = Object.values(runs).filter((run) => run.threadId === threadId);
    if (activeRuns.length === 0) return '';
    const latest = activeRuns.reduce((best, run) =>
      run.runStartedAt >= best.runStartedAt ? run : best
    );
    return latest.buffer ?? '';
  }, [runs, threadId]);

  const showEmptyState = transcript.length === 0 && !isStreaming && !isAwaitingRunStart;
  const showFollowUpChips = !showEmptyState && session.context.suggestionChips.length > 0;

  const panelMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { type: 'spring' as const, damping: 28, stiffness: 320 },
      };

  const backdropMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DRAWER_MOTION_MS, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DRAWER_MOTION_MS, ease: 'easeOut' as const },
      };

  const headerMeta = session.context.headerMeta;

  return (
    <OverlayPortal>
      <motion.button
        type="button"
        {...backdropMotion}
        onClick={onClose}
        className={cn('fixed inset-0 bg-black/50 lg:hidden', overlayBackdropClassName)}
        aria-label="Close explain chat"
      />
      <motion.aside
        ref={panelRef}
        {...panelMotion}
        className={cn(
          'fixed right-0 top-0 bottom-0 flex w-full flex-col border-l border-gray-200/90 bg-white shadow-lg dark:border-gray-700/90 dark:bg-gray-900',
          'w-[22rem] max-w-[100vw]',
          overlaySurfaceClassName
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Explain with Assistant"
      >
        <header className="shrink-0 border-b border-gray-200/90 px-4 py-3 dark:border-gray-700/90">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {session.context.entityLabel}
              </p>
              <h2 className="mt-0.5 truncate text-base font-semibold text-gray-900 dark:text-white">
                {entityDisplayTitle(session.ref)}
              </h2>
              {headerMeta?.status || headerMeta?.projectLine ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {headerMeta.status ? <StatusBadge status={headerMeta.status} size="sm" /> : null}
                  {headerMeta.projectLine ? (
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {headerMeta.projectLine}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {session.threadError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {session.threadError}
            </p>
          ) : null}

          {session.isCreatingThread ? (
            <div className="flex items-center justify-center py-12">
              <AIThinkingIndicator message="Starting explain chat…" size="sm" />
            </div>
          ) : null}

          {!session.isCreatingThread && !session.threadError ? (
            <>
              {showEmptyState ? (
                <div className="mb-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tap a prompt or ask your own — card context is included when you send.
                  </p>
                  <SuggestionChipRow
                    chips={session.context.suggestionChips}
                    disabled={isSendBlocked}
                    onSelect={handleSend}
                  />
                </div>
              ) : null}

              {isLoadingMessages && transcript.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : null}

              <div className="space-y-0">
                {transcript.map((message, index) => {
                  const isUser = message.role === 'user';
                  const displayContent = isUser
                    ? displayTextForEntityExplainMessage(message)
                    : message.content;
                  const prev = index > 0 ? transcript[index - 1] : null;
                  const next = index < transcript.length - 1 ? transcript[index + 1] : null;
                  const role = message.role as MessageRole;
                  const clusterPosition = getClusterPosition(
                    (prev?.role as MessageRole) ?? null,
                    role,
                    (next?.role as MessageRole) ?? null
                  );
                  const gapClass = getClusterGapClassName(
                    (prev?.role as MessageRole) ?? null,
                    role
                  );
                  return (
                    <div key={message.id} className={gapClass}>
                      <ChatBubble role={role} clusterPosition={clusterPosition} density="compact">
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{displayContent}</p>
                        ) : (
                          <MarkdownRenderer
                            content={displayContent}
                            components={chatMessageMarkdownComponents}
                          />
                        )}
                      </ChatBubble>
                    </div>
                  );
                })}

                {(isStreaming || isAwaitingRunStart) && (
                  <div className="mt-3">
                    <ChatBubble role="assistant" clusterPosition="solo" density="compact">
                      {activeAssistantContent ? (
                        <MarkdownRenderer
                          content={activeAssistantContent}
                          components={chatMessageMarkdownComponents}
                        />
                      ) : (
                        <AIThinkingIndicator message="Thinking…" size="sm" />
                      )}
                    </ChatBubble>
                  </div>
                )}
              </div>
              <div ref={bottomRef} />
            </>
          ) : null}

          {streamError ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">{streamError.message}</p>
          ) : null}
          {connectionState === 'disconnected' || connectionState === 'failed' ? (
            <button
              type="button"
              onClick={() => reconnect()}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Reconnect assistant
            </button>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-gray-200/90 px-4 py-3 dark:border-gray-700/90">
          {showFollowUpChips ? (
            <SuggestionChipRow
              chips={session.context.suggestionChips}
              disabled={isSendBlocked}
              onSelect={handleSend}
              className="mb-2.5"
            />
          ) : null}
          <div className="flex items-end gap-2">
            <Textarea
              value={composerValue}
              onChange={(e) => setComposerValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(composerValue);
                }
              }}
              placeholder="Ask a follow-up…"
              rows={1}
              disabled={isSendBlocked}
              className="min-h-10 flex-1 resize-none border-gray-200/90 bg-gray-50/50 text-sm dark:border-gray-700/90 dark:bg-gray-800/50"
            />
            <button
              type="button"
              onClick={() => handleSend(composerValue)}
              disabled={isSendBlocked || !composerValue.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {threadId ? (
            <button
              type="button"
              onClick={() => {
                navigate(`${ROUTES.admin.assistant}/${threadId}`);
                onClose();
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Open in Assistant
              <ExternalLink className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
        </footer>
      </motion.aside>
    </OverlayPortal>
  );
}
