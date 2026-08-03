/* Context modules conventionally export a hook alongside the provider. */
/* eslint-disable react-refresh/only-export-components -- provider + useEntityExplainChat */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { EntityExplainChatDrawer } from '@/components/organisms/EntityExplainChatDrawer';
import { buildEntityExplainContext } from '@/lib/entity-explain/build-entity-explain-context';
import type { EntityExplainContext, EntityExplainRef } from '@/lib/entity-explain/types';

interface EntityExplainSession {
  ref: EntityExplainRef;
  context: EntityExplainContext;
  threadId: string | null;
  isCreatingThread: boolean;
  threadError: string | null;
}

interface EntityExplainChatContextValue {
  open: (ref: EntityExplainRef) => void;
  close: () => void;
  session: EntityExplainSession | null;
  setThreadId: (threadId: string) => void;
  setThreadCreating: (creating: boolean) => void;
  setThreadError: (error: string | null) => void;
}

const EntityExplainChatContext = createContext<EntityExplainChatContextValue | null>(null);

export function EntityExplainChatProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<EntityExplainSession | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setSession(null);
  }, []);

  const open = useCallback((ref: EntityExplainRef) => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const context = buildEntityExplainContext(ref);
    setSession({
      ref,
      context,
      threadId: null,
      isCreatingThread: true,
      threadError: null,
    });
  }, []);

  const setThreadId = useCallback((threadId: string) => {
    setSession((current) =>
      current ? { ...current, threadId, isCreatingThread: false, threadError: null } : current
    );
  }, []);

  const setThreadCreating = useCallback((isCreatingThread: boolean) => {
    setSession((current) => (current ? { ...current, isCreatingThread } : current));
  }, []);

  const setThreadError = useCallback((threadError: string | null) => {
    setSession((current) =>
      current ? { ...current, threadError, isCreatingThread: false } : current
    );
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      session,
      setThreadId,
      setThreadCreating,
      setThreadError,
    }),
    [close, open, session, setThreadCreating, setThreadError, setThreadId]
  );

  return (
    <EntityExplainChatContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {session ? (
          <EntityExplainChatDrawer
            key="entity-explain-drawer"
            session={session}
            onClose={close}
            restoreFocusRef={restoreFocusRef}
          />
        ) : null}
      </AnimatePresence>
    </EntityExplainChatContext.Provider>
  );
}

export function useEntityExplainChat(): EntityExplainChatContextValue {
  const ctx = useContext(EntityExplainChatContext);
  if (!ctx) {
    throw new Error('useEntityExplainChat must be used within EntityExplainChatProvider');
  }
  return ctx;
}

/** Safe hook for cards that may render outside the provider during tests. */
export function useEntityExplainChatOptional(): EntityExplainChatContextValue | null {
  return useContext(EntityExplainChatContext);
}
