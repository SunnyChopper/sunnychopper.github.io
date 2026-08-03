/* Context modules conventionally export a hook alongside the provider. */
/* eslint-disable react-refresh/only-export-components -- provider + useAmbientAsk */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { AmbientAskDrawer } from '@/components/organisms/assistant/AmbientAskDrawer';
import type { AmbientAskSession, AmbientSurface } from '@/types/chatbot';

interface AmbientAskOpenInput {
  surface: AmbientSurface;
  title: string;
  askPrompt: string;
}

interface AmbientAskContextValue {
  openAsk: (input: AmbientAskOpenInput) => void;
  close: () => void;
  session: AmbientAskSession | null;
  setThreadId: (threadId: string) => void;
  setThreadCreating: (creating: boolean) => void;
  setThreadError: (error: string | null) => void;
}

const AmbientAskContext = createContext<AmbientAskContextValue | null>(null);

export function AmbientAskProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AmbientAskSession | null>(null);

  const close = useCallback(() => {
    setSession(null);
  }, []);

  const openAsk = useCallback((input: AmbientAskOpenInput) => {
    setSession({
      surface: input.surface,
      title: input.title,
      askPrompt: input.askPrompt,
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
      openAsk,
      close,
      session,
      setThreadId,
      setThreadCreating,
      setThreadError,
    }),
    [close, openAsk, session, setThreadCreating, setThreadError, setThreadId]
  );

  return (
    <AmbientAskContext.Provider value={value}>
      {children}
      {session ? <AmbientAskDrawer session={session} onClose={close} /> : null}
    </AmbientAskContext.Provider>
  );
}

export function useAmbientAsk(): AmbientAskContextValue {
  const ctx = useContext(AmbientAskContext);
  if (!ctx) {
    throw new Error('useAmbientAsk must be used within AmbientAskProvider');
  }
  return ctx;
}
