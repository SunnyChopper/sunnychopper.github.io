import { useState, useMemo } from 'react';
import { Search, Plus, Grid3x3, List, FileText, FileCheck, BookOpen, CreditCard, ChevronDown } from 'lucide-react';
import { useKnowledgeVault } from '../../contexts/KnowledgeVaultContext';
import VaultItemCard from '../../components/organisms/VaultItemCard';
import Dialog from '../../components/organisms/Dialog';
import NoteForm from '../../components/organisms/NoteForm';
import DocumentForm from '../../components/organisms/DocumentForm';
import FlashcardForm from '../../components/organisms/FlashcardForm';
import type { VaultItemType } from '../../types/knowledge-vault';
import type { Area } from '../../types/growth-system';

const AREAS: Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'];

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | VaultItemType;

export default function KnowledgeVaultPage() {
  const { vaultItems, loading, refreshVaultItems } = useKnowledgeVault();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedArea, setSelectedArea] = useState<Area | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<VaultItemType | null>(null);

  const filteredItems = useMemo(() => {
    let filtered = vaultItems;

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (selectedArea !== 'all') {
      filtered = filtered.filter(item => item.area === selectedArea);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.searchableText.includes(query)
      );
    }

    return filtered.filter(item => item.status === 'active');
  }, [vaultItems, filterType, selectedArea, searchQuery]);

  const typeCounts = useMemo(() => {
    const counts: Record<VaultItemType, number> = {
      note: 0,
      document: 0,
      course_lesson: 0,
      flashcard: 0,
    };

    vaultItems.forEach(item => {
      if (item.status === 'active') {
        counts[item.type]++;
      }
    });

    return counts;
  }, [vaultItems]);

  const handleCreateClick = (type: VaultItemType) => {
    setShowCreateMenu(false);
    setCreateDialogType(type);
  };

  const tabs: Array<{ id: FilterType; label: string; icon: typeof FileText; count?: number }> = [
    { id: 'all', label: 'All Items', icon: Grid3x3 },
    { id: 'note', label: 'Notes', icon: FileText, count: typeCounts.note },
    { id: 'document', label: 'Documents', icon: FileCheck, count: typeCounts.document },
    { id: 'course_lesson', label: 'Lessons', icon: BookOpen, count: typeCounts.course_lesson },
    { id: 'flashcard', label: 'Flashcards', icon: CreditCard, count: typeCounts.flashcard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Vault</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your personal repository of knowledge and learning
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Plus size={20} />
            <span>Add Item</span>
            <ChevronDown size={16} />
          </button>

          {showCreateMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCreateMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <button
                  onClick={() => handleCreateClick('note')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <FileText size={18} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Note</span>
                </button>
                <button
                  onClick={() => handleCreateClick('document')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <FileCheck size={18} className="text-purple-600" />
                  <span className="text-gray-900 dark:text-white">Document</span>
                </button>
                <button
                  onClick={() => handleCreateClick('flashcard')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <CreditCard size={18} className="text-amber-600" />
                  <span className="text-gray-900 dark:text-white">Flashcard</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px] relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
          />
        </div>

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value as Area | 'all')}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
        >
          <option value="all">All Areas</option>
          {AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition ${
              viewMode === 'grid'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition ${
              viewMode === 'list'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No items found' : 'Your vault is empty'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Start building your knowledge base by adding your first item'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateMenu(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Plus size={20} />
              <span>Add Your First Item</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredItems.map(item => (
            <VaultItemCard
              key={item.id}
              item={item}
              onClick={() => console.log('View item:', item.id)}
            />
          ))}
        </div>
      )}

      <Dialog
        isOpen={createDialogType !== null}
        onClose={() => setCreateDialogType(null)}
        title={`Create ${createDialogType === 'note' ? 'Note' : createDialogType === 'document' ? 'Document' : 'Flashcard'}`}
      >
        <div className="p-6">
          {createDialogType === 'note' && (
            <NoteForm
              onSuccess={() => {
                setCreateDialogType(null);
                refreshVaultItems();
              }}
              onCancel={() => setCreateDialogType(null)}
            />
          )}
          {createDialogType === 'document' && (
            <DocumentForm
              onSuccess={() => {
                setCreateDialogType(null);
                refreshVaultItems();
              }}
              onCancel={() => setCreateDialogType(null)}
            />
          )}
          {createDialogType === 'flashcard' && (
            <FlashcardForm
              onSuccess={() => {
                setCreateDialogType(null);
                refreshVaultItems();
              }}
              onCancel={() => setCreateDialogType(null)}
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
