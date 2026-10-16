'use client';

import React, { useMemo, useState } from 'react';
import { Terminal, Copy, Check, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { stripFence } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface AsciiDiagramProps {
  diagramText: string;
  title?: string;
  className?: string;
}

// Tokenize a line of ASCII / Unicode diagram into syntax-colored spans
function renderDiagramLine(line: string, lineIdx: number): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    // 1. Arrow connectors: ──►, -->, ◄──, <--, ──>, etc.
    const arrowMatch = /^(──►|-->|◄──|<--|──>|==>|<==|◄|►|▲|▼|↑|↓|→|←)/.exec(rest);
    if (arrowMatch) {
      elements.push(
        <span
          key={`arr-${lineIdx}-${keyCounter++}`}
          className="font-bold text-amber-400 dark:text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.25)]"
        >
          {arrowMatch[0]}
        </span>
      );
      i += arrowMatch[0].length;
      continue;
    }

    // 2. Box-drawing characters (Unicode & ASCII frames)
    const boxMatch = /^([─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬┄┆┈┊━┃┏┓┗┛┣┫┳┻╋\+\|]{1,}|[-]{2,})/.exec(rest);
    if (boxMatch) {
      elements.push(
        <span
          key={`box-${lineIdx}-${keyCounter++}`}
          className="text-sky-500/80 dark:text-sky-400/80 select-none"
        >
          {boxMatch[0]}
        </span>
      );
      i += boxMatch[0].length;
      continue;
    }

    // 3. Highlighted tags: [Something], (Something), <Something>
    const tagMatch = /^(\[[A-Za-z0-9_\-.:/ ]+\]|\([A-Za-z0-9_\-.:/ ]+\))/.exec(rest);
    if (tagMatch) {
      elements.push(
        <span
          key={`tag-${lineIdx}-${keyCounter++}`}
          className="font-semibold text-cyan-300 dark:text-cyan-200"
        >
          {tagMatch[0]}
        </span>
      );
      i += tagMatch[0].length;
      continue;
    }

    // 4. Status / Role Keywords (case-insensitive words)
    const kwMatch = /^(\b(?:Leader|Follower|Primary|Replica|Offset|Partition|Topic|Broker|Zookeeper|Kraft|Worker|Driver|Executor|Master|Stage|Task|Bronze|Silver|Gold|Dim|Fact|Schema|Table|Column|OLTP|OLAP|ETL|ELT|ACID|CDC|WAL|RAM|Disk|Storage|Query|Consumer|Producer|Group)\b)/i.exec(rest);
    if (kwMatch) {
      elements.push(
        <span
          key={`kw-${lineIdx}-${keyCounter++}`}
          className="font-semibold text-emerald-400 dark:text-emerald-300"
        >
          {kwMatch[0]}
        </span>
      );
      i += kwMatch[0].length;
      continue;
    }

    // 5. Default text / spaces - accumulate regular characters until next special token
    let j = 1;
    while (i + j < line.length) {
      const nextChar = line[i + j];
      if (
        /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬┄┆┈┊━┃┏┓┗┛┣┫┳┻╋\+\|◄►▲▼↑↓→←\[\(\]]/.test(nextChar) ||
        (nextChar === '-' && line[i + j + 1] === '-')
      ) {
        break;
      }
      j++;
    }

    elements.push(
      <span key={`txt-${lineIdx}-${keyCounter++}`} className="text-zinc-200 dark:text-zinc-200">
        {line.slice(i, i + j)}
      </span>
    );
    i += j;
  }

  return (
    <div key={`line-${lineIdx}`} className="min-w-max leading-snug">
      {elements.length > 0 ? elements : '\u00A0'}
    </div>
  );
}

export function AsciiDiagram({ diagramText, title, className }: AsciiDiagramProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [compact, setCompact] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const clean = useMemo(() => stripFence(diagramText || ''), [diagramText]);
  const lines = useMemo(() => clean.split('\n'), [clean]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  if (!clean.trim()) return null;

  const isAz = language === 'az';
  const defaultTitle = isAz ? 'ARXİTEKTURA & AXIN DİAQRAMI' : 'ARCHITECTURE & FLOW DIAGRAM';

  return (
    <div
      className={cn(
        'group/diagram my-6 overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 text-zinc-100 shadow-xl transition-all dark:border-zinc-800/80 dark:bg-zinc-950/95',
        expanded && 'fixed inset-4 z-50 my-0 flex flex-col shadow-2xl backdrop-blur-md sm:inset-8',
        className
      )}
      role="region"
      aria-label={title || defaultTitle}
    >
      {/* Blueprint Terminal Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/90 bg-zinc-900/90 px-4 py-2.5 backdrop-blur-xs">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="ml-2 flex items-center gap-1.5 truncate font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span className="truncate">{title || defaultTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom / Font-size toggle */}
          <button
            type="button"
            onClick={() => setCompact((c) => !c)}
            title={compact ? (isAz ? 'Böyüt' : 'Increase size') : (isAz ? 'Kompakt ölçü' : 'Compact size')}
            aria-label="Toggle diagram font size"
            className="flex items-center gap-1 rounded-md border border-zinc-700/60 bg-zinc-800/80 px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            {compact ? <ZoomIn className="h-3 w-3 text-cyan-400" /> : <ZoomOut className="h-3 w-3 text-zinc-400" />}
            <span className="hidden sm:inline font-mono">{compact ? 'Zoom +' : 'Zoom -'}</span>
          </button>

          {/* Fullscreen Expand/Collapse toggle */}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? (isAz ? 'Kiçilt' : 'Exit fullscreen') : (isAz ? 'Tam ekran' : 'Fullscreen')}
            aria-label="Toggle diagram expansion"
            className="hidden sm:flex items-center gap-1 rounded-md border border-zinc-700/60 bg-zinc-800/80 px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            {expanded ? <Minimize2 className="h-3 w-3 text-amber-400" /> : <Maximize2 className="h-3 w-3 text-zinc-400" />}
            <span className="font-mono">{expanded ? (isAz ? 'Bağla' : 'Close') : (isAz ? 'Genişləndir' : 'Expand')}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700/60 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{isAz ? 'Kopyalandı' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>{isAz ? 'Kopyala' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Blueprint Visual Canvas with Subtle Dot Grid */}
      <div
        className={cn(
          'relative p-4 sm:p-5 overflow-x-auto bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900/90 font-mono select-text',
          expanded ? 'flex-1 overflow-y-auto' : 'max-h-[38rem] overflow-y-auto',
          compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-[12.5px]'
        )}
      >
        <div className="w-fit min-w-full font-mono">
          {lines.map((line, idx) => renderDiagramLine(line, idx))}
        </div>
      </div>
    </div>
  );
}
