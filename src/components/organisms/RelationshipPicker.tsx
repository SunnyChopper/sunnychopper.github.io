import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Dialog from '@/components/molecules/Dialog';
import Button from '@/components/atoms/Button';
import { EntityLinkChip } from '@/components/atoms/EntityLinkChip';
import type { EntitySummary } from '@/types/growth-system';

interface RelationshipPickerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entities: EntitySummary[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
  saveError?: string | null;
  entityType: 'task' | 'project' | 'goal' | 'metric' | 'habit' | 'logbook';
}

export function RelationshipPicker({
  isOpen,
  onClose,
  title,
  entities,
  selectedIds,
  onSelectionChange,
  onSave,
  isSaving = false,
  saveError = null,
  entityType,
}: RelationshipPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntities = entities.filter((entity) =>
    entity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    try {
      await onSave?.();
      // Only close on successful save (no error thrown)
      onClose();
    } catch (error) {
      // Error is handled by parent component via saveError prop
      // Don't close the dialog so user can see the error and retry
      console.warn('Failed to save relationship selection:', error);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={title} className="max-w-2xl">
      <div className="relative space-y-4">
        {/* Saving Overlay */}
        {isSaving && (
          <div
            className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto rounded-lg"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Saving...</p>
            </div>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            disabled={isSaving}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected ({selectedIds.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const entity = entities.find((e) => e.id === id);
                if (!entity) return null;
                return (
                  <EntityLinkChip
                    key={id}
                    id={id}
                    label={entity.title}
                    type={entityType}
                    area={entity.area}
                    onRemove={() => toggleSelection(id)}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md ${
            isSaving ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {filteredEntities.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No entities found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntities.map((entity) => {
                const isSelected = selectedIds.includes(entity.id);
                return (
                  <button
                    key={entity.id}
                    type="button"
                    onClick={() => toggleSelection(entity.id)}
                    disabled={isSaving}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {entity.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <span className="capitalize">{entity.type}</span>
                          <span>•</span>
                          <span>{entity.area}</span>
                          <span>•</span>
                          <span className="capitalize">{entity.status}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={isSaving}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {saveError && <div className="text-sm text-red-600 dark:text-red-400">{saveError}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleClose} variant="secondary" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Selection'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
