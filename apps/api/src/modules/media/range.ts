export function parseByteRange(header: string | undefined, size: number) {
  if (!header) return { status: 200 as const, start: 0, end: Math.max(0, size - 1) };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || size <= 0) return { status: 416 as const };
  const [, startText, endText] = match;
  if (!startText && !endText) return { status: 416 as const };

  let start: number;
  let end: number;
  if (!startText) {
    const suffix = Number(endText);
    if (!Number.isFinite(suffix) || suffix <= 0) return { status: 416 as const };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(startText);
    end = endText ? Number(endText) : size - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
    return { status: 416 as const };
  }
  return { status: 206 as const, start, end: Math.min(end, size - 1) };
}
