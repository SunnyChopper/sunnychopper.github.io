/**
 * Best-effort production stack remapping via deployed source maps.
 * Requires Vite `build.sourcemap: true` so `.js.map` files are fetchable.
 */
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';

const mapCache = new Map<string, TraceMap | null>();

const FRAME_RE =
  /^\s*at (?:(.+?)\s+\()?(?:async\s+)?(https?:\/\/[^)\s]+|\/[^)\s]+|file:\/\/[^)\s]+):(\d+):(\d+)\)?/;

type StackFrame = {
  raw: string;
  name?: string;
  url: string;
  line: number;
  column: number;
};

function parseFrames(stack: string): StackFrame[] {
  const frames: StackFrame[] = [];
  for (const raw of stack.split('\n')) {
    const match = FRAME_RE.exec(raw);
    if (!match) continue;
    frames.push({
      raw,
      name: match[1],
      url: match[2],
      line: Number(match[3]),
      column: Number(match[4]),
    });
  }
  return frames;
}

async function loadTraceMap(scriptUrl: string): Promise<TraceMap | null> {
  if (mapCache.has(scriptUrl)) return mapCache.get(scriptUrl) ?? null;
  try {
    const scriptRes = await fetch(scriptUrl);
    if (!scriptRes.ok) {
      mapCache.set(scriptUrl, null);
      return null;
    }
    const scriptText = await scriptRes.text();
    const mapMatch =
      /\/\/[#@]\s*sourceMappingURL=(\S+)\s*$/m.exec(scriptText) ||
      /\/\*[#@]\s*sourceMappingURL=(\S+)\s*\*\//.exec(scriptText);
    if (!mapMatch) {
      mapCache.set(scriptUrl, null);
      return null;
    }
    const mapUrl = new URL(mapMatch[1], scriptUrl).toString();
    const mapRes = await fetch(mapUrl);
    if (!mapRes.ok) {
      mapCache.set(scriptUrl, null);
      return null;
    }
    const mapJson = await mapRes.json();
    const tracer = new TraceMap(mapJson);
    mapCache.set(scriptUrl, tracer);
    return tracer;
  } catch {
    mapCache.set(scriptUrl, null);
    return null;
  }
}

function formatFrame(
  name: string | undefined,
  source: string,
  line: number,
  column: number
): string {
  const label = name ? `${name} (` : '';
  const close = name ? ')' : '';
  return `    at ${label}${source}:${line}:${column}${close}`;
}

/**
 * Returns a source-mapped stack when maps are available; otherwise undefined.
 */
export async function resolveOriginalStack(stack: string | undefined): Promise<string | undefined> {
  if (!stack) return undefined;
  const frames = parseFrames(stack);
  if (frames.length === 0) return undefined;

  const lines: string[] = [stack.split('\n')[0] || 'Error'];
  let mappedAny = false;

  for (const frame of frames) {
    const tracer = await loadTraceMap(frame.url);
    if (!tracer) {
      lines.push(frame.raw);
      continue;
    }
    const original = originalPositionFor(tracer, {
      line: frame.line,
      column: frame.column,
    });
    if (!original.source || original.line == null || original.column == null) {
      lines.push(frame.raw);
      continue;
    }
    mappedAny = true;
    lines.push(
      formatFrame(original.name || frame.name, original.source, original.line, original.column)
    );
  }

  return mappedAny ? lines.join('\n') : undefined;
}
