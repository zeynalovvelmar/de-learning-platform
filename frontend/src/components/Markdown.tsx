'use client';

import React, { isValidElement, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link2 } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { extractHeadings, type Heading } from '@/lib/markdown';
import { normalizeLang } from '@/lib/highlight';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  source: string;
  /** Prefix to keep heading ids unique when several markdown blocks share a page. */
  idScope?: string;
  /** Render the very first paragraph as an emphasised lead / analogy. */
  lead?: boolean;
  className?: string;
}

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return '';
}

/** Drop a dangling ":" at the end of a heading (common in the lesson sources). */
function tidyHeadingChildren(children: React.ReactNode): React.ReactNode {
  const arr = React.Children.toArray(children);
  if (arr.length === 0) return children;
  const last = arr[arr.length - 1];
  if (typeof last === 'string') {
    arr[arr.length - 1] = last.replace(/[:：]\s*$/, '');
  }
  return arr;
}

export function Markdown({ source, idScope = '', lead = false, className }: MarkdownProps) {
  const headings = useMemo(() => extractHeadings(source, idScope), [source, idScope]);
  const byLine = useMemo(() => {
    const map = new Map<number, Heading>();
    headings.forEach((h) => map.set(h.line, h));
    return map;
  }, [headings]);

  const components = useMemo<Components>(() => {
    const makeHeading =
      (level: 2 | 3 | 4) =>
      // eslint-disable-next-line react/display-name
      ({ node, children }: { node?: { position?: { start: { line: number } } }; children?: React.ReactNode }) => {
        const line = node?.position?.start.line ?? -1;
        const id = byLine.get(line)?.id;
        const plain = textOf(children);
        const numbered = /^(\d+)[.)]\s+/.exec(plain);
        const cleaned = tidyHeadingChildren(children);

        const base = 'group relative scroll-mt-24 text-ink tracking-tight';
        const sizes: Record<number, string> = {
          2: 'mt-11 mb-3 text-xl font-bold',
          3: 'mt-9 mb-2.5 text-[1.0625rem] font-semibold',
          4: 'mt-6 mb-2 text-[0.95rem] font-semibold text-ink-2',
        };
        const Tag = (`h${level}` as unknown) as React.ElementType;

        let content: React.ReactNode = cleaned;
        if (numbered && level === 3) {
          // Split "1. Title" into a numbered badge + title for a cleaner outline.
          const arr = React.Children.toArray(cleaned);
          if (typeof arr[0] === 'string') {
            arr[0] = (arr[0] as string).replace(/^(\d+)[.)]\s+/, '');
          }
          content = (
            <span className="flex items-baseline gap-3">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-accent-soft px-1.5 font-mono text-[0.75rem] font-bold text-accent">
                {numbered[1]}
              </span>
              <span>{arr}</span>
            </span>
          );
        }

        return (
          <Tag id={id} className={cn(base, sizes[level])}>
            {content}
            {id && (
              <a
                href={`#${id}`}
                aria-label="Link to section"
                className="ml-2 inline-block align-middle text-muted opacity-0 transition group-hover:opacity-100"
              >
                <Link2 className="h-3.5 w-3.5" />
              </a>
            )}
          </Tag>
        );
      };

    return {
      h1: makeHeading(2),
      h2: makeHeading(2),
      h3: makeHeading(3),
      h4: makeHeading(4),
      h5: makeHeading(4),
      h6: makeHeading(4),
      p: ({ node, children }) => {
        const isLead = lead && node?.position?.start.line === 1;
        return (
          <p
            className={cn(
              'my-3.5 text-[0.9375rem] leading-[1.8] text-ink-2',
              isLead &&
                'my-0 mb-6 rounded-r-xl border-l-[3px] border-accent bg-accent-soft/60 px-4 py-3 text-[0.98rem] italic text-ink',
            )}
          >
            {children}
          </p>
        );
      },
      ul: ({ children }) => (
        <ul className="my-3.5 space-y-2 pl-5 text-[0.9375rem] leading-[1.75] text-ink-2 marker:text-accent [&_ul]:mt-2 list-disc">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="my-3.5 space-y-2 pl-5 text-[0.9375rem] leading-[1.75] text-ink-2 marker:font-semibold marker:text-accent [&_ol]:mt-2 list-decimal">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="pl-1">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
      em: ({ children }) => <em className="italic text-ink">{children}</em>,
      a: ({ href, children }) => (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
        >
          {children}
        </a>
      ),
      hr: () => <hr className="my-8 border-line" />,
      blockquote: ({ children }) => (
        <blockquote className="my-5 rounded-r-xl border-l-[3px] border-amber-500 bg-amber-500/8 px-4 py-2.5 text-[0.9rem] text-ink-2 [&>p]:my-1.5">
          {children}
        </blockquote>
      ),
      table: ({ children }) => (
        <div className="my-5 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-[0.8125rem]">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-surface-2 text-ink">{children}</thead>,
      th: ({ children }) => <th className="px-3.5 py-2 font-semibold">{children}</th>,
      td: ({ children }) => <td className="border-t border-line px-3.5 py-2 text-ink-2">{children}</td>,
      // Fenced blocks arrive as <pre><code class="language-x">…</code></pre>
      pre: ({ children }) => {
        const child = React.Children.toArray(children)[0];
        if (isValidElement(child)) {
          const props = child.props as { className?: string; children?: React.ReactNode };
          const lang = /language-([\w+-]+)/.exec(props.className || '')?.[1];
          const code = textOf(props.children).replace(/\n$/, '');
          return <CodeBlock code={code} lang={normalizeLang(lang) === 'text' ? guess(code) : normalizeLang(lang)} />;
        }
        return <pre>{children}</pre>;
      },
      code: ({ children }) => (
        <code className="rounded-md border border-accent/15 bg-accent-soft px-1.5 py-[0.15em] font-mono text-[0.84em] font-medium text-accent">
          {children}
        </code>
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byLine, lead]);

  return (
    <div className={cn('min-w-0', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

/** Fallback guess for fences without a language label. */
function guess(code: string) {
  if (/^\s*(SELECT|WITH|INSERT|UPDATE|CREATE)\b/i.test(code)) return 'sql' as const;
  if (/^\s*(import|from|def|class|print)\b/m.test(code)) return 'python' as const;
  return 'text' as const;
}
