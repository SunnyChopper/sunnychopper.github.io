import { describe, expect, it } from 'vitest';
import type { ReconPost } from '@/types/api/personal-branding.dto';
import {
  buildReconInteractionIntent,
  buildReconPrompterSeed,
  ctaLabelForReconPost,
} from './recon-prompter-seed';

const basePost: ReconPost = {
  id: 'post-1',
  connectionId: 'conn-1',
  connectionName: 'Alice',
  platformPostId: '123',
  authorUsername: 'alice',
  text: 'Hello world',
  url: 'https://x.com/alice/status/123',
  postedAt: '2026-07-21T12:00:00.000Z',
  likeCount: 1,
  retweetCount: 0,
  replyCount: 0,
  relevanceScore: 0.9,
  recommendedAction: 'reply',
  status: 'NEW',
  userId: 'user-1',
  createdAt: '2026-07-21T12:00:00.000Z',
  updatedAt: '2026-07-21T12:00:00.000Z',
};

describe('ctaLabelForReconPost', () => {
  it('returns Draft quote for quote action', () => {
    expect(ctaLabelForReconPost({ recommendedAction: 'quote' })).toBe('Draft quote');
  });

  it('returns Draft reply for reply and other actions', () => {
    expect(ctaLabelForReconPost({ recommendedAction: 'reply' })).toBe('Draft reply');
    expect(ctaLabelForReconPost({ recommendedAction: 'like' })).toBe('Draft reply');
    expect(ctaLabelForReconPost({ recommendedAction: null })).toBe('Draft reply');
  });
});

describe('buildReconInteractionIntent', () => {
  it('prefers suggestedAngle when present', () => {
    expect(
      buildReconInteractionIntent({
        recommendedAction: 'reply',
        authorUsername: 'alice',
        suggestedAngle: 'Add a contrarian insight on their AI thesis to spark debate.',
        relevanceRationale: 'High engagement window',
        relevanceRationaleBullets: ['Strong thread momentum'],
        text: 'AI will change everything',
      })
    ).toBe('Add a contrarian insight on their AI thesis to spark debate.');
  });

  it('builds reply-focused intent with rationale and excerpt fallback', () => {
    const intent = buildReconInteractionIntent({
      recommendedAction: 'reply',
      authorUsername: 'alice',
      suggestedAngle: null,
      relevanceRationale: 'Timely take on product launch',
      relevanceRationaleBullets: ['Brand fit on builder tools', 'Early replies get visibility'],
      text: 'We just shipped v2. Here is what changed.',
    });
    expect(intent).toContain('@alice');
    expect(intent).toContain('Reply to @alice');
    expect(intent).toContain('Opportunity: Timely take on product launch');
    expect(intent).toContain('Brand fit on builder tools');
    expect(intent).toContain('React to:');
    expect(intent).toContain('We just shipped v2.');
  });

  it('builds quote-focused intent with handle', () => {
    expect(
      buildReconInteractionIntent({
        recommendedAction: 'quote',
        authorUsername: 'bob',
        suggestedAngle: null,
        relevanceRationale: null,
        relevanceRationaleBullets: null,
        text: 'Hot take on markets',
      })
    ).toContain('@bob');
    expect(
      buildReconInteractionIntent({
        recommendedAction: 'quote',
        authorUsername: 'bob',
        suggestedAngle: null,
        relevanceRationale: null,
        relevanceRationaleBullets: null,
        text: 'Hot take on markets',
      })
    ).toContain('Quote @bob');
  });

  it('falls back to generic engage intent without handle', () => {
    expect(
      buildReconInteractionIntent({
        recommendedAction: 'monitor',
        authorUsername: null,
        suggestedAngle: null,
        relevanceRationale: null,
        relevanceRationaleBullets: null,
        text: 'Some post',
      })
    ).toContain('the creator');
  });
});

describe('buildReconPrompterSeed', () => {
  it('maps post fields into a prompter seed', () => {
    const seed = buildReconPrompterSeed(basePost);
    expect(seed).toEqual({
      connectionId: 'conn-1',
      creatorText: 'Hello world',
      interactionIntent: buildReconInteractionIntent(basePost),
      authorHandle: 'alice',
      evidenceUrl: 'https://x.com/alice/status/123',
      platformPostId: '123',
      reconPostId: 'post-1',
    });
  });
});
