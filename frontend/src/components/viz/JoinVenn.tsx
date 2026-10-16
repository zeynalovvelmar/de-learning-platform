'use client';

import React, { useId, useState } from 'react';
import { VizFrame, useViz } from './VizFrame';
import { L, type LText } from './shared';
import { cn } from '@/lib/utils';

type JoinType = 'inner' | 'left' | 'right' | 'full' | 'leftAnti';

const USERS = [
  { id: 1, name: 'Aysel' },
  { id: 2, name: 'Murad' },
  { id: 3, name: 'Leyla' },
  { id: 4, name: 'Vusal' },
];
const ORDERS = [
  { id: 101, userId: 2 },
  { id: 102, userId: 3 },
  { id: 103, userId: 5 },
];

type Row = { user: string | null; order: number | null };

function resultFor(type: JoinType): Row[] {
  const matched: Row[] = ORDERS.filter((o) => USERS.some((u) => u.id === o.userId)).map((o) => ({
    user: USERS.find((u) => u.id === o.userId)!.name,
    order: o.id,
  }));
  const leftOnly: Row[] = USERS.filter((u) => !ORDERS.some((o) => o.userId === u.id)).map((u) => ({
    user: u.name,
    order: null,
  }));
  const rightOnly: Row[] = ORDERS.filter((o) => !USERS.some((u) => u.id === o.userId)).map((o) => ({
    user: null,
    order: o.id,
  }));
  switch (type) {
    case 'inner':
      return matched;
    case 'left':
      return [...leftOnly.slice(0, 1), ...matched, ...leftOnly.slice(1)];
    case 'right':
      return [...matched, ...rightOnly];
    case 'full':
      return [...leftOnly.slice(0, 1), ...matched, ...leftOnly.slice(1), ...rightOnly];
    case 'leftAnti':
      return leftOnly;
  }
}

const SQL: Record<JoinType, string[]> = {
  inner: ['FROM users u', 'INNER JOIN orders o', '  ON u.id = o.user_id;'],
  left: ['FROM users u', 'LEFT JOIN orders o', '  ON u.id = o.user_id;'],
  right: ['FROM users u', 'RIGHT JOIN orders o', '  ON u.id = o.user_id;'],
  full: ['FROM users u', 'FULL OUTER JOIN orders o', '  ON u.id = o.user_id;'],
  leftAnti: ['FROM users u', 'LEFT JOIN orders o', '  ON u.id = o.user_id', 'WHERE o.user_id IS NULL;'],
};

const LABELS: Record<JoinType, { name: string; desc: LText }> = {
  inner: {
    name: 'INNER',
    desc: L('Yalnız hər iki cədvəldə uyğunluğu olan sətirlər.', 'Only rows that match in both tables.'),
  },
  left: {
    name: 'LEFT',
    desc: L('Soldakı bütün sətirlər; uyğunluq yoxdursa sağ tərəf NULL.', 'Every left row; right side is NULL when there is no match.'),
  },
  right: {
    name: 'RIGHT',
    desc: L('Sağdakı bütün sətirlər; uyğunluq yoxdursa sol tərəf NULL.', 'Every right row; left side is NULL when there is no match.'),
  },
  full: {
    name: 'FULL',
    desc: L('Hər iki tərəfin bütün sətirləri; uyğunsuzlar NULL ilə.', 'All rows from both sides; unmatched sides become NULL.'),
  },
  leftAnti: {
    name: 'LEFT ANTI',
    desc: L('Soldakı, sağda qarşılığı olmayan sətirlər (WHERE ... IS NULL).', 'Left rows that have no partner on the right (WHERE ... IS NULL).'),
  },
};

