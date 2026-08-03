export function stripMarkdownToPlain(text: string): string {
  let out = text;
  out = out.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');
  out = out.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  out = out.replace(/`([^`]+)`/g, '$1');
  out = out.replace(/^#{1,6}\s+/gm, '');
  out = out.replace(/^>\s?/gm, '');
  out = out.replace(/^[\s]*[-*+]\s+/gm, '');
  out = out.replace(/^[\s]*\d+\.\s+/gm, '');
  out = out.replace(/~~(.*?)~~/g, '$1');
  out = out.replace(/(\*\*|__)(.*?)\1/g, '$2');
  out = out.replace(/(\*|_)(.*?)\1/g, '$2');
  out = out.replace(/^[-*_]{3,}\s*$/gm, '');
  return out.replace(/\s+/g, ' ').trim();
}

export function previewFromText(text: string, maxLen = 90): string {
  const flat = stripMarkdownToPlain(text);
  if (!flat) return '';
  return flat.length > maxLen ? `${flat.slice(0, maxLen - 1)}…` : flat;
}

export function formatThreadListPreview(
  role: 'user' | 'assistant' | undefined,
  preview: string | undefined
): string | undefined {
  const body = previewFromText(preview ?? '');
  if (!body) return undefined;
  const prefix = role === 'user' ? 'You: ' : 'AI: ';
  return `${prefix}${body}`;
}
