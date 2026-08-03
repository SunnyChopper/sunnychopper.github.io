import type { AssistantDecisionRequest } from '@/types/chatbot';
import { CoachEscalationDecisionCard } from '@/components/molecules/CoachEscalationDecisionCard';
import { MetaProposalDecisionCard } from '@/components/molecules/assistant/MetaProposalDecisionCard';
import { StaleEntityDecisionCard } from '@/components/molecules/StaleEntityDecisionCard';

type AssistantDecisionCardListProps = {
  threadId: string;
  messageId: string;
  decisions: AssistantDecisionRequest[];
};

export function AssistantDecisionCardList({
  threadId,
  messageId,
  decisions,
}: AssistantDecisionCardListProps) {
  if (!decisions.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {decisions.map((decision) =>
        decision.kind === 'coachEscalation' ? (
          <CoachEscalationDecisionCard
            key={decision.id}
            threadId={threadId}
            messageId={messageId}
            decision={decision}
          />
        ) : decision.kind === 'metaProposal' ? (
          <MetaProposalDecisionCard
            key={decision.id}
            threadId={threadId}
            messageId={messageId}
            decision={decision}
          />
        ) : (
          <StaleEntityDecisionCard
            key={decision.id}
            threadId={threadId}
            messageId={messageId}
            decision={decision}
          />
        )
      )}
    </div>
  );
}
