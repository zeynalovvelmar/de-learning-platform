'use client';

import React, { useState } from 'react';
import { Columns3, Rows3 } from 'lucide-react';
import { VizFrame, useViz } from './VizFrame';
import { L, type LText } from './shared';
import { cn } from '@/lib/utils';

const COLS = ['id', 'name', 'age', 'country', 'amount', 'date'] as const;
const AMOUNT = COLS.indexOf('amount');
const DATA: string[][] = [
  ['1', 'Aysel', '24', 'AZ', '120', '01-05'],
  ['2', 'Murad', '31', 'TR', '340', '01-06'],
  ['3', 'Leyla', '28', 'GE', '75', '01-06'],
  ['4', 'Vusal', '45', 'AZ', '910', '01-07'],
  ['5', 'Nigar', '37', 'DE', '215', '01-08'],
  ['6', 'Rauf', '29', 'US', '480', '01-09'],
];
const TARGET_ROW = 2; // id = 3

type Mode = 'analytics' | 'lookup';

function Cell({
  value,
  active,
  dim,
  delay,
  duration,
  tone,
}: {
  value: string;
  active: boolean;
  dim: boolean;
  delay: number;
  duration: number;
  tone: string;
}) {
  return (
    <span
      data-anim={active ? '' : undefined}
      className={cn(
        tone,
        'grid h-6 w-[2.9rem] place-items-center rounded-[5px] border border-line bg-surface font-mono text-[0.625rem] text-ink-2 transition-opacity',
        dim && 'opacity-30',
      )}
      style={
        active
          ? { animation: `vz-read ${duration}s ease-in-out ${delay}s infinite`, borderColor: 'rgb(var(--tone) / 0.5)' }
          : undefined
      }
    >
      {value}
    </span>
  );
}

function Panel({
  kind,
  mode,
}: {
  kind: 'row' | 'col';
  mode: Mode;
}) {
  const { lt } = useViz();
  const isRow = kind === 'row';
  const tone = isRow ? 'tone-blue' : 'tone-emerald';
  const title: LText = isRow ? L('Sətirli saxlanc (OLTP)', 'Row store (OLTP)') : L('Sütunlu saxlanc (OLAP)', 'Column store (OLAP)');
  const Icon = isRow ? Rows3 : Columns3;

  const activeAt = (r: number, c: number) => {
    if (mode === 'analytics') return isRow ? true : c === AMOUNT;
    return r === TARGET_ROW;
  };
  const delayAt = (r: number, c: number) => {
    if (mode === 'analytics') return isRow ? r * 0.42 : r * 0.16;
    return isRow ? 0 : c * 0.18;
  };
  const duration = mode === 'analytics' ? (isRow ? 3.6 : 1.9) : isRow ? 2.2 : 2.6;

  // Strips = contiguous bytes on disk.
  const strips = isRow
    ? DATA.map((row, r) => ({ key: `r${r}`, cells: row.map((v, c) => ({ v, r, c })) }))
    : COLS.map((_, c) => ({ key: `c${c}`, cells: DATA.map((row, r) => ({ v: row[c], r, c })) }));

  return (
    <div className={cn(tone, 'min-w-0 flex-1 rounded-xl border border-[rgb(var(--tone)/0.3)] bg-[rgb(var(--tone)/0.05)] p-3')}>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="vz-icon h-7 w-7 rounded-lg">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[0.75rem] font-bold text-ink">{lt(title)}</span>
      </div>

      <div className={cn('flex gap-[5px]', isRow ? 'flex-col' : 'flex-row')} role="img" aria-label={lt(title)}>
        {strips.map((strip) => (
          <div
            key={strip.key}
            className={cn(
              'flex gap-[3px] rounded-md border border-dashed border-[rgb(var(--tone)/0.35)] p-[3px]',
              isRow ? 'flex-row' : 'flex-col',
            )}
          >
            {strip.cells.map(({ v, r, c }) => {
              const active = activeAt(r, c);
              return (
                <Cell
                  key={`${r}-${c}`}
                  value={v}
                  active={active}
                  dim={!active}
                  delay={delayAt(r, c)}
                  duration={duration}
                  tone={tone}
                />
              );
            })}
          </div>
        ))}
      </div>
      {!isRow && (
        <div className="mt-1.5 flex gap-[5px]">
          {COLS.map((c) => (
            <span key={c} className="w-[calc(2.9rem+8px)] text-center font-mono text-[0.5625rem] uppercase tracking-wide text-muted">
              {c}
            </span>
          ))}
        </div>
      )}
      {isRow && (
        <p className="mt-2 text-[0.625rem] text-muted">
          {COLS.join(' · ')}
        </p>
      )}
    </div>
  );
}