function Venn({ type }: { type: JoinType }) {
  const uid = useId().replace(/:/g, '');
  const A = { cx: 128, cy: 105, r: 72 };
  const B = { cx: 202, cy: 105, r: 72 };
  const fill = 'rgb(16 185 129 / 0.55)';

  const highlight = (() => {
    switch (type) {
      case 'inner':
        return <circle {...B} fill={fill} clipPath={`url(#a-${uid})`} />;
      case 'left':
        return <circle {...A} fill={fill} />;
      case 'right':
        return <circle {...B} fill={fill} />;
      case 'full':
        return (
          <>
            <circle {...A} fill={fill} />
            <circle {...B} fill={fill} />
          </>
        );
      case 'leftAnti':
        return <circle {...A} fill={fill} mask={`url(#notb-${uid})`} />;
    }
  })();

  return (
    <svg viewBox="0 0 330 210" className="mx-auto w-full max-w-[22rem]" role="img" aria-label="Venn diagram of SQL join">
      <defs>
        <clipPath id={`a-${uid}`}>
          <circle {...A} />
        </clipPath>
        <mask id={`notb-${uid}`}>
          <rect width="330" height="210" fill="white" />
          <circle {...B} fill="black" />
        </mask>
      </defs>

      <g key={type} style={{ animation: 'vz-fade-in .45s ease both' }}>
        {highlight}
      </g>

      <circle {...A} fill="rgb(59 130 246 / 0.07)" stroke="rgb(59 130 246)" strokeWidth={2.5} />
      <circle {...B} fill="rgb(245 158 11 / 0.07)" stroke="rgb(245 158 11)" strokeWidth={2.5} />

      <text x={A.cx - 40} y={34} textAnchor="middle" className="fill-[rgb(59,130,246)] text-[12px] font-bold">
        users (A)
      </text>
      <text x={B.cx + 40} y={34} textAnchor="middle" className="fill-[rgb(217,119,6)] text-[12px] font-bold">
        orders (B)
      </text>

      <g className="fill-ink font-mono text-[13px] font-bold" textAnchor="middle">
        <text x={A.cx - 38} y={110}>1 · 4</text>
        <text x={165} y={110}>2 · 3</text>
        <text x={B.cx + 38} y={110}>5</text>
      </g>
      <g className="fill-muted text-[9px] font-semibold uppercase tracking-wider" textAnchor="middle">
        <text x={A.cx - 38} y={128}>only A</text>
        <text x={165} y={128}>match</text>
        <text x={B.cx + 38} y={128}>only B</text>
      </g>
    </svg>
  );
}

export function JoinVenn() {
  const [type, setType] = useState<JoinType>('inner');
  const rows = resultFor(type);

  return (
    <VizFrame
      title={L('SQL JOIN-lər: Venn diaqramı və nəticə', 'SQL JOINs: Venn diagram & result')}
      subtitle={L('JOIN növünü seçin və nəticəni izləyin', 'Pick a join type and watch the result change')}
      badge="Interactive"
      footer={LABELS[type].desc}
    >
      <JoinTabs type={type} onChange={setType} />
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[1.05fr_1fr]">
        <Venn type={type} />
        <div className="min-w-0 space-y-3">
          <pre className="overflow-x-auto rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[0.75rem] leading-6 text-ink">
            <span className="text-violet-500">SELECT</span> u.name, o.id
            {'\n'}
            {SQL[type].map((l, i) => (
              <React.Fragment key={i}>
                {l.replace(/(FROM|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|WHERE|IS NULL)/g, '\u0001$1\u0002')
                  .split(/\u0001|\u0002/)
                  .map((part, k) =>
                    k % 2 === 1 ? (
                      <span key={k} className="text-violet-500">{part}</span>
                    ) : (
                      <span key={k}>{part}</span>
                    ),
                  )}
                {'\n'}
              </React.Fragment>
            ))}
          </pre>

          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left font-mono text-[0.75rem]">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">u.name</th>
                  <th className="px-3 py-1.5 font-semibold">o.id</th>
                </tr>
              </thead>
              <tbody key={type}>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-line"
                    style={{ animation: `vz-slot-in .4s cubic-bezier(.2,.8,.2,1) ${i * 70}ms both` }}
                  >
                    <td className={cn('px-3 py-1.5', r.user === null ? 'italic text-rose-500' : 'text-ink')}>{r.user ?? 'NULL'}</td>
                    <td className={cn('px-3 py-1.5', r.order === null ? 'italic text-rose-500' : 'text-ink')}>{r.order ?? 'NULL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line bg-surface-2 px-3 py-1.5 text-[0.6875rem] text-muted">
              {rows.length} rows
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}

function JoinTabs({ type, onChange }: { type: JoinType; onChange: (t: JoinType) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap justify-center gap-1.5">
      {(Object.keys(LABELS) as JoinType[]).map((k) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={type === k}
          onClick={() => onChange(k)}
          className={cn(
            'rounded-lg border px-3 py-1.5 font-mono text-[0.75rem] font-bold transition',
            type === k
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 shadow-sm dark:text-emerald-400'
              : 'border-line bg-surface text-ink-2 hover:border-accent/40 hover:text-accent',
          )}
        >
          {LABELS[k].name}
        </button>
      ))}
    </div>
  );
}
