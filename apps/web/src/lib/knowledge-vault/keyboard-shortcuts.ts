export interface KnowledgeVaultShortcutContext {
  editNoteOpen?: boolean;
  flashcardCreateOpen?: boolean;
}

export interface KeyboardShortcutRow {
  keys: string[];
  description: string;
}

export interface KeyboardShortcutSection {
  title: string;
  rows: KeyboardShortcutRow[];
}

type ChordEvent = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey'>;

/** True when the user pressed Ctrl/Cmd+? (or Ctrl/Cmd+Shift+/ on layouts that emit `/`). */
export function isKeyboardShortcutsChord(event: ChordEvent): boolean {
  if (!(event.ctrlKey || event.metaKey)) {
    return false;
  }
  return event.key === '?' || (event.shiftKey && event.key === '/');
}

/** Platform-aware primary modifier label for shortcut display. */
export function getModifierLabel(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return '⌘';
  }
  return 'Ctrl';
}

/**
 * Canonical shortcut rows for the Knowledge Vault Library cheat-sheet.
 * Always returns the full "most useful" set so Library users see Edit Note and flashcard tips.
 */
export function getKnowledgeVaultShortcutSections(
  _context: KnowledgeVaultShortcutContext = {}
): KeyboardShortcutSection[] {
  const mod = getModifierLabel();

  return [
    {
      title: 'General',
      rows: [
        {
          keys: [`${mod}+?`],
          description: 'Show or hide this cheat-sheet',
        },
        {
          keys: ['Esc'],
          description: 'Close dialog, dismiss AI panel, or clear Library selection',
        },
      ],
    },
    {
      title: 'Library',
      rows: [
        {
          keys: ['Shift', 'click'],
          description: 'Range-select items',
        },
        {
          keys: ['Enter', 'Space'],
          description: 'Open focused Library card',
        },
      ],
    },
    {
      title: 'Edit Note',
      rows: [
        {
          keys: [`${mod}+S`],
          description: 'Save note',
        },
      ],
    },
    {
      title: 'Flashcard deck create (review)',
      rows: [
        {
          keys: ['↑', '↓'],
          description: 'Move between flashcard shells',
        },
        {
          keys: ['Enter', 'Tab'],
          description: 'Edit front of selected card',
        },
        {
          keys: ['Esc'],
          description: 'Return to card shell from field',
        },
        {
          keys: [`${mod}+Enter`],
          description: 'Save flashcard deck',
        },
      ],
    },
  ];
}
