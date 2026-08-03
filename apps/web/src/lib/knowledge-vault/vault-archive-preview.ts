import type { VaultItemType } from '@/types/knowledge-vault';

const ARCHIVE_TYPE_LABELS: Partial<Record<VaultItemType, string>> = {
  note: 'Note',
  document: 'Document',
};

export function formatVaultArchiveTypeLabel(type: VaultItemType): string {
  return ARCHIVE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function formatVaultArchiveTagCount(count: number): string {
  if (count === 1) return '1 tag';
  return `${count} tags`;
}

export const VAULT_ARCHIVE_RESTORE_NOTE = 'This can be restored from the Archive view';
