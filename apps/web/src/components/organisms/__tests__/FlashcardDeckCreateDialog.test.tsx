import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlashcardDeckCreateDialog from '../FlashcardDeckCreateDialog';

const { createFlashcardDeck, generateFromText, regenerateCard } = vi.hoisted(() => ({
  createFlashcardDeck: vi.fn(),
  generateFromText: vi.fn(),
  regenerateCard: vi.fn(),
}));

const mockNote = {
  id: 'note-1',
  title: 'Sample note',
  type: 'note' as const,
  status: 'active' as const,
  content: 'Note body for flashcards',
};

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    createFlashcardDeck,
    vaultItems: [mockNote],
    courses: [],
  }),
}));

vi.mock('@/services/knowledge-vault', () => ({
  aiFlashcardGeneratorService: {
    generateFromText,
    regenerateCard,
  },
}));

vi.mock('@/services/knowledge-vault/flashcard-source-resolver', () => ({
  resolveFlashcardSources: vi.fn(async () => ({
    title: 'Sample note',
    content: 'Note body for flashcards',
  })),
}));

function repeat(char: string, count: number): string {
  return char.repeat(count);
}

async function openReviewStep() {
  render(<FlashcardDeckCreateDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);
  fireEvent.click(screen.getByText('Generate from vault'));
  fireEvent.click(screen.getByLabelText(/Sample note/i));
  fireEvent.click(screen.getByText('Generate cards'));
  await waitFor(() => {
    expect(
      screen.getByText(
        'Review generated cards. Edit, remove, or regenerate individual cards before saving.'
      )
    ).toBeInTheDocument();
  });
}

