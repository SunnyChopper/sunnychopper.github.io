import { describe, expect, it } from 'vitest';
import {
  formatVaultArchiveTagCount,
  formatVaultArchiveTypeLabel,
  VAULT_ARCHIVE_RESTORE_NOTE,
} from './vault-archive-preview';

describe('vault-archive-preview', () => {
  it('formats note and document type labels', () => {
    expect(formatVaultArchiveTypeLabel('note')).toBe('Note');
    expect(formatVaultArchiveTypeLabel('document')).toBe('Document');
  });

  it('formats tag counts', () => {
    expect(formatVaultArchiveTagCount(0)).toBe('0 tags');
    expect(formatVaultArchiveTagCount(1)).toBe('1 tag');
    expect(formatVaultArchiveTagCount(3)).toBe('3 tags');
  });

  it('exports restore note copy', () => {
    expect(VAULT_ARCHIVE_RESTORE_NOTE).toBe('This can be restored from the Archive view');
  });
});
