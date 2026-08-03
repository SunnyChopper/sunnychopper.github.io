import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import {
  formatVaultArchiveTagCount,
  formatVaultArchiveTypeLabel,
  VAULT_ARCHIVE_RESTORE_NOTE,
} from '@/lib/knowledge-vault/vault-archive-preview';
import type { VaultItem } from '@/types/knowledge-vault';

export interface ArchiveVaultItemDialogProps {
  item: VaultItem | null;
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="shrink-0 text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

export default function ArchiveVaultItemDialog({
  item,
  isOpen,
  isLoading = false,
  error = null,
  onClose,
  onConfirm,
}: ArchiveVaultItemDialogProps) {
  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={onConfirm}
      title="Archive item?"
      confirmLabel="Archive"
      cancelLabel="Cancel"
      isLoading={isLoading}
      variant="default"
    >
      {item ? (
        <div className="space-y-4">
          <dl className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-600 dark:bg-gray-900/40">
            <PreviewRow label="Title" value={item.title} />
            <PreviewRow label="Type" value={formatVaultArchiveTypeLabel(item.type)} />
            <PreviewRow label="Tags" value={formatVaultArchiveTagCount(item.tags.length)} />
          </dl>
          <p className="text-sm text-gray-600 dark:text-gray-400">{VAULT_ARCHIVE_RESTORE_NOTE}</p>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>
      ) : null}
    </ConfirmDialog>
  );
}
