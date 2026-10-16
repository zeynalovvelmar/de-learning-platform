'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsDownUp, ChevronsUpDown, Copy, WrapText } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { CodeLang, LANG_LABEL, highlightToHtml } from '@/lib/highlight';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  lang: CodeLang;
  title?: string;
  /** Show line numbers (default: only for blocks longer than 6 lines). */
  lineNumbers?: boolean;
  /** Collapse blocks longer than this many lines behind a "show all" toggle. */
  collapseAfter?: number;
  className?: string;
}

const LANG_DOT: Record<CodeLang, string> = {
  python: 'bg-sky-500',
  sql: 'bg-amber-500',
  bash: 'bg-emerald-500',
  yaml: 'bg-rose-500',
  dockerfile: 'bg-blue-500',
  jinja: 'bg-orange-500',
  json: 'bg-lime-500',
  ini: 'bg-slate-500',
  text: 'bg-zinc-500',
};

export function CodeBlock({ code, lang, title, lineNumbers, collapseAfter = 26, className }: CodeBlockProps) {
  const { language } = useLanguage();
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const trimmed = useMemo(() => code.replace(/\s+$/, ''), [code]);
  const lineCount = useMemo(() => trimmed.split('\n').length, [trimmed]);
  const showLn = lineNumbers ?? lineCount > 6;
  const collapsible = lineCount > collapseAfter;

  useEffect(() => {
    let cancelled = false;
    highlightToHtml(trimmed, lang)
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [trimmed, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be unavailable (insecure context) */
    }
  };

  const az = language === 'az';

  return (
    <div
      className={cn(
        'group/code my-5 overflow-hidden rounded-xl border border-line bg-surface shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/70 px-3.5 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', LANG_DOT[lang])} aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-2">
            {LANG_LABEL[lang]}
          </span>
          {title && (
            <span className="truncate font-mono text-[11px] text-muted">· {title}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setWrap((w) => !w)}
            aria-pressed={wrap}
            title={az ? 'Sətir sındırma' : 'Toggle line wrap'}
            className={cn(
              'rounded-md p-1.5 text-muted transition hover:bg-line/60 hover:text-ink',
              wrap && 'bg-accent-soft text-accent',
            )}
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-muted transition hover:bg-line/60 hover:text-ink"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (az ? 'Kopyalandı' : 'Copied') : az ? 'Kopyala' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div
        className={cn('vz-code relative', collapsible && !expanded && 'max-h-[27rem] overflow-hidden')}
        data-ln={showLn}
        data-wrap={wrap}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre>
            <code>{trimmed}</code>
          </pre>
        )}

        {collapsible && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
        )}
      </div>

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-surface-2/60 py-2 text-[11px] font-semibold text-muted transition hover:text-ink"
        >
          {expanded ? <ChevronsDownUp className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
          {expanded
            ? az
              ? 'Qısalt'
              : 'Collapse'
            : az
              ? `Hamısını göstər (${lineCount} sətir)`
              : `Show all (${lineCount} lines)`}
        </button>
      )}
    </div>
  );
}
