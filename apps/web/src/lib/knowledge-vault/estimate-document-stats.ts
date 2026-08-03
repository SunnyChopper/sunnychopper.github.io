/** Mirrors backend `VAULT_DOC_CHUNK_SIZE_TOKENS` default (500). */
export const VAULT_DOC_CHUNK_SIZE_TOKENS = 500;

/** Approximate tokens per page for chunk estimation. */
const TOKENS_PER_PAGE_ESTIMATE = 400;

/** Approximate characters per page for text files. */
const CHARS_PER_PAGE_ESTIMATE = 3000;

/** Heuristic bytes per page for opaque binary office formats. */
const BYTES_PER_PAGE_HEURISTIC = 40_000;

export type DocumentStatsEstimate = {
  pageCount: number | null;
  chunkCount: number | null;
};

function extFromFilename(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}

function estimateChunksFromPages(pages: number): number {
  const estimatedTokens = pages * TOKENS_PER_PAGE_ESTIMATE;
  return Math.max(1, Math.ceil(estimatedTokens / VAULT_DOC_CHUNK_SIZE_TOKENS));
}

function estimateChunksFromChars(charCount: number): number {
  const estimatedTokens = Math.ceil(charCount / 4);
  return Math.max(1, Math.ceil(estimatedTokens / VAULT_DOC_CHUNK_SIZE_TOKENS));
}

function estimateChunksFromSize(sizeBytes: number): number {
  const estimatedTokens = Math.ceil(sizeBytes / 4);
  return Math.max(1, Math.ceil(estimatedTokens / VAULT_DOC_CHUNK_SIZE_TOKENS));
}

/** Count PDF page objects via byte scan (no pdf.js dependency). */
export function countPdfPagesFromBytes(bytes: Uint8Array): number {
  const text = new TextDecoder('latin1').decode(bytes);
  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  return Math.max(1, matches?.length ?? 1);
}

function readFileAsArrayBuffer(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Client-side page/chunk estimates for Create Document upload progress UI.
 * Estimates are best-effort; server extraction remains authoritative after create.
 */
export async function estimateDocumentStats(
  file: File,
  onProgress?: (percent: number) => void
): Promise<DocumentStatsEstimate> {
  const ext = extFromFilename(file.name);

  if (ext === 'pdf') {
    const buf = await readFileAsArrayBuffer(file, onProgress);
    const pages = countPdfPagesFromBytes(new Uint8Array(buf));
    return { pageCount: pages, chunkCount: estimateChunksFromPages(pages) };
  }

  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
    onProgress?.(100);
    return { pageCount: 1, chunkCount: 1 };
  }

  if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
    const text = await readFileAsText(file, onProgress);
    const pages = Math.max(1, Math.ceil(text.length / CHARS_PER_PAGE_ESTIMATE));
    return { pageCount: pages, chunkCount: estimateChunksFromChars(text.length) };
  }

  if (ext === 'docx' || ext === 'pptx') {
    onProgress?.(100);
    const pages = Math.max(1, Math.round(file.size / BYTES_PER_PAGE_HEURISTIC));
    return { pageCount: pages, chunkCount: estimateChunksFromPages(pages) };
  }

  onProgress?.(100);
  return {
    pageCount: null,
    chunkCount: estimateChunksFromSize(file.size),
  };
}
