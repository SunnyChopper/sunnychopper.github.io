import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  LogbookEntry,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
} from '@/types/growth-system';
import { logbookService } from '@/services/growth-system/logbook.service';
import Button from '@/components/atoms/Button';
import { LogbookEntryCard } from '@/components/molecules/LogbookEntryCard';
import { LogbookEditor } from '@/components/organisms/LogbookEditor';
import Dialog from '@/components/organisms/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AILogbookAssistPanel } from '@/components/molecules/AILogbookAssistPanel';
import { llmConfig } from '@/lib/llm';

type ViewMode = 'list' | 'calendar';

export default function LogbookPage() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LogbookEntry | null>(null);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiMode, setAIMode] = useState<
    'prompts' | 'digest' | 'patterns' | 'sentiment' | 'review' | 'connections'
  >('prompts');
  const isAIConfigured = llmConfig.isConfigured();

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const response = await logbookService.getAll();
      if (response.success && response.data) {
        setEntries(
          response.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }
    } catch (error) {
      console.error('Failed to load logbook entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleCreateEntry = async (input: CreateLogbookEntryInput) => {
    setIsSubmitting(true);
    try {
      const response = await logbookService.create(input);
      if (response.success && response.data) {
        setEntries(
          [response.data, ...entries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEntry = async (input: UpdateLogbookEntryInput) => {
    if (!selectedEntry) return;

    setIsSubmitting(true);
    try {
      const response = await logbookService.update(selectedEntry.id, input);
      if (response.success && response.data) {
        const updatedEntries = entries.map((e) => (e.id === selectedEntry.id ? response.data! : e));
        setEntries(updatedEntries);
        setSelectedEntry(response.data);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await logbookService.delete(entryToDelete.id);
      if (response.success) {
        const updatedEntries = entries.filter((e) => e.id !== entryToDelete.id);
        setEntries(updatedEntries);
        if (selectedEntry && selectedEntry.id === entryToDelete.id) {
          setSelectedEntry(null);
        }
        setEntryToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntryClick = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (entry.title && entry.title.toLowerCase().includes(query)) ||
      (entry.notes && entry.notes.toLowerCase().includes(query)) ||
      entry.date.includes(query)
    );
  });

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Logbook
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h1>
                </div>
                {selectedEntry.title && (
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {selectedEntry.title}
                  </h2>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEntryToDelete(selectedEntry)}
                  className="hover:!bg-red-50 hover:!text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {selectedEntry.mood && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mood</div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEntry.mood === 'High'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : selectedEntry.mood === 'Steady'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {selectedEntry.mood}
                  </div>
                </div>
              )}
              {selectedEntry.energy !== null && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Energy</div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-sm ${
                            i < (selectedEntry.energy || 0)
                              ? 'bg-blue-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedEntry.energy}/10
                    </span>
                  </div>
                </div>
              )}
            </div>

            {selectedEntry.notes && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedEntry.notes}
                </div>
              </div>
            )}

            {isAIConfigured && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setShowAIAssist(!showAIAssist)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>AI Logbook Tools</span>
                  {showAIAssist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAIAssist && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setAIMode('prompts')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'prompts' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Reflection Prompts
                      </button>
                      <button
                        onClick={() => setAIMode('digest')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'digest' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Daily Digest
                      </button>
                      <button
                        onClick={() => setAIMode('patterns')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'patterns' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Pattern Insights
                      </button>
                      <button
                        onClick={() => setAIMode('sentiment')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'sentiment' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Sentiment Analysis
                      </button>
                      <button
                        onClick={() => setAIMode('review')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'review' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Weekly Review
                      </button>
                      <button
                        onClick={() => setAIMode('connections')}
                        className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'connections' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        Connection Suggestions
                      </button>
                    </div>

                    <AILogbookAssistPanel
                      mode={aiMode}
                      entry={selectedEntry}
                      entries={entries}
                      onClose={() => setShowAIAssist(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Entry"
          className="max-w-2xl"
        >
          <LogbookEditor
            entry={selectedEntry || undefined}
            onSubmit={(input) => handleUpdateEntry(input as UpdateLogbookEntryInput)}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Daily Logbook
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Reflect on your journey</p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Entry
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading entries...</p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            title="No entries found"
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Start journaling by creating your first entry'
            }
            actionLabel="Create Entry"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => (
              <LogbookEntryCard key={entry.id} entry={entry} onClick={handleEntryClick} />
            ))}
          </div>
        )}
      </div>

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="New Logbook Entry"
        className="max-w-2xl"
      >
        <LogbookEditor
          onSubmit={(input) => handleCreateEntry(input as CreateLogbookEntryInput)}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      <Dialog isOpen={!!entryToDelete} onClose={() => setEntryToDelete(null)} title="Delete Entry">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this entry? This action cannot be undone.
          </p>
          {entryToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(entryToDelete.date).toLocaleDateString()}
              </p>
              {entryToDelete.title && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{entryToDelete.title}</p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setEntryToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteEntry}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Entry'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
