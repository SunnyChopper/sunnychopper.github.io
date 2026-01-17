import { useState, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { useKnowledgeVault } from '../../contexts/KnowledgeVault';
import type { Flashcard, CreateFlashcardInput, UpdateFlashcardInput } from '../../types/knowledge-vault';
import type { Area } from '../../types/growth-system';

const AREAS: Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'];

interface FlashcardFormProps {
  flashcard?: Flashcard;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlashcardForm({ flashcard, onSuccess, onCancel }: FlashcardFormProps) {
  const { createFlashcard, updateFlashcard } = useKnowledgeVault();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: flashcard?.title || '',
    front: (flashcard as Flashcard)?.front || '',
    back: (flashcard as Flashcard)?.back || '',
    area: flashcard?.area || ('Operations' as Area),
    tags: flashcard?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (flashcard) {
      setFormData({
        title: flashcard.title,
        front: (flashcard as Flashcard).front,
        back: (flashcard as Flashcard).back,
        area: flashcard.area,
        tags: flashcard.tags,
      });
    }
  }, [flashcard]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.front.trim()) {
        throw new Error('Front side is required');
      }
      if (!formData.back.trim()) {
        throw new Error('Back side is required');
      }

      if (flashcard) {
        const input: UpdateFlashcardInput = {
          title: formData.title,
          front: formData.front,
          back: formData.back,
          area: formData.area,
          tags: formData.tags,
        };
        await updateFlashcard(flashcard.id, input);
      } else {
        const input: CreateFlashcardInput = {
          title: formData.title,
          front: formData.front,
          back: formData.back,
          area: formData.area,
          tags: formData.tags,
        };
        await createFlashcard(input);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
          placeholder="Enter flashcard title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Front Side (Question) *
        </label>
        <textarea
          value={formData.front}
          onChange={(e) => setFormData(prev => ({ ...prev, front: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
          placeholder="What's the question or prompt?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Back Side (Answer) *
        </label>
        <textarea
          value={formData.back}
          onChange={(e) => setFormData(prev => ({ ...prev, back: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
          placeholder="What's the answer?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Area *
        </label>
        <select
          value={formData.area}
          onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value as Area }))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
          required
        >
          {AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition"
          >
            Add
          </button>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                <TagIcon size={12} />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : flashcard ? 'Update Flashcard' : 'Create Flashcard'}
        </button>
      </div>
    </form>
  );
}
