/* Context modules conventionally export a hook alongside the provider. */
/* eslint-disable react-refresh/only-export-components -- provider + useAdminShell */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes';

interface AdminShellContextValue {
  mainNavOpen: boolean;
  assistantChatsOpen: boolean;
  assistantRelevantNowOpen: boolean;
  toggleMainNav: () => void;
  toggleAssistantChats: () => void;
  toggleAssistantRelevantNow: () => void;
  closeMainNav: () => void;
  closeAssistantChats: () => void;
  closeAssistantRelevantNow: () => void;
  closeAll: () => void;
}

const AdminShellContext = createContext<AdminShellContextValue | undefined>(undefined);

interface AdminShellProviderProps {
  children: ReactNode;
}

export function AdminShellProvider({ children }: AdminShellProviderProps) {
  const location = useLocation();
  const [mainNavOpen, setMainNavOpen] = useState(false);
  const [assistantChatsOpen, setAssistantChatsOpen] = useState(false);
  const [assistantRelevantNowOpen, setAssistantRelevantNowOpen] = useState(false);

  const closeMainNav = useCallback(() => {
    setMainNavOpen(false);
  }, []);

  const closeAssistantChats = useCallback(() => {
    setAssistantChatsOpen(false);
  }, []);

  const closeAssistantRelevantNow = useCallback(() => {
    setAssistantRelevantNowOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setMainNavOpen(false);
    setAssistantChatsOpen(false);
    setAssistantRelevantNowOpen(false);
  }, []);

  const toggleMainNav = useCallback(() => {
    setAssistantChatsOpen(false);
    setAssistantRelevantNowOpen(false);
    setMainNavOpen((prev) => !prev);
  }, []);

  const toggleAssistantChats = useCallback(() => {
    setMainNavOpen(false);
    setAssistantRelevantNowOpen(false);
    setAssistantChatsOpen((prev) => !prev);
  }, []);

  const toggleAssistantRelevantNow = useCallback(() => {
    setMainNavOpen(false);
    setAssistantChatsOpen(false);
    setAssistantRelevantNowOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTES.admin.assistant)) {
      setAssistantChatsOpen(false);
      setAssistantRelevantNowOpen(false);
    }
  }, [location.pathname]);

  const value = useMemo(
    () => ({
      mainNavOpen,
      assistantChatsOpen,
      assistantRelevantNowOpen,
      toggleMainNav,
      toggleAssistantChats,
      toggleAssistantRelevantNow,
      closeMainNav,
      closeAssistantChats,
      closeAssistantRelevantNow,
      closeAll,
    }),
    [
      assistantChatsOpen,
      assistantRelevantNowOpen,
      closeAll,
      closeAssistantChats,
      closeAssistantRelevantNow,
      closeMainNav,
      mainNavOpen,
      toggleAssistantChats,
      toggleAssistantRelevantNow,
      toggleMainNav,
    ]
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error('useAdminShell must be used within AdminShellProvider');
  }
  return context;
}
