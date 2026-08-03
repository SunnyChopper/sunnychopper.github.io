import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AssistantKnowledgeSurfaceCard } from '@/components/molecules/AssistantKnowledgeSurfaceCard';
import type { KnowledgeSurfaceSuggestion } from '@/types/knowledge-surface';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const suggestion: KnowledgeSurfaceSuggestion = {
  artifactType: 'flashcardDeck',
  artifactId: 'deck-1',
  title: 'React hooks',
  reason: 'You have 4 flashcards due on this exact pattern.',
  score: 0.9,
  matchStrength: 'topic',
  cta: {
    kind: 'quiz',
    label: 'Quiz 90 seconds',
    href: '/admin/knowledge-vault/study?deckId=deck-1&startReview=1',
  },
  secondaryCta: {
    kind: 'open',
    label: 'Open deck',
    href: '/admin/knowledge-vault/flashcards?deckId=deck-1',
  },
  stats: { dueCount: 4, totalCount: 10 },
};

describe('AssistantKnowledgeSurfaceCard', () => {
  it('renders CTAs and navigates on primary click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AssistantKnowledgeSurfaceCard
          messageId="msg-1"
          suggestion={suggestion}
          onDismiss={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('React hooks')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quiz 90 seconds' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin/knowledge-vault/study?deckId=deck-1&startReview=1'
    );
  });

  it('calls onDismiss when dismiss is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <AssistantKnowledgeSurfaceCard
          messageId="msg-1"
          suggestion={suggestion}
          onDismiss={onDismiss}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText('Dismiss suggestion'));
    expect(onDismiss).toHaveBeenCalledWith('msg-1:flashcardDeck:deck-1');
  });
});
