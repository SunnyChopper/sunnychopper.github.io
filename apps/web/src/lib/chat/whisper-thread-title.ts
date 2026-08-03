import type { ChatThread } from '@/types/chatbot';

const WHISPER_TITLE_PREFIX = /^whisper:\s*/i;
const WHISPER_THREAD_TITLE_MAX_LEN = 40;

export function toTitleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function buildWhisperThreadTitle(sessionTitle: string): string {
  return toTitleCase(sessionTitle).slice(0, WHISPER_THREAD_TITLE_MAX_LEN);
}

export function stripLegacyWhisperTitlePrefix(title: string): string {
  return title.replace(WHISPER_TITLE_PREFIX, '').trim();
}

export function isLegacyWhisperPrefixedTitle(title: string): boolean {
  return WHISPER_TITLE_PREFIX.test(title.trim());
}

export function resolveThreadTitleDisplay(
  thread: Pick<ChatThread, 'title' | 'whisperOriginated'>
): {
  displayTitle: string;
  showWhisperBadge: boolean;
} {
  const rawTitle = thread.title.trim();
  const legacyWhisper = isLegacyWhisperPrefixedTitle(rawTitle);
  const showWhisperBadge = Boolean(thread.whisperOriginated) || legacyWhisper;
  const body = legacyWhisper ? stripLegacyWhisperTitlePrefix(rawTitle) : rawTitle;
  const displayTitle = showWhisperBadge ? toTitleCase(body) : body;

  return { displayTitle, showWhisperBadge };
}

export function resolveThreadListBadge(
  thread: Pick<ChatThread, 'automationOriginated' | 'whisperOriginated' | 'title'>
): 'Whisper' | 'Auto' | undefined {
  const { showWhisperBadge } = resolveThreadTitleDisplay(thread);
  if (showWhisperBadge) {
    return 'Whisper';
  }
  if (thread.automationOriginated) {
    return 'Auto';
  }
  return undefined;
}
