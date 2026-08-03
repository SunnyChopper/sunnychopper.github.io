import type {
  ExtractionSourceFreshness,
  ProfileExtractionSource,
  ProfileExtractionSourceRun,
} from '@/types/api/personal-branding.dto';

import type { StatusPillTone } from '../personal-branding-ui';

export interface ExtractionSourceFreshnessDisplay {
  label: string;
  tone: StatusPillTone;
  tooltip: string;
  extractedLine: string;
}

const FRESHNESS_LABEL: Record<ExtractionSourceFreshness, string> = {
  never: 'Never',
  fresh: 'Fresh',
  aging: 'Aging',
  stale: 'Stale',
};

const FRESHNESS_TONE: Record<ExtractionSourceFreshness, StatusPillTone> = {
  never: 'muted',
  fresh: 'success',
  aging: 'warning',
  stale: 'danger',
};

const STALE_GUIDANCE =
  'Pillars and tone may be outdated. Rerun extraction from stored sources to refresh.';

function extractionSourceDurableDisplay(
  source: ProfileExtractionSource,
  relativeExtractedAt: string | null
): ExtractionSourceFreshnessDisplay {
  const freshness = source.freshness ?? 'never';
  const failed = source.lastExtractionStatus === 'failed';

  const tone: StatusPillTone = failed ? 'danger' : FRESHNESS_TONE[freshness];
  const label = failed ? 'Failed' : FRESHNESS_LABEL[freshness];
  const tooltip = failed
    ? 'The last extraction run for this source failed. Rerun extraction to refresh pillars and tone.'
    : freshness === 'aging' || freshness === 'stale'
      ? STALE_GUIDANCE
      : freshness === 'never'
        ? 'This source has not been extracted yet.'
        : 'Recently extracted — pillars and tone reflect this source.';

  const extractedLine =
    freshness === 'never' || !relativeExtractedAt
      ? 'Never extracted'
      : `Last extracted ${relativeExtractedAt}`;

  return { label, tone, tooltip, extractedLine };
}

function extractionSourceLiveRunDisplay(
  liveRun: ProfileExtractionSourceRun,
  relativeExtractedAt: string | null
): ExtractionSourceFreshnessDisplay {
  if (liveRun.status === 'succeeded') {
    return {
      label: 'Extracted',
      tone: 'success',
      tooltip: 'This source was analyzed successfully in the current extraction run.',
      extractedLine: relativeExtractedAt ? `Last extracted ${relativeExtractedAt}` : 'Extracted',
    };
  }

  if (liveRun.status === 'failed') {
    const errorSnippet = liveRun.error && liveRun.error.length <= 80 ? ` — ${liveRun.error}` : '';
    return {
      label: 'Failed',
      tone: 'danger',
      tooltip: liveRun.error ?? 'This source failed during extraction.',
      extractedLine: `Failed${errorSnippet}`,
    };
  }

  const processedChunks = liveRun.processedChunkCount ?? 0;
  const totalChunks = liveRun.chunkCount ?? 0;
  if (processedChunks > 0 && totalChunks > 0) {
    return {
      label: 'Partial',
      tone: 'warning',
      tooltip: 'Chunk analysis in progress for this source.',
      extractedLine: `Partial — ${processedChunks} of ${totalChunks} chunks`,
    };
  }

  return {
    label: 'Extracting…',
    tone: 'warning',
    tooltip: 'This source is being processed.',
    extractedLine: 'Extracting…',
  };
}

export function extractionSourceFreshnessDisplay(
  source: ProfileExtractionSource,
  relativeExtractedAt: string | null,
  liveRun?: ProfileExtractionSourceRun | null
): ExtractionSourceFreshnessDisplay {
  if (liveRun && liveRun.status !== 'pending') {
    return extractionSourceLiveRunDisplay(liveRun, relativeExtractedAt);
  }

  return extractionSourceDurableDisplay(source, relativeExtractedAt);
}
