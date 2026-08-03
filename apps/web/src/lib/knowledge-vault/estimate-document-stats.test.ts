import { describe, expect, it } from 'vitest';
import {
  countPdfPagesFromBytes,
  estimateDocumentStats,
} from '@/lib/knowledge-vault/estimate-document-stats';

describe('countPdfPagesFromBytes', () => {
  it('counts page objects excluding Pages catalog', () => {
    const pdfBytes = new TextEncoder().encode(
      '%PDF-1.4\n/Type /Pages\nkids\n/Type /Page\n/Type /Page\n/Type /Page\n'
    );
    expect(countPdfPagesFromBytes(pdfBytes)).toBe(3);
  });

  it('returns at least 1 when no page markers found', () => {
    const bytes = new TextEncoder().encode('not a pdf');
    expect(countPdfPagesFromBytes(bytes)).toBe(1);
  });
});

describe('estimateDocumentStats', () => {
  it('estimates text file pages and chunks from character count', async () => {
    const content = 'a'.repeat(6000);
    const file = new File([content], 'notes.txt', { type: 'text/plain' });
    const stats = await estimateDocumentStats(file);
    expect(stats.pageCount).toBe(2);
    expect(stats.chunkCount).toBeGreaterThanOrEqual(1);
  });

  it('returns 1 page and 1 chunk for images', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });
    const stats = await estimateDocumentStats(file);
    expect(stats.pageCount).toBe(1);
    expect(stats.chunkCount).toBe(1);
  });

  it('heuristically estimates docx pages from size', async () => {
    const file = new File([new Uint8Array(80_000)], 'deck.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const stats = await estimateDocumentStats(file);
    expect(stats.pageCount).toBe(2);
    expect(stats.chunkCount).toBeGreaterThanOrEqual(1);
  });

  it('estimates pdf pages from byte content', async () => {
    const pdfContent = '/Type /Page\n/Type /Page\n';
    const file = new File([pdfContent], 'doc.pdf', { type: 'application/pdf' });
    const stats = await estimateDocumentStats(file);
    expect(stats.pageCount).toBe(2);
    expect(stats.chunkCount).toBeGreaterThanOrEqual(1);
  });
});
