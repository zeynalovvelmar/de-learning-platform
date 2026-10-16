export interface Heading {
  id: string;
  text: string;
  level: number;
  /** 1-based line number inside the markdown source (used to match renderer nodes). */
  line: number;
}

const AZ_MAP: Record<string, string> = {
  ə: 'e', Ə: 'e', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u', ç: 'c', Ç: 'c', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g',
};

export function slugify(input: string): string {
  const mapped = input.replace(/[əƏıİöÖüÜçÇşŞğĞ]/g, (c) => AZ_MAP[c] ?? c);
  return (
    mapped
      .toLowerCase()
      .replace(/[`*_~]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  );
}

/** Strip simple inline markdown so heading text reads cleanly in the TOC. */
export function stripInline(md: string): string {
  return md
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/** Extract h2/h3 headings (ignoring anything inside fenced code) with stable, de-duplicated ids. */
export function extractHeadings(markdown: string, scope = ''): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (!m) return;
    const text = stripInline(m[2].replace(/[:：]\s*$/, ''));
    if (!text) return;
    const base = `${scope}${slugify(text)}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      id: count === 0 ? base : `${base}-${count}`,
      text,
      level: m[1].length,
      line: idx + 1,
    });
  });

  return headings;
}

/** Rough reading-time estimate (minutes) from a list of text blocks. */
export function estimateReadMinutes(...blocks: Array<string | undefined>): number {
  const words = blocks
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 190));
}

/** Remove a wrapping ```lang fence (our ASCII infographics are stored fenced). */
export function stripFence(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  if (lines.length && /^```/.test(lines[0].trim())) lines.shift();
  if (lines.length && /^```\s*$/.test(lines[lines.length - 1].trim())) lines.pop();
  return lines.join('\n');
}
