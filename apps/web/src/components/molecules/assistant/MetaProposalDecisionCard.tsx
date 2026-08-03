import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/atoms/Button';
import type { AssistantDecisionRequest } from '@/types/chatbot';
import { apiClient } from '@/lib/api-client';

type MetaProposalDecisionCardProps = {
  threadId: string;
  messageId: string;
  decision: AssistantDecisionRequest;
};

export function MetaProposalDecisionCard({
  threadId,
  messageId,
  decision,
}: MetaProposalDecisionCardProps) {
  const qc = useQueryClient();
  const [resolved, setResolved] = useState(decision.status !== 'pending');
  const proposalId = decision.entityId;

  const mutate = useMutation({
    mutationFn: async (status: 'approved' | 'rejected' | 'later') => {
      const response = await apiClient.patchMetaImprovementProposal(proposalId, { status });
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Failed to update proposal');
      }
      const action = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'later';
      await apiClient.resolveAssistantDecision(threadId, messageId, decision.id, action);
      return response.data;
    },
    onSuccess: () => {
      setResolved(true);
      void qc.invalidateQueries();
    },
  });

  if (resolved) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900/50">
        Proposal updated.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-3 dark:border-violet-900 dark:bg-violet-950/30">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{decision.title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{decision.rationale}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => mutate.mutate('approved')} disabled={mutate.isPending}>
          Approve
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => mutate.mutate('later')}
          disabled={mutate.isPending}
        >
          Later
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => mutate.mutate('rejected')}
          disabled={mutate.isPending}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
