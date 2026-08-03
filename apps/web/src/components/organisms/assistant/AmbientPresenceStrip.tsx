import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AmbientWhisperCard } from '@/components/molecules/assistant/AmbientWhisperCard';
import { useAmbientAsk } from '@/contexts/AmbientAskContext';
import {
  useAmbientPresence,
  useAmbientPresenceMutations,
} from '@/hooks/chatbot/useAmbientPresence';
import type { AmbientSurface, AmbientWhisperAction, AmbientWhisperItem } from '@/types/chatbot';

export interface AmbientPresenceStripProps {
  surface: AmbientSurface;
  className?: string;
  onQuickRecovery?: () => void;
}

export function AmbientPresenceStrip({
  surface,
  className,
  onQuickRecovery,
}: AmbientPresenceStripProps) {
  const navigate = useNavigate();
  const { openAsk } = useAmbientAsk();
  const { data, isLoading } = useAmbientPresence(surface);
  const { dismissMutation, actionMutation } = useAmbientPresenceMutations(surface);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const isBusy = dismissMutation.isPending || actionMutation.isPending;

  const handleOpen = useCallback(
    (href: string) => {
      const path = href.startsWith('/admin') ? href.slice('/admin'.length) || '/' : href;
      navigate(path);
    },
    [navigate]
  );

  const handleAsk = useCallback(
    (item: AmbientWhisperItem) => {
      openAsk({
        surface: item.surface,
        title: item.title,
        askPrompt: item.askPrompt,
      });
    },
    [openAsk]
  );

  const handleDismiss = useCallback(
    (item: AmbientWhisperItem) => {
      dismissMutation.mutate(item);
    },
    [dismissMutation]
  );

  const handleAction = useCallback(
    async (item: AmbientWhisperItem, action: AmbientWhisperAction) => {
      if (action.id === 'openEntity') {
        handleOpen(item.href);
        return;
      }
      if (action.id === 'openQuickRecovery') {
        onQuickRecovery?.();
        void actionMutation.mutateAsync({ item, actionId: action.id });
        return;
      }
      if (action.confirm) {
        const ok = window.confirm(action.confirm);
        if (!ok) return;
      }
      setPendingActionId(`${item.id}:${action.id}`);
      try {
        await actionMutation.mutateAsync({ item, actionId: action.id });
        if (action.id === 'requestStrictPlan') {
          openAsk({
            surface: item.surface,
            title: item.title,
            askPrompt: item.askPrompt,
          });
        }
      } finally {
        setPendingActionId(null);
      }
    },
    [actionMutation, handleOpen, onQuickRecovery, openAsk]
  );

  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'space-y-2'}>
      {items.map((item) => (
        <AmbientWhisperCard
          key={item.id}
          item={item}
          onAsk={handleAsk}
          onOpen={handleOpen}
          onAction={handleAction}
          onDismiss={handleDismiss}
          isBusy={isBusy && pendingActionId?.startsWith(item.id) === true}
        />
      ))}
    </div>
  );
}
