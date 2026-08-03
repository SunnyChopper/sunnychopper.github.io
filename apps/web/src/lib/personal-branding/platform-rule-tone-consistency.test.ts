import { describe, expect, it } from 'vitest';
import { checkPlatformRuleToneConsistency } from './platform-rule-tone-consistency';

const founderProfile = {
  id: 'p1',
  name: 'Founder',
  toneMetrics: { authority: 0.8, humor: 0.2, warmth: 0.5, clarity: 0.9 },
  bannedPhrases: ['synergy', 'leverage'],
};

const catalog = {
  modes: [
    {
      id: 'narrative',
      label: 'Narrative',
      definition: 'Tell a story with a clear sequence.',
      enabledEffect: 'Use chronological storytelling.',
    },
  ],
  devices: [
    {
      id: 'metaphor',
      label: 'Metaphor',
      definition: 'Direct comparison without like or as.',
      enabledEffect: 'May use metaphors.',
    },
  ],
};

describe('checkPlatformRuleToneConsistency', () => {
  it('returns info when no profiles are mapped', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Keep it conversational.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [],
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('info');
    expect(issues[0]?.message).toMatch(/map at least one core profile/i);
  });

  it('flags high authority vs conversational requirement', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Write in a conversational tone with casual slang.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [founderProfile],
    });

    const authorityIssue = issues.find((issue) => issue.metricKey === 'authority');
    expect(authorityIssue).toBeDefined();
    expect(authorityIssue?.message).toBe(
      '[Founder] High Authority (0.80) may conflict with the "conversational" requirement'
    );
    expect(authorityIssue?.severity).toBe('warning');
  });

  it('resolves authority via formality alias', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Use casual emoji-friendly language.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [
        {
          ...founderProfile,
          toneMetrics: { formality: 0.75 },
        },
      ],
    });

    expect(issues.some((issue) => issue.metricKey === 'formality')).toBe(true);
  });

  it('flags low humor vs joke cues', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Open with a witty joke.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [founderProfile],
    });

    expect(issues.some((issue) => issue.metricKey === 'humor')).toBe(true);
  });

  it('flags banned phrases in requirements', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Drive synergy across the funnel.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [founderProfile],
    });

    expect(issues.some((issue) => issue.message.includes('banned phrase'))).toBe(true);
  });

  it('checks rhetoric catalog text for conflicts', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: '',
      rhetoricalModes: [{ mode: 'narrative', strength: 'moderate' }],
      rhetoricalDevices: [],
      catalog,
      profiles: [
        {
          ...founderProfile,
          toneMetrics: { warmth: 0.2 },
        },
      ],
    });

    expect(issues.length).toBe(0);
  });

  it('checks all mapped profiles', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Stay conversational.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [
        founderProfile,
        {
          id: 'p2',
          name: 'Operator',
          toneMetrics: { authority: 0.85 },
          bannedPhrases: [],
        },
      ],
    });

    expect(issues.filter((issue) => issue.profileId === 'p1')).not.toHaveLength(0);
    expect(issues.filter((issue) => issue.profileId === 'p2')).not.toHaveLength(0);
  });

  it('skips lexicon when requirements and rhetoric text are empty', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: '   ',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [founderProfile],
    });

    expect(issues).toHaveLength(0);
  });

  it('returns empty when no conflicts detected', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements: 'Lead with evidence and structured analysis.',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [founderProfile],
    });

    expect(issues).toHaveLength(0);
  });

  it('caps issues at eight', () => {
    const issues = checkPlatformRuleToneConsistency({
      requirements:
        'conversational casual slang chill emoji lol informal relaxed tone buddy bro joke witty meme sarcasm warm friendly empathetic caring personable heartfelt compassionate',
      rhetoricalModes: [],
      rhetoricalDevices: [],
      profiles: [
        founderProfile,
        {
          id: 'p2',
          name: 'Operator',
          toneMetrics: { authority: 0.9, humor: 0.1, warmth: 0.1 },
          bannedPhrases: ['synergy', 'leverage', 'disrupt'],
        },
      ],
    });

    expect(issues.length).toBeLessThanOrEqual(8);
  });
});
