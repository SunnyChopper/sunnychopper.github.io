import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { AssistantWsConnectionState } from '@/lib/websocket/assistant-ws-client';
import { MessagesComposerBar } from '@/components/molecules/chat/MessagesComposerBar';
import { Loader2 } from 'lucide-react';
import { chatComposerShellClassName } from '@/lib/chat/imessage-surfaces';

/** Max textarea height (px); beyond this, content scrolls inside the field. */
const COMPOSER_TEXTAREA_MAX_HEIGHT_PX = 200;

export type ChatComposerHandle = {
  /** Programmatically set the input value (e.g. from starter suggestions). */
  setValue: (value: string) => void;
  /** Clear the input after a successful send. */
  clear: () => void;
};

type ChatComposerProps = {
  /** Called when the user submits; receives the trimmed message value. */
  onSend: (value: string) => void;
  isInputDisabled: boolean;
  isLocalDraft: boolean;
  connectionState: AssistantWsConnectionState;
  showReconnectingBanner: boolean;
  showDisconnectedBanner: boolean;
  onReconnect: () => void;
  isStreaming: boolean;
  activeRunId: string | null;
  onCancelRun: (runId: string) => void;
  /** When set, shows an always-visible web search strip above the field (assistant chat). */
  webSearchEnabled?: boolean;
  onWebSearchToggle?: () => void;
};

export const ChatComposer = memo(
  forwardRef<ChatComposerHandle, ChatComposerProps>(function ChatComposer(
    {
      onSend,
      isInputDisabled,
      isLocalDraft,
      connectionState,
      showReconnectingBanner,
      showDisconnectedBanner,
      onReconnect,
      isStreaming,
      activeRunId,
      onCancelRun,
      webSearchEnabled = false,
      onWebSearchToggle,
    },
    ref
  ) {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        setValue: (value) => setInputValue(value),
        clear: () => setInputValue(''),
      }),
      []
    );

    const syncTextareaHeight = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const next = Math.min(el.scrollHeight, COMPOSER_TEXTAREA_MAX_HEIGHT_PX);
      el.style.height = `${next}px`;
    }, []);

    useLayoutEffect(() => {
      syncTextareaHeight();
    }, [inputValue, syncTextareaHeight]);

    const handleSend = useCallback(() => {
      const trimmed = inputValue.trim();
      if (!trimmed || isInputDisabled || isStreaming) return;
      onSend(trimmed);
    }, [inputValue, isInputDisabled, isStreaming, onSend]);

    const banners = (
      <>
        {showReconnectingBanner && (
          <div className="mb-2 rounded-lg border border-amber-300/40 bg-amber-900/20 px-3 py-2 text-sm text-amber-200 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span>Reconnecting to server...</span>
          </div>
        )}
        {!isLocalDraft && connectionState === 'failed' && (
          <div className="mb-2 rounded-lg border border-red-300/40 bg-red-900/20 px-3 py-2 text-sm text-red-200 flex items-center justify-between gap-3">
            <span>Connection lost. Unable to reach the server.</span>
            <button
              type="button"
              onClick={onReconnect}
              className="text-sm underline underline-offset-2"
            >
              Reconnect
            </button>
          </div>
        )}
        {showDisconnectedBanner && (
          <div className="mb-2 rounded-lg border border-gray-600/40 bg-gray-800/50 px-3 py-2 text-sm text-gray-300">
            Disconnected from assistant service.
          </div>
        )}
      </>
    );

    return (
      <div className={chatComposerShellClassName}>
        <MessagesComposerBar
          textareaRef={textareaRef}
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="iMessage"
          disabled={isInputDisabled}
          isStreaming={isStreaming}
          activeRunId={activeRunId}
          onCancelRun={onCancelRun}
          webSearchEnabled={webSearchEnabled}
          onWebSearchToggle={onWebSearchToggle}
          maxHeightPx={COMPOSER_TEXTAREA_MAX_HEIGHT_PX}
          banners={banners}
        />
      </div>
    );
  })
);

ChatComposer.displayName = 'ChatComposer';
