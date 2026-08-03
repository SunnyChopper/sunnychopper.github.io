import { describe, expect, it } from 'vitest';
import type { CreatorConnection } from '@/types/api/personal-branding.dto';
import {
  buildManualInteractionIntent,
  classifyPasteInput,
  matchConnectionByXHandle,
  parseXStatusUrl,
  stripStatusUrlFromText,
} from './manual-prompter-paste';

const connections: CreatorConnection[] = [
  {
    id: 'conn-1',
    name: 'Alice',
    handles: { x: 'alice' },
    conversationAngles: [],
    tags: [],
    userId: 'user-1',
    createdAt: '2026-07-21T00:00:00.000Z',
    updatedAt: '2026-07-21T00:00:00.000Z',
  },
];

describe('parseXStatusUrl', () => {
  it('parses standard status URLs', () => {
    expect(parseXStatusUrl('https://x.com/alice/status/123')).toEqual({
      authorUsername: 'alice',
      platformPostId: '123',
      evidenceUrl: 'https://x.com/alice/status/123',
    });
  });

  it('parses web status URLs without handle', () => {
    expect(parseXStatusUrl('https://x.com/i/web/status/999')).toEqual({
      platformPostId: '999',
      evidenceUrl: 'https://x.com/i/web/status/999',
    });
  });
});

describe('classifyPasteInput', () => {
  it('does not treat status URLs as creator text', () => {
    const classified = classifyPasteInput('https://x.com/alice/status/123');
    expect(classified.kind).toBe('statusUrl');
    expect(classified.creatorText).toBeUndefined();
  });

  it('treats plain text as creator text', () => {
    const classified = classifyPasteInput('Ship fast, learn faster.');
    expect(classified.kind).toBe('plainText');
    expect(classified.creatorText).toBe('Ship fast, learn faster.');
  });
});

describe('buildManualInteractionIntent', () => {
  it('builds reply intent with handle', () => {
    expect(buildManualInteractionIntent({ action: 'reply', authorUsername: 'alice' })).toContain(
      '@alice'
    );
  });
});

describe('matchConnectionByXHandle', () => {
  it('matches directory connection by X handle', () => {
    expect(matchConnectionByXHandle(connections, 'alice')?.id).toBe('conn-1');
    expect(matchConnectionByXHandle(connections, '@Alice')?.id).toBe('conn-1');
    expect(matchConnectionByXHandle(connections, 'missing')).toBeNull();
  });
});

describe('stripStatusUrlFromText', () => {
  it('removes a lone status URL from textarea content', () => {
    expect(stripStatusUrlFromText('https://x.com/alice/status/123')).toEqual({
      text: '',
      statusUrl: {
        authorUsername: 'alice',
        platformPostId: '123',
        evidenceUrl: 'https://x.com/alice/status/123',
      },
    });
  });
});
