import { describe, expect, it } from 'vitest';
import {
  detectSmartPasteKind,
  formatPasteAsList,
  formatPasteAsTable,
  formatSmartPaste,
  normalizePasteNewlines,
  smartPasteChipLabel,
} from './smart-paste';

describe('normalizePasteNewlines', () => {
  it('normalizes CRLF and lone CR', () => {
    expect(normalizePasteNewlines('a\r\nb\rc')).toBe('a\nb\nc');
  });
});

describe('detectSmartPasteKind', () => {
  it('returns null for single-line text without tabs', () => {
    expect(detectSmartPasteKind('hello')).toBeNull();
    expect(detectSmartPasteKind('one line')).toBeNull();
  });

  it('returns null for one newline only', () => {
    expect(detectSmartPasteKind('line one\nline two')).toBeNull();
  });

  it('returns list for two or more newlines without tabs', () => {
    expect(detectSmartPasteKind('a\nb\nc')).toBe('list');
    expect(detectSmartPasteKind('a\r\nb\r\nc')).toBe('list');
  });

  it('returns table when tabs are present even with few newlines', () => {
    expect(detectSmartPasteKind('a\tb\tc')).toBe('table');
    expect(detectSmartPasteKind('a\tb\nx\ty')).toBe('table');
  });

  it('prefers table when both tabs and multiple newlines are present', () => {
    expect(detectSmartPasteKind('h1\th2\nr1\tr2')).toBe('table');
  });
});

describe('formatPasteAsList', () => {
  it('formats non-empty lines as bullets and skips blanks', () => {
    expect(formatPasteAsList('apple\n\nbanana\n')).toBe('- apple\n- banana');
  });

  it('trims line whitespace', () => {
    expect(formatPasteAsList('  one  \n  two  ')).toBe('- one\n- two');
  });
});

describe('formatPasteAsTable', () => {
  it('formats TSV with header separator', () => {
    expect(formatPasteAsTable('Name\tAge\nAlice\t30')).toBe(
      '| Name | Age |\n| --- | --- |\n| Alice | 30 |'
    );
  });

  it('pads uneven rows to max column count', () => {
    expect(formatPasteAsTable('A\tB\tC\n1\t2')).toBe(
      '| A | B | C |\n| --- | --- | --- |\n| 1 | 2 |  |'
    );
  });

  it('escapes pipes inside cells', () => {
    expect(formatPasteAsTable('Col\na|b')).toBe('| Col |\n| --- |\n| a\\|b |');
  });

  it('handles single-row TSV as header-only table', () => {
    expect(formatPasteAsTable('X\tY')).toBe('| X | Y |\n| --- | --- |');
  });
});

describe('formatSmartPaste', () => {
  it('delegates to list or table formatter', () => {
    expect(formatSmartPaste('a\nb\nc', 'list')).toBe('- a\n- b\n- c');
    expect(formatSmartPaste('H\tV\n1\t2', 'table')).toContain('| H | V |');
  });
});

describe('smartPasteChipLabel', () => {
  it('returns user-facing chip labels', () => {
    expect(smartPasteChipLabel('list')).toBe('Format as list');
    expect(smartPasteChipLabel('table')).toBe('Format as table');
  });
});
