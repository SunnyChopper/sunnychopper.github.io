import { describe, expect, it } from 'vitest';

import type {
  ProfileExtractionSource,
  ProfileExtractionSourceRun,
} from '@/types/api/personal-branding.dto';

import { extractionSourceFreshnessDisplay } from '../extraction-source-freshness';

function makeSource(overrides: Partial<ProfileExtractionSource> = {}): ProfileExtractionSource {
  return {
    id: 'src-1',
    sourceType: 'text',
    createdAt: '2026-01-01T00:00:00.000Z',
    freshness: 'fresh',
    ...overrides,
  };
}

describe('extractionSourceFreshnessDisplay', () => {
  it('shows never extracted when freshness is never', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null);
    expect(display.extractedLine).toBe('Never extracted');
    expect(display.label).toBe('Never');
    expect(display.tone).toBe('muted');
  });

  it('shows relative last extracted line when timestamp is present', () => {
    const display = extractionSourceFreshnessDisplay(
      makeSource({ freshness: 'fresh', lastExtractedAt: '2026-07-20T00:00:00.000Z' }),
      'Yesterday'
    );
    expect(display.extractedLine).toBe('Last extracted Yesterday');
    expect(display.label).toBe('Fresh');
    expect(display.tone).toBe('success');
  });

  it('uses danger tone when last extraction failed', () => {
    const display = extractionSourceFreshnessDisplay(
      makeSource({
        freshness: 'fresh',
        lastExtractionStatus: 'failed',
        lastExtractedAt: '2026-07-20T00:00:00.000Z',
      }),
      'Yesterday'
    );
    expect(display.label).toBe('Failed');
    expect(display.tone).toBe('danger');
    expect(display.tooltip).toMatch(/failed/i);
  });

  it('guides rerun for stale sources', () => {
    const display = extractionSourceFreshnessDisplay(
      makeSource({ freshness: 'stale', lastExtractedAt: '2026-01-01T00:00:00.000Z' }),
      '6 months ago'
    );
    expect(display.label).toBe('Stale');
    expect(display.tooltip).toMatch(/outdated/i);
  });

  it('shows Extracted when a live run succeeded', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null, {
      sourceId: 'src-1',
      status: 'succeeded',
    } satisfies ProfileExtractionSourceRun);
    expect(display.label).toBe('Extracted');
    expect(display.extractedLine).toBe('Extracted');
    expect(display.tone).toBe('success');
  });

  it('shows Partial when a live run has chunk progress', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null, {
      sourceId: 'src-1',
      status: 'running',
      processedChunkCount: 26,
      chunkCount: 33,
    } satisfies ProfileExtractionSourceRun);
    expect(display.label).toBe('Partial');
    expect(display.extractedLine).toBe('Partial — 26 of 33 chunks');
    expect(display.tone).toBe('warning');
  });

  it('shows Extracting when a live run is running without chunk progress', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null, {
      sourceId: 'src-1',
      status: 'running',
    } satisfies ProfileExtractionSourceRun);
    expect(display.label).toBe('Extracting…');
    expect(display.extractedLine).toBe('Extracting…');
  });

  it('shows Failed when a live run failed', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null, {
      sourceId: 'src-1',
      status: 'failed',
      error: 'No posts found',
    } satisfies ProfileExtractionSourceRun);
    expect(display.label).toBe('Failed');
    expect(display.extractedLine).toBe('Failed — No posts found');
    expect(display.tone).toBe('danger');
  });

  it('falls back to durable freshness for pending live runs', () => {
    const display = extractionSourceFreshnessDisplay(makeSource({ freshness: 'never' }), null, {
      sourceId: 'src-1',
      status: 'pending',
    } satisfies ProfileExtractionSourceRun);
    expect(display.label).toBe('Never');
    expect(display.extractedLine).toBe('Never extracted');
  });
});
