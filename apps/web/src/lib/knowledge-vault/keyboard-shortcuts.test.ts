import { describe, expect, it, vi } from 'vitest';

import {
  getKnowledgeVaultShortcutSections,
  isKeyboardShortcutsChord,
} from '@/lib/knowledge-vault/keyboard-shortcuts';

describe('isKeyboardShortcutsChord', () => {
  it('matches Ctrl+?', () => {
    expect(
      isKeyboardShortcutsChord({ key: '?', ctrlKey: true, metaKey: false, shiftKey: false })
    ).toBe(true);
  });

  it('matches Cmd+?', () => {
    expect(
      isKeyboardShortcutsChord({ key: '?', ctrlKey: false, metaKey: true, shiftKey: false })
    ).toBe(true);
  });

  it('matches Ctrl+Shift+/ when key is slash', () => {
    expect(
      isKeyboardShortcutsChord({ key: '/', ctrlKey: true, metaKey: false, shiftKey: true })
    ).toBe(true);
  });

  it('rejects bare ? without modifier', () => {
    expect(
      isKeyboardShortcutsChord({ key: '?', ctrlKey: false, metaKey: false, shiftKey: false })
    ).toBe(false);
  });

  it('rejects Ctrl+K', () => {
    expect(
      isKeyboardShortcutsChord({ key: 'k', ctrlKey: true, metaKey: false, shiftKey: false })
    ).toBe(false);
  });
});

describe('getKnowledgeVaultShortcutSections', () => {
  it('returns general, library, edit note, and flashcard sections', () => {
    const sections = getKnowledgeVaultShortcutSections();
    expect(sections.map((s) => s.title)).toEqual([
      'General',
      'Library',
      'Edit Note',
      'Flashcard deck create (review)',
    ]);
  });

  it('includes cheat-sheet toggle and save shortcuts', () => {
    const sections = getKnowledgeVaultShortcutSections();
    const allRows = sections.flatMap((s) => s.rows);
    expect(allRows.some((r) => r.description.includes('cheat-sheet'))).toBe(true);
    expect(allRows.some((r) => r.description === 'Save note')).toBe(true);
    expect(allRows.some((r) => r.description === 'Save flashcard deck')).toBe(true);
  });

  it('uses platform modifier in key labels', () => {
    const originalPlatform = navigator.platform;
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const macSections = getKnowledgeVaultShortcutSections();
    expect(macSections[0]?.rows[0]?.keys[0]).toBe('⌘+?');
    vi.stubGlobal('navigator', { platform: originalPlatform });
  });
});
