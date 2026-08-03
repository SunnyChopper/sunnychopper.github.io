import type { CreatorConnection } from '@/types/api/personal-branding.dto';
import {
  normalizeHandle,
  parseConnectionProfile,
} from '@/pages/admin/personal-branding/rolodex/rolodex-platform';

export type PrompterIntentAction = 'reply' | 'quote' | 'engage';

export interface XStatusUrlParts {
  authorUsername?: string;
  platformPostId: string;
  evidenceUrl: string;
}

export interface ClassifiedPasteInput {
  kind: 'statusUrl' | 'plainText';
  raw: string;
  statusUrl?: XStatusUrlParts;
  creatorText?: string;
}

const STATUS_URL_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([^/?#]+)\/status\/(\d+)/i;
const WEB_STATUS_URL_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/i\/web\/status\/(\d+)/i;

function normalizeEvidenceUrl(raw: string): string {
  const trimmed = raw.trim();
  const withScheme = trimmed.startsWith('http')
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, '')}`;
  return withScheme.split('?')[0] ?? withScheme;
}

export function parseXStatusUrl(input: string): XStatusUrlParts | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const full = STATUS_URL_RE.exec(trimmed);
  if (full) {
    const handle = full[1]?.replace(/^@+/, '');
    if (!handle || handle.toLowerCase() === 'i' || handle.toLowerCase() === 'intent') {
      return null;
    }
    return {
      authorUsername: handle,
      platformPostId: full[2]!,
      evidenceUrl: normalizeEvidenceUrl(trimmed),
    };
  }

  const web = WEB_STATUS_URL_RE.exec(trimmed);
  if (web) {
    return {
      platformPostId: web[1]!,
      evidenceUrl: normalizeEvidenceUrl(trimmed),
    };
  }

  return null;
}

export function isXStatusUrl(input: string): boolean {
  return parseXStatusUrl(input) !== null;
}

export function classifyPasteInput(raw: string): ClassifiedPasteInput {
  const trimmed = raw.trim();
  const statusUrl = parseXStatusUrl(trimmed);
  if (statusUrl) {
    return { kind: 'statusUrl', raw: trimmed, statusUrl };
  }
  return { kind: 'plainText', raw: trimmed, creatorText: trimmed };
}

export function buildPrompterInteractionIntent(opts: {
  action: PrompterIntentAction;
  authorUsername?: string | null;
}): string {
  const handle = opts.authorUsername ? `@${normalizeHandle(opts.authorUsername)}` : 'the creator';

  if (opts.action === 'reply') {
    return `Draft a thoughtful reply to ${handle}'s post. Add value to the conversation while staying on-brand.`;
  }
  if (opts.action === 'quote') {
    return `Draft a quote post that adds your perspective to ${handle}'s post.`;
  }
  return `Engage thoughtfully with ${handle}'s post in a way that builds the relationship.`;
}

export function buildManualInteractionIntent(opts: {
  action: Extract<PrompterIntentAction, 'reply' | 'quote'>;
  authorUsername?: string | null;
}): string {
  return buildPrompterInteractionIntent(opts);
}

export function connectionXHandle(connection: CreatorConnection): string | null {
  const { platformId, handleOrUrl } = parseConnectionProfile(connection);
  if (platformId !== 'x' || !handleOrUrl) return null;
  return normalizeHandle(handleOrUrl);
}

export function matchConnectionByXHandle(
  connections: CreatorConnection[],
  handle: string | null | undefined
): CreatorConnection | null {
  const target = handle ? normalizeHandle(handle).toLowerCase() : '';
  if (!target) return null;
  return (
    connections.find((connection) => {
      const xHandle = connectionXHandle(connection);
      return xHandle?.toLowerCase() === target;
    }) ?? null
  );
}

export function stripStatusUrlFromText(text: string): {
  text: string;
  statusUrl: XStatusUrlParts | null;
} {
  const trimmed = text.trim();
  const statusUrl = parseXStatusUrl(trimmed);
  if (!statusUrl) {
    return { text, statusUrl: null };
  }
  return { text: '', statusUrl };
}