function Meter({ label, value, tone }: { label: LText; value: number; tone: string }) {
  const { lt } = useViz();
  return (
    <div className={cn(tone, 'min-w-0 flex-1')}>
      <div className="mb-1 flex items-baseline justify-between text-[0.6875rem]">
        <span className="font-semibold text-ink-2">{lt(label)}</span>
        <span className="font-mono font-bold text-[rgb(var(--tone))]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full origin-left rounded-full bg-[rgb(var(--tone))]"
          style={{ width: `${value}%`, transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }}
        />
      </div>
    </div>
  );
}

export function ColumnarScanViz() {
  const [mode, setMode] = useState<Mode>('analytics');

  const actions = (
    <div className="flex rounded-lg border border-line bg-surface p-0.5 text-[0.6875rem] font-semibold">
      {(
        [
          ['analytics', L('Analitik sorğu', 'Analytics query')],
          ['lookup', L('Tək-sətir axtarışı', 'Single-row lookup')],
        ] as Array<[Mode, LText]>
      ).map(([m, label]) => (
        <ModeButton key={m} active={mode === m} onClick={() => setMode(m)} label={label} />
      ))}
    </div>
  );

  return (
    <VizFrame
      title={L('OLTP vs OLAP: disk-də məlumat necə oxunur?', 'OLTP vs OLAP: how data is read from disk')}
      subtitle={L('Eyni cədvəl, iki fərqli fiziki saxlanc', 'Same table, two physical layouts')}
      badge="Row vs Column"
      actions={actions}
      footer={
        mode === 'analytics'
          ? L(
              'SELECT SUM(amount) — sütunlu baza yalnız lazımi sütunu oxuyur; sətirli baza isə bütün sətirləri disk-dən çəkir.',
              'SELECT SUM(amount) — the column store reads only the needed column; the row store drags every full row off disk.',
            )
          : L(
              'SELECT * WHERE id = 3 — sətirli baza bir bloku oxuyur; sütunlu baza 6 ayrı sütun faylına müraciət etməli olur.',
              'SELECT * WHERE id = 3 — the row store reads one contiguous block; the column store must seek into 6 separate column files.',
            )
      }
    >
      <QueryChip mode={mode} />
      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
        <Panel kind="row" mode={mode} />
        <Panel kind="col" mode={mode} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {mode === 'analytics' ? (
          <>
            <Meter label={L('Oxunan data (sətirli)', 'Data scanned (row)')} value={100} tone="tone-blue" />
            <Meter label={L('Oxunan data (sütunlu)', 'Data scanned (column)')} value={17} tone="tone-emerald" />
          </>
        ) : (
          <>
            <Meter label={L('Disk müraciəti (sətirli)', 'Disk seeks (row)')} value={17} tone="tone-blue" />
            <Meter label={L('Disk müraciəti (sütunlu)', 'Disk seeks (column)')} value={100} tone="tone-emerald" />
          </>
        )}
      </div>
    </VizFrame>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: LText }) {
  const { lt } = useViz();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md px-2.5 py-1 transition',
        active ? 'bg-accent text-white shadow-sm dark:text-zinc-950' : 'text-ink-2 hover:text-ink',
      )}
    >
      {lt(label)}
    </button>
  );
}

function QueryChip({ mode }: { mode: Mode }) {
  return (
    <div className="flex justify-center">
      <code className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-mono text-[0.75rem] text-ink">
        <span className="text-violet-500">SELECT</span>{' '}
        {mode === 'analytics' ? (
          <>
            <span className="text-sky-500">SUM</span>(amount) <span className="text-violet-500">FROM</span> orders;
          </>
        ) : (
          <>
            * <span className="text-violet-500">FROM</span> orders <span className="text-violet-500">WHERE</span> id ={' '}
            <span className="text-amber-500">3</span>;
          </>
        )}
      </code>
    </div>
  );
}
