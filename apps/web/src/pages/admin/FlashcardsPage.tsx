import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StudyDashboard from '@/components/organisms/StudyDashboard';
import FlashcardDeckCreateDialog from '@/components/organisms/FlashcardDeckCreateDialog';
import Dialog from '@/components/molecules/Dialog';
import { useKnowledgeVault } from '@/contexts/KnowledgeVault';
import { ROUTES } from '@/routes';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshVaultItems } = useKnowledgeVault();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const deckId = searchParams.get('deckId')?.trim();
    const startReview = searchParams.get('startReview') === '1';
    if (deckId && startReview) {
      navigate(
        `${ROUTES.admin.knowledgeVaultFeynmanStudy}?deckId=${encodeURIComponent(deckId)}&startReview=1`,
        { replace: true }
      );
    }
  }, [navigate, searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Master your knowledge through spaced repetition
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700"
        >
          <Plus size={20} />
          <span>Create deck</span>
        </button>
      </div>

      <StudyDashboard />

      <Dialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Flashcard deck"
        size="full"
      >
        <div className="p-6">
          <FlashcardDeckCreateDialog
            onSuccess={() => {
              setShowCreateDialog(false);
              void refreshVaultItems();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
