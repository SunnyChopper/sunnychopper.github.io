import { useState, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { useKnowledgeVault } from '../../contexts/KnowledgeVault';
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
} from '../../types/knowledge-vault';
import type { Area } from '../../types/growth-system';

const AREAS: Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'];

interface DocumentFormProps {
  document?: Document;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DocumentForm({ document, onSuccess, onCancel }: DocumentFormProps) {
  const { createDocument, updateDocument } = useKnowledgeVault();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: document?.title || '',
    content: document?.content || '',
    area: document?.area || ('Operations' as Area),
    fileUrl: (document as Document)?.fileUrl || '',
    fileType: (document as Document)?.fileType || '',
    pageCount: (document as Document)?.pageCount || null,
    tags: document?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        content: document.content || '',
        area: document.area,
        fileUrl: (document as Document).fileUrl || '',
        fileType: (document as Document).fileType || '',
        pageCount: (document as Document).pageCount || null,
        tags: document.tags,
      });
    }
  }, [document]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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

      if (document) {
        const input: UpdateDocumentInput = {
          title: formData.title,
          content: formData.content || undefined,
          area: formData.area,
          fileUrl: formData.fileUrl || undefined,
          fileType: formData.fileType || undefined,
          pageCount: formData.pageCount || undefined,
          tags: formData.tags,
        };
        await updateDocument(document.id, input);
      } else {
        const input: CreateDocumentInput = {
          title: formData.title,
          content: formData.content || undefined,
          area: formData.area,
          fileUrl: formData.fileUrl || undefined,
          fileType: formData.fileType || undefined,
          pageCount: formData.pageCount || undefined,
          tags: formData.tags,
        };
        await createDocument(input);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
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
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
          placeholder="Enter document title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Summary/Notes
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          rows={6}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
          placeholder="Add notes or summary about this document"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File Type
          </label>
          <input
            type="text"
            value={formData.fileType}
            onChange={(e) => setFormData((prev) => ({ ...prev, fileType: e.target.value }))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            placeholder="PDF, DOCX, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Count
          </label>
          <input
            type="number"
            value={formData.pageCount || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pageCount: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            placeholder="Number of pages"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          File URL
        </label>
        <input
          type="url"
          value={formData.fileUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, fileUrl: e.target.value }))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
          placeholder="https://example.com/document.pdf"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Area *
        </label>
        <select
          value={formData.area}
          onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value as Area }))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
          required
        >
          {AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
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
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
          >
            Add
          </button>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
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
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : document ? 'Update Document' : 'Create Document'}
        </button>
      </div>
    </form>
  );
}
