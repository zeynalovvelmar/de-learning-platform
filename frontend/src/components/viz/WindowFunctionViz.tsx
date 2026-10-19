'use client';

import React, { useState } from 'react';
import { Table2, Layers, ArrowRight } from 'lucide-react';
import { VizFrame } from './VizFrame';
import { L } from './shared';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

interface EmpRow {
  name: string;
  salary: number;
  rowNum: number;
  rank: number;
  denseRank: number;
  lag: string;
  tie?: boolean;
}

const ENG_ROWS: EmpRow[] = [
  { name: 'Murad', salary: 5000, rowNum: 1, rank: 1, denseRank: 1, lag: 'NULL' },
  { name: 'Elmar', salary: 4200, rowNum: 2, rank: 2, denseRank: 2, lag: '5000 ₼', tie: true },
  { name: 'Leyla', salary: 4200, rowNum: 3, rank: 2, denseRank: 2, lag: '4200 ₼', tie: true },
  { name: 'Kənan', salary: 3500, rowNum: 4, rank: 4, denseRank: 3, lag: '4200 ₼' },
];

const MKT_ROWS: EmpRow[] = [
  { name: 'Sarah', salary: 3800, rowNum: 1, rank: 1, denseRank: 1, lag: 'NULL' },
  { name: 'John', salary: 2500, rowNum: 2, rank: 2, denseRank: 2, lag: '3800 ₼' },
];

export function WindowFunctionViz() {
  const { language } = useLanguage();
  const az = language === 'az';
  const [focusFn, setFocusFn] = useState<'all' | 'rank' | 'lag'>('all');

  return (
    <VizFrame
      badge="Window OVER()"
      title={L(
        'Pəncərə Funksiyaları: PARTITION BY dept ORDER BY salary DESC',
        'Window Functions: PARTITION BY dept ORDER BY salary DESC'
      )}
      subtitle={L(
        'GROUP BY sətirləri sıxıb birləşdirir; Window funksiyası isə hər sətrin özünü saxlayaraq qonşu sətirlər üzrə hesablama aparır',
        'Unlike GROUP BY which collapses rows, Window functions preserve every row while computing across partition peers'
      )}
      actions={
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs font-mono">
          {[
            { id: 'all', label: az ? 'Bütün Funksiyalar' : 'All Functions' },
            { id: 'rank', label: 'ROW_NUMBER vs RANK vs DENSE_RANK' },
            { id: 'lag', label: 'LAG(salary, 1)' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFocusFn(btn.id as 'all' | 'rank' | 'lag')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                focusFn === btn.id
                  ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      }
      footer={L(
        'Elmar və Leyla eyni maaşı (4200 ₼) alır: ROW_NUMBER (2, 3) fərqli nömrə verir; RANK (2, 2 → növbəti 4) boşluq buraxır; DENSE_RANK (2, 2 → növbəti 3) isə sıranı qırmır. Hər yeni partisiyada LAG yenidən NULL-dan başlayır.',
        'Notice tied salaries (4200 ₼): ROW_NUMBER assigns (2, 3); RANK assigns (2, 2) and skips to 4; DENSE_RANK assigns (2, 2) and continues with 3. LAG resets to NULL at each partition boundary.'
      )}
    >
      <div className="space-y-4 font-mono text-xs">
        {/* SQL Spec Bar */}
        <div className="rounded-lg border border-line bg-surface px-3.5 py-2 text-muted flex flex-wrap items-center justify-between gap-2">
          <span>
            <code className="text-primary font-bold">
              OVER (PARTITION BY dept ORDER BY salary DESC)
            </code>
          </span>
          <span className="text-[11px] text-emerald-300 font-semibold">
            {az ? '2 Müstəqil Pəncərə (Partisiya Sərhədi)' : '2 Independent Partition Windows'}
          </span>
        </div>

        {/* Two Partitions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            {
              title: az ? 'Partisiya 1: dept = "Mühəndislik"' : 'Partition 1: dept = "Engineering"',
              exec: 'Executor A · 4 Rows',
              tone: 'border-indigo-500/40 bg-indigo-500/5',
              badgeTone: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              rows: ENG_ROWS,
            },
            {
              title: az ? 'Partisiya 2: dept = "Marketinq"' : 'Partition 2: dept = "Marketing"',
              exec: 'Executor B · 2 Rows',
              tone: 'border-emerald-500/40 bg-emerald-500/5',
              badgeTone: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              rows: MKT_ROWS,
            },
          ].map((part) => (
            <div key={part.title} className={cn('rounded-xl border p-3.5 space-y-3', part.tone)}>
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" />
                  {part.title}
                </span>
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold', part.badgeTone)}>
                  {part.exec}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase text-muted border-b border-line/50">
                      <th className="py-1.5 pr-2">Name</th>
                      <th className="py-1.5 px-2">Salary</th>
                      <th className={cn('py-1.5 px-2', focusFn === 'rank' && 'text-primary font-bold')}>row_num</th>
                      <th className={cn('py-1.5 px-2', focusFn === 'rank' && 'text-amber-300 font-bold')}>rank</th>
                      <th className={cn('py-1.5 px-2', focusFn === 'rank' && 'text-emerald-300 font-bold')}>dense</th>
                      <th className={cn('py-1.5 pl-2', focusFn === 'lag' && 'text-cyan-300 font-bold')}>lag(sal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/30">
                    {part.rows.map((r) => (
                      <tr
                        key={r.name}
                        className={cn(
                          'transition-colors',
                          r.tie && focusFn === 'rank' ? 'bg-amber-500/15' : 'hover:bg-surface/60'
                        )}
                      >
                        <td className="py-2 pr-2 font-bold text-ink">{r.name}</td>
                        <td className="py-2 px-2 text-ink-2">{r.salary} ₼</td>
                        <td className="py-2 px-2">
                          <span className="rounded bg-surface px-1.5 py-0.5 text-primary border border-line">
                            {r.rowNum}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 border',
                              r.tie
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-surface text-ink-2 border-line'
                            )}
                          >
                            {r.rank}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 border',
                              r.denseRank === 3 && r.rank === 4
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                : 'bg-surface text-ink-2 border-line'
                            )}
                          >
                            {r.denseRank}
                          </span>
                        </td>
                        <td className="py-2 pl-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded px-1.5 py-0.5',
                              r.lag === 'NULL'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            )}
                          >
                            <ArrowRight className="h-2.5 w-2.5" />
                            {r.lag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VizFrame>
  );
}
