import type { ReconPost } from '@/types/api/personal-branding.dto';

export interface ReconPrompterSeed {
  connectionId: string;
  creatorText: string;
  interactionIntent: string;
  authorHandle?: string | null;
  evidenceUrl?: string | null;
  platformPostId?: string | null;
  reconPostId?: string;
}

export type ReconPrompterPrefill = Omit<ReconPrompterSeed, 'connectionId'>;

type ReconIntentPost = Pick<
  ReconPost,
  | 'recommendedAction'
  | 'authorUsername'
  | 'suggestedAngle'
  | 'relevanceRationale'
  | 'relevanceRationaleBullets'
  | 'text'
>;

const INTENT_MAX_LENGTH = 600;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateIntent(value: string, maxLength = INTENT_MAX_LENGTH): string {
  const trimmed = normalizeWhitespace(value);
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function excerptFromPostText(text: string, maxLength = 120): string {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return '';
  const firstLine = normalized.split(/(?<=[.!?])\s+/)[0] ?? normalized;
  if (firstLine.length <= maxLength) return firstLine;
  return `${firstLine.slice(0, maxLength - 1).trimEnd()}…`;
}

function actionVerb(action: string): 'reply' | 'quote' | 'engage' {
  const normalized = action.toLowerCase();
  if (normalized === 'quote') return 'quote';
  if (normalized === 'reply') return 'reply';
  return 'engage';
}

function actionFraming(action: string, handle: string): string {
  const verb = actionVerb(action);
  if (verb === 'quote') {
    return `Quote ${handle}'s post with a sharp, original take that invites discussion.`;
  }
  if (verb === 'reply') {
    return `Reply to ${handle} with a specific, value-adding response that earns a follow-up.`;
  }
  return `Engage with ${handle}'s post in a way that builds relationship warmth and visibility.`;
}

export function buildReconInteractionIntent(post: ReconIntentPost): string {
  const suggestedAngle = normalizeWhitespace(post.suggestedAngle ?? '');
  if (suggestedAngle) {
    return truncateIntent(suggestedAngle);
  }

  const action = (post.recommendedAction ?? '').toLowerCase();
  const handle = post.authorUsername ? `@${post.authorUsername}` : 'the creator';
  const rationale = normalizeWhitespace(post.relevanceRationale ?? '');
  const bullets = (post.relevanceRationaleBullets ?? [])
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .slice(0, 2);
  const excerpt = excerptFromPostText(post.text);

  const parts: string[] = [actionFraming(action, handle)];

  if (rationale) {
    parts.push(`Opportunity: ${rationale}`);
  }

  if (bullets.length > 0) {
    parts.push(`Angle: ${bullets.join(' · ')}`);
  }

  if (excerpt) {
    parts.push(`React to: "${excerpt}"`);
  }

  return truncateIntent(parts.join(' '));
}

export function ctaLabelForReconPost(post: Pick<ReconPost, 'recommendedAction'>): string {
  const action = (post.recommendedAction ?? '').toLowerCase();
  if (action === 'quote') return 'Draft quote';
  return 'Draft reply';
}

export function buildReconPrompterSeed(post: ReconPost): ReconPrompterSeed {
  return {
    connectionId: post.connectionId,
    creatorText: post.text,
    interactionIntent: buildReconInteractionIntent(post),
    authorHandle: post.authorUsername,
    evidenceUrl: post.url,
    platformPostId: post.platformPostId,
    reconPostId: post.id,
  };
}
