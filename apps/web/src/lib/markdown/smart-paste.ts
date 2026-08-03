export type SmartPasteKind = 'list' | 'table';

/** Normalize Windows / classic Mac newlines to `\n`. */
export function normalizePasteNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Detect whether pasted plain text qualifies for list or table formatting. */
export function detectSmartPasteKind(text: string): SmartPasteKind | null {
  const normalized = normalizePasteNewlines(text);
  if (normalized.includes('\t')) return 'table';
  const newlineCount = (normalized.match(/\n/g) ?? []).length;
  if (newlineCount >= 2) return 'list';
  return null;
}

/** Format multi-line plain text as a markdown bullet list. */
export function formatPasteAsList(text: string): string {
  const normalized = normalizePasteNewlines(text);
  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `- ${line}`)
    .join('\n');
}

function escapeTableCell(cell: string): string {
  return cell.replace(/\|/g, '\\|');
}

/** Format tab-separated values as a GFM pipe table (first row = header). */
export function formatPasteAsTable(text: string): string {
  const normalized = normalizePasteNewlines(text).trimEnd();
  const rawRows = normalized.split('\n').filter((row) => row.trim().length > 0);
  if (rawRows.length === 0) return '';

  const rows = rawRows.map((row) => row.split('\t').map((cell) => cell.trim()));
  const columnCount = Math.max(...rows.map((row) => row.length), 1);
  const paddedRows = rows.map((row) => {
    const padded = [...row];
    while (padded.length < columnCount) padded.push('');
    return padded;
  });

  const formatRow = (cells: string[]) =>
    `| ${cells.map((cell) => escapeTableCell(cell)).join(' | ')} |`;

  const header = paddedRows[0] ?? Array.from({ length: columnCount }, () => '');
  const bodyRows = paddedRows.slice(1);
  const separator = `| ${Array.from({ length: columnCount }, () => '---').join(' | ')} |`;

  return [formatRow(header), separator, ...bodyRows.map(formatRow)].join('\n');
}

export function formatSmartPaste(text: string, kind: SmartPasteKind): string {
  return kind === 'table' ? formatPasteAsTable(text) : formatPasteAsList(text);
}

export const SMART_PASTE_CHIP_DURATION_MS = 5000;

export function smartPasteChipLabel(kind: SmartPasteKind): string {
  return kind === 'table' ? 'Format as table' : 'Format as list';
}