describe('FlashcardDeckCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateFromText.mockResolvedValue({
      success: true,
      data: [
        { front: 'Front 1', back: 'Back 1' },
        { front: 'Front 2', back: 'Back 2' },
      ],
    });
    createFlashcardDeck.mockResolvedValue(undefined);
  });

  it('shows mode selection first', () => {
    render(<FlashcardDeckCreateDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('How would you like to build this deck?')).toBeInTheDocument();
    expect(screen.getByText('Create manually')).toBeInTheDocument();
    expect(screen.getByText('Generate from vault')).toBeInTheDocument();
  });

  it('navigates to manual flow', () => {
    render(<FlashcardDeckCreateDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Create manually'));
    expect(screen.getByPlaceholderText('e.g. Quantum computing — midterm')).toBeInTheDocument();
    expect(screen.getByText('Optional metadata (area, tags)')).toBeInTheDocument();
  });

  it('disables Save deck until at least one card has front and back', async () => {
    await openReviewStep();
    const saveButton = screen.getByRole('button', { name: 'Save deck' });
    expect(saveButton).not.toBeDisabled();

    const frontFields = screen.getAllByLabelText('Front');
    fireEvent.change(frontFields[0], { target: { value: '' } });
    fireEvent.change(screen.getAllByLabelText('Back')[0], { target: { value: '' } });
    fireEvent.change(frontFields[1], { target: { value: '' } });
    fireEvent.change(screen.getAllByLabelText('Back')[1], { target: { value: '' } });

    expect(saveButton).toBeDisabled();
  });

  it('moves between card shells with arrow keys and focuses front on Enter', async () => {
    await openReviewStep();

    const cardOne = screen.getByRole('group', { name: 'Card 1' });
    const cardTwo = screen.getByRole('group', { name: 'Card 2' });
    cardOne.focus();
    expect(cardOne).toHaveFocus();

    fireEvent.keyDown(cardOne, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(cardTwo).toHaveFocus();
    });

    fireEvent.keyDown(cardTwo, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getAllByLabelText('Front')[1]).toHaveFocus();
    });
  });

  it('returns focus to card shell on Escape from a field', async () => {
    await openReviewStep();

    const cardOne = screen.getByRole('group', { name: 'Card 1' });
    fireEvent.keyDown(cardOne, { key: 'Enter' });
    const frontField = screen.getAllByLabelText('Front')[0];
    await waitFor(() => {
      expect(frontField).toHaveFocus();
    });

    fireEvent.keyDown(frontField, { key: 'Escape' });
    await waitFor(() => {
      expect(cardOne).toHaveFocus();
    });
  });

  it('saves deck on Ctrl+Enter when valid', async () => {
    await openReviewStep();

    const deckTitle = screen.getByLabelText(/Deck title/i);
    fireEvent.change(deckTitle, { target: { value: 'My deck' } });

    fireEvent.keyDown(screen.getByRole('group', { name: 'Card 1' }), {
      key: 'Enter',
      ctrlKey: true,
    });

    await waitFor(() => {
      expect(createFlashcardDeck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My deck',
          flashcards: [
            { front: 'Front 1', back: 'Back 1', sourceItemId: undefined },
            { front: 'Front 2', back: 'Back 2', sourceItemId: undefined },
          ],
        })
      );
    });
  });

  it('shows auto-fill badge when title is set from sources', async () => {
    await openReviewStep();

    expect(screen.getByLabelText(/Deck title/i)).toHaveValue('Sample note');
    expect(screen.getByRole('button', { name: 'Clear auto-filled title' })).toBeInTheDocument();
    expect(screen.getByText('Auto-filled from sources')).toBeInTheDocument();
  });

  it('clears title and removes badge when auto-fill badge is clicked', async () => {
    await openReviewStep();

    fireEvent.click(screen.getByRole('button', { name: 'Clear auto-filled title' }));

    expect(screen.getByLabelText(/Deck title/i)).toHaveValue('');
    expect(screen.queryByText('Auto-filled from sources')).not.toBeInTheDocument();
  });

  it('hides auto-fill badge permanently after manual title edit', async () => {
    await openReviewStep();

    const deckTitle = screen.getByLabelText(/Deck title/i);
    fireEvent.change(deckTitle, { target: { value: 'Custom title' } });

    expect(screen.queryByText('Auto-filled from sources')).not.toBeInTheDocument();

    fireEvent.change(deckTitle, { target: { value: 'Sample note' } });
    expect(screen.queryByText('Auto-filled from sources')).not.toBeInTheDocument();
  });

  it('does not show auto-fill badge when user typed title before generate', async () => {
    render(<FlashcardDeckCreateDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Generate from vault'));

    const deckTitle = screen.getByLabelText(/Deck title/i);
    fireEvent.change(deckTitle, { target: { value: 'My custom deck' } });

    fireEvent.click(screen.getByLabelText(/Sample note/i));
    fireEvent.click(screen.getByText('Generate cards'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Review generated cards. Edit, remove, or regenerate individual cards before saving.'
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Deck title/i)).toHaveValue('My custom deck');
    expect(screen.queryByText('Auto-filled from sources')).not.toBeInTheDocument();
  });

  it('shows amber counter at 180 characters and red at 250 on review step', async () => {
    await openReviewStep();

    const frontField = screen.getAllByLabelText('Front')[0];
    fireEvent.change(frontField, { target: { value: repeat('a', 180) } });

    const counterId = frontField.getAttribute('aria-describedby');
    const amberCounter = document.getElementById(counterId!);
    expect(amberCounter).toHaveClass('text-amber-600');
    expect(amberCounter).toHaveTextContent('180');

    fireEvent.change(frontField, { target: { value: repeat('a', 250) } });
    expect(amberCounter).toHaveClass('text-red-600');
    expect(amberCounter).toHaveTextContent('250');
  });

  it('soft-blocks Save deck above 300 characters with card index message', async () => {
    await openReviewStep();

    const saveButton = screen.getByRole('button', { name: 'Save deck' });
    const frontField = screen.getAllByLabelText('Front')[0];

    fireEvent.change(frontField, { target: { value: repeat('a', 301) } });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Card 1: Shorten this side')).toBeInTheDocument();
    expect(screen.getAllByText('Shorten this side').length).toBeGreaterThan(0);
  });

  it('keeps Save deck enabled at exactly 300 characters with valid content', async () => {
    await openReviewStep();

    const saveButton = screen.getByRole('button', { name: 'Save deck' });
    const frontField = screen.getAllByLabelText('Front')[0];

    fireEvent.change(frontField, { target: { value: repeat('a', 300) } });

    expect(saveButton).not.toBeDisabled();
    expect(screen.queryByText('Card 1: Shorten this side')).not.toBeInTheDocument();
  });

  it('soft-blocks Create deck in manual flow when a side exceeds 300 characters', () => {
    render(<FlashcardDeckCreateDialog onSuccess={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Create manually'));

    const frontField = screen.getByLabelText('Front');
    const backField = screen.getByLabelText('Back');
    const createButton = screen.getByRole('button', { name: 'Create deck' });

    fireEvent.change(frontField, { target: { value: 'Question' } });
    fireEvent.change(backField, { target: { value: 'Answer' } });
    expect(createButton).not.toBeDisabled();

    fireEvent.change(frontField, { target: { value: repeat('a', 301) } });
    expect(createButton).toBeDisabled();
    expect(screen.getByText('Card 1: Shorten this side')).toBeInTheDocument();
  });
});
