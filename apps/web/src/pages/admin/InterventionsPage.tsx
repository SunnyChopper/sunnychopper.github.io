import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import Dialog from '@/components/molecules/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageContainer } from '@/components/templates/PageContainer';
import {
  useAssistantInterventionActions,
  useAssistantInterventions,
} from '@/hooks/chatbot/useAssistantInterventions';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';
import type { AssistantIntervention, AssistantInterventionKind } from '@/types/api-contracts';

const KIND_LABELS: Record<AssistantInterventionKind, string> = {
  coachIntervention: 'Coach',
  escalation: 'Escalation',
  opportunity: 'Opportunity',
  emailThreadSummary: 'Email',
};

function severityClass(severity: AssistantIntervention['severity']): string {
  if (severity === 'critical') return 'text-red-700 dark:text-red-300';
  if (severity === 'attention') return 'text-amber-800 dark:text-amber-200';
  return 'text-slate-600 dark:text-slate-300';
}

export default function InterventionsPage() {
  const navigate = useNavigate();
  const listQ = useAssistantInterventions({ page: 1, pageSize: 50 });
  const { markRead, dismiss, reply, convertToChat } = useAssistantInterventionActions();
  const [dismissTarget, setDismissTarget] = useState<AssistantIntervention | null>(null);
  const [dismissReason, setDismissReason] = useState('');
  const [replyTarget, setReplyTarget] = useState<AssistantIntervention | null>(null);
  const [replyText, setReplyText] = useState('');

  const items = listQ.data?.items ?? [];

  const openItem = async (item: AssistantIntervention) => {
    if (item.status === 'unread') {
      await markRead.mutateAsync(item.id);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
      <PageContainer width="narrow" className="flex flex-1 flex-col pb-12 pt-20 lg:pt-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Interventions</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            One place for coach nudges, escalations, proactive briefings, and email-thread updates.
          </p>
          {listQ.data ? (
            <p className="mt-2 text-xs text-gray-500">
              {listQ.data.unreadCount} unread · {listQ.data.total} total
            </p>
          ) : null}
        </header>

        {listQ.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : listQ.isError ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              Could not load interventions. Try again or check your connection.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void listQ.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center">
            <EmptyState
              variant="onboarding"
              icon={Bell}
              title="All quiet — no interventions yet"
              description="When the Assistant has something high-signal, it lands here: coach nudges, escalations, proactive briefings, and email-thread updates."
              onboardingSteps={[
                'Coach nudges when focus or habits need a push',
                'Escalations when ambient signals need attention',
                'Proactive briefings and check-ins from your automations',
                'Email-thread summaries when replies matter',
              ]}
              proTips={[
                'Unread count in the sidebar bell stays in sync with this list',
                'Set up a morning briefing under Proactive to seed your first opportunity',
              ]}
              actionLabel="Set up Proactive"
              onAction={() => navigate(ROUTES.admin.assistantProactive)}
              secondaryActionLabel="Open Assistant"
              onSecondaryAction={() => navigate(ROUTES.admin.assistant)}
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-xs font-medium uppercase tracking-wide',
                        severityClass(item.severity)
                      )}
                    >
                      {KIND_LABELS[item.kind]}
                      {item.status === 'unread' ? ' · unread' : ''}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                      {item.body}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void openItem(item);
                      void convertToChat.mutateAsync(item.id).then(({ threadId }) => {
                        navigate(`${ROUTES.admin.assistant}/${threadId}`);
                      });
                    }}
                  >
                    Open in chat
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void openItem(item);
                      setReplyTarget(item);
                    }}
                  >
                    Reply
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void openItem(item);
                      setDismissTarget(item);
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Dialog
          isOpen={Boolean(dismissTarget)}
          onClose={() => setDismissTarget(null)}
          title="Dismiss intervention"
        >
          <FormField label="Reason" htmlFor="page-dismiss-reason" className="mb-4">
            <Textarea
              id="page-dismiss-reason"
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDismissTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={dismissReason.trim().length < 3}
              onClick={() => {
                if (!dismissTarget) return;
                void dismiss
                  .mutateAsync({ id: dismissTarget.id, reason: dismissReason.trim() })
                  .then(() => {
                    setDismissTarget(null);
                    setDismissReason('');
                  });
              }}
            >
              Dismiss
            </Button>
          </div>
        </Dialog>

        <Dialog
          isOpen={Boolean(replyTarget)}
          onClose={() => setReplyTarget(null)}
          title="Reply in Assistant"
        >
          <FormField label="Message" htmlFor="page-reply-text" className="mb-4">
            <Textarea
              id="page-reply-text"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setReplyTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!replyText.trim()}
              onClick={() => {
                if (!replyTarget) return;
                void reply
                  .mutateAsync({ id: replyTarget.id, message: replyText.trim() })
                  .then(({ threadId }) => {
                    setReplyTarget(null);
                    setReplyText('');
                    navigate(`${ROUTES.admin.assistant}/${threadId}`);
                  });
              }}
            >
              Send
            </Button>
          </div>
        </Dialog>
      </PageContainer>
    </div>
  );
}
