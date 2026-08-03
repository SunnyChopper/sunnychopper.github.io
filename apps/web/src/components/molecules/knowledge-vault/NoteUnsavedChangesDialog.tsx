import Button from '@/components/atoms/Button';
import Dialog from '@/components/molecules/Dialog';
import type { DirtyNoteEditField } from '@/lib/knowledge-vault/note-edit-form-snapshot';

interface NoteUnsavedChangesDialogProps {
  isOpen: boolean;
  dirtyFields: DirtyNoteEditField[];
  saving?: boolean;
  onDiscard: () => void;
  onSaveAndClose: () => void;
  onKeepEditing: () => void;
}

export function NoteUnsavedChangesDialog({
  isOpen,
  dirtyFields,
  saving = false,
  onDiscard,
  onSaveAndClose,
  onKeepEditing,
}: NoteUnsavedChangesDialogProps) {
  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" size="sm" variant="destructive" onClick={onDiscard} disabled={saving}>
        Discard
      </Button>
      <Button type="button" size="sm" variant="primary" onClick={onSaveAndClose} disabled={saving}>
        {saving ? 'Saving…' : 'Save & Close'}
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={onKeepEditing} disabled={saving}>
        Keep Editing
      </Button>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onKeepEditing}
      title="Unsaved changes"
      size="sm"
      layer="nested"
      trapFocus
      footer={footer}
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        You have unsaved edits. Discard them, save and close, or keep editing?
      </p>
      {dirtyFields.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
          {dirtyFields.map((field) => (
            <li key={field.key}>{field.label}</li>
          ))}
        </ul>
      ) : null}
    </Dialog>
  );
}
