import type {
  BrandPlatform,
  RhetoricalDeviceId,
  RhetoricalModeSetting,
} from '@/types/api/personal-branding.dto';

export type PlatformRuleTemplateId =
  | 'x-thread-educational'
  | 'linkedin-thought-leadership'
  | 'medium-deep-dive'
  | 'instagram-caption-punchy'
  | 'newsletter-briefing';

export interface PlatformRuleTemplate {
  id: PlatformRuleTemplateId;
  label: string;
  description: string;
  platform: BrandPlatform;
  name: string;
  requirements: string;
  rhetoricalModes: RhetoricalModeSetting[];
  rhetoricalDevices: RhetoricalDeviceId[];
}

export const PLATFORM_RULE_TEMPLATES: readonly PlatformRuleTemplate[] = [
  {
    id: 'x-thread-educational',
    label: 'X Thread – Educational',
    description: 'Short thread with one idea per post and a clear teaching arc.',
    platform: 'x',
    name: 'X Thread – Educational',
    requirements: [
      'Write as a numbered thread: one clear idea per post.',
      'Open with a hook that states the payoff; close with a concise takeaway or CTA.',
      'Use plain language; define jargon when it appears.',
      'Prefer concrete examples over abstract claims.',
      'Keep each post self-contained while advancing the overall lesson.',
    ].join('\n'),
    rhetoricalModes: [
      { mode: 'instructional', strength: 'strong' },
      { mode: 'expository', strength: 'moderate' },
    ],
    rhetoricalDevices: ['rhetoricalQuestion', 'analogy', 'ruleOfThree', 'parallelism'],
  },
  {
    id: 'linkedin-thought-leadership',
    label: 'LinkedIn Thought Leadership',
    description: 'Opinion-led post with evidence, short paragraphs, and a clear takeaway.',
    platform: 'linkedin',
    name: 'LinkedIn Thought Leadership',
    requirements: [
      'Lead with a strong hook in the first two lines before the fold.',
      'State a clear point of view, then support it with evidence or experience.',
      'Use short paragraphs with line breaks for scanability.',
      'End with one actionable takeaway or reflection question.',
      'Tone: professional, direct, and conversational — not salesy.',
    ].join('\n'),
    rhetoricalModes: [
      { mode: 'persuasive', strength: 'moderate' },
      { mode: 'argumentative', strength: 'moderate' },
      { mode: 'narrative', strength: 'light' },
    ],
    rhetoricalDevices: ['anecdote', 'antithesis', 'rhetoricalQuestion', 'metaphor'],
  },
  {
    id: 'medium-deep-dive',
    label: 'Medium Deep Dive',
    description: 'Long-form analysis with structure, narrative, and reader value.',
    platform: 'medium',
    name: 'Medium Deep Dive',
    requirements: [
      'Structure with a compelling intro, 3–5 substantive sections, and a synthesizing conclusion.',
      'Go deep: explain the why, not just the what; cite reasoning or lived experience.',
      'Use subheadings to guide the reader through the argument.',
      'Balance narrative momentum with analytical rigor.',
      'Close by restating the core insight and its practical implication.',
    ].join('\n'),
    rhetoricalModes: [
      { mode: 'expository', strength: 'strong' },
      { mode: 'narrative', strength: 'moderate' },
      { mode: 'instructional', strength: 'light' },
    ],
    rhetoricalDevices: ['analogy', 'anecdote', 'metaphor', 'parallelism'],
  },
  {
    id: 'instagram-caption-punchy',
    label: 'Instagram Caption – Punchy',
    description: 'Bold opening, visual language, and a tight CTA.',
    platform: 'instagram',
    name: 'Instagram Caption – Punchy',
    requirements: [
      'Open with a punchy first line that stops the scroll.',
      'Write in a visual, sensory style that complements the image or reel.',
      'Keep sentences short; use line breaks for rhythm.',
      'Include one clear CTA (save, comment, link in bio, etc.).',
      'Use emojis sparingly — at most 2–3, only when they add tone.',
    ].join('\n'),
    rhetoricalModes: [
      { mode: 'persuasive', strength: 'moderate' },
      { mode: 'descriptive', strength: 'light' },
    ],
    rhetoricalDevices: ['hyperbole', 'rhetoricalQuestion', 'ruleOfThree', 'metaphor'],
  },
  {
    id: 'newsletter-briefing',
    label: 'Newsletter Briefing',
    description: 'Scannable briefing with sections, bullets, and an actionable close.',
    platform: 'newsletter',
    name: 'Newsletter Briefing',
    requirements: [
      'Lead with the single most important insight in the first paragraph.',
      'Organize into clearly labeled sections the reader can skim.',
      'Use bullet points for lists of 3+ items.',
      'Keep a warm, direct voice — like briefing a smart friend.',
      'End with one concrete next step or reflection prompt.',
    ].join('\n'),
    rhetoricalModes: [
      { mode: 'expository', strength: 'moderate' },
      { mode: 'instructional', strength: 'moderate' },
      { mode: 'persuasive', strength: 'light' },
    ],
    rhetoricalDevices: ['analogy', 'parallelism', 'rhetoricalQuestion', 'anecdote'],
  },
] as const;

const templateById = new Map(PLATFORM_RULE_TEMPLATES.map((template) => [template.id, template]));

export function getPlatformRuleTemplate(id: PlatformRuleTemplateId): PlatformRuleTemplate {
  const template = templateById.get(id);
  if (!template) {
    throw new Error(`Unknown platform rule template: ${id}`);
  }
  return template;
}
