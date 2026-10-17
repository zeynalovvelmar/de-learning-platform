'use client';

import React, { useState } from 'react';
import { VizFrame, useViz } from './VizFrame';
import { L, type LText } from './shared';
import { cn } from '@/lib/utils';
import { ArrowRight, Table2, Layers, Check, X } from 'lucide-react';

type JoinType = 'inner' | 'left' | 'right' | 'full' | 'leftAnti';

interface UserRow {
  id: number;
  name: string;
}

interface OrderRow {
  orderId: number;
  userId: number;
  amount: string;
}

interface ResultRow {
  userId: number | null;
  name: string | null;
  orderId: number | null;
  amount: string | null;
  status: 'matched' | 'left_null' | 'right_null';
}

const USERS: UserRow[] = [
  { id: 1, name: 'Aysel' },
  { id: 2, name: 'Murad' },
  { id: 3, name: 'Leyla' },
];

const ORDERS: OrderRow[] = [
  { orderId: 101, userId: 1, amount: '50 AZN' },
  { orderId: 102, userId: 1, amount: '120 AZN' },
  { orderId: 103, userId: 2, amount: '35 AZN' },
  { orderId: 104, userId: 9, amount: '80 AZN' }, // Unmatched user
];

function computeJoinResult(type: JoinType): ResultRow[] {
  switch (type) {
    case 'inner':
      return [
        { userId: 1, name: 'Aysel', orderId: 101, amount: '50 AZN', status: 'matched' },
        { userId: 1, name: 'Aysel', orderId: 102, amount: '120 AZN', status: 'matched' },
        { userId: 2, name: 'Murad', orderId: 103, amount: '35 AZN', status: 'matched' },
      ];
    case 'left':
      return [
        { userId: 1, name: 'Aysel', orderId: 101, amount: '50 AZN', status: 'matched' },
        { userId: 1, name: 'Aysel', orderId: 102, amount: '120 AZN', status: 'matched' },
        { userId: 2, name: 'Murad', orderId: 103, amount: '35 AZN', status: 'matched' },
        { userId: 3, name: 'Leyla', orderId: null, amount: null, status: 'right_null' },
      ];
    case 'right':
      return [
        { userId: 1, name: 'Aysel', orderId: 101, amount: '50 AZN', status: 'matched' },
        { userId: 1, name: 'Aysel', orderId: 102, amount: '120 AZN', status: 'matched' },
        { userId: 2, name: 'Murad', orderId: 103, amount: '35 AZN', status: 'matched' },
        { userId: null, name: null, orderId: 104, amount: '80 AZN', status: 'left_null' },
      ];
    case 'full':
      return [
        { userId: 1, name: 'Aysel', orderId: 101, amount: '50 AZN', status: 'matched' },
        { userId: 1, name: 'Aysel', orderId: 102, amount: '120 AZN', status: 'matched' },
        { userId: 2, name: 'Murad', orderId: 103, amount: '35 AZN', status: 'matched' },
        { userId: 3, name: 'Leyla', orderId: null, amount: null, status: 'right_null' },
        { userId: null, name: null, orderId: 104, amount: '80 AZN', status: 'left_null' },
      ];
    case 'leftAnti':
      return [
        { userId: 3, name: 'Leyla', orderId: null, amount: null, status: 'right_null' },
      ];
  }
}

const SQL_QUERIES: Record<JoinType, string> = {
  inner: `SELECT u.id, u.name, o.order_id, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;`,
  left: `SELECT u.id, u.name, o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;`,
  right: `SELECT u.id, u.name, o.order_id, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;`,
  full: `SELECT u.id, u.name, o.order_id, o.amount
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;`,
  leftAnti: `SELECT u.id, u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.order_id IS NULL;`,
};

const JOIN_DESCRIPTIONS: Record<JoinType, { title: string; desc: LText }> = {
  inner: {
    title: 'INNER JOIN',
    desc: L(
      'Yalnız hər iki cədvəldə açar uyğunluğu olan sətirlər (u.id = o.user_id). Leyla və Order 104 nəticəyə daxil olmur.',
      'Only rows where keys match in both tables (u.id = o.user_id). Leyla and Order 104 are excluded.'
    ),
  },
  left: {
    title: 'LEFT JOIN',
    desc: L(
      'Sol cədvəldəki (users) bütün sətirlər mütləq saxlanılır. Leyla sifariş etmədiyi üçün sifariş sütunları NULL olur.',
      'All rows from the left table (users) are preserved. Since Leyla has no orders, order columns become NULL.'
    ),
  },
  right: {
    title: 'RIGHT JOIN',
    desc: L(
      'Sağ cədvəldəki (orders) bütün sətirlər saxlanılır. Order 104 mövcud olmayan istifadəçiyə (id=9) aid olduğu üçün user sütunları NULL olur.',
      'All rows from the right table (orders) are preserved. Order 104 belongs to non-existent user 9, so user columns become NULL.'
    ),
  },
  full: {
    title: 'FULL OUTER JOIN',
    desc: L(
      'Hər iki tərəfin bütün sətirləri birləşir. Uyğunluğu olmayan hər iki tərəf üçün çatışmayan tərəf NULL ilə doldurulur.',
      'Combines all rows from both tables. Missing data on either side is filled with NULL.'
    ),
  },
  leftAnti: {
    title: 'LEFT ANTI JOIN',
    desc: L(
      'Yalnız sağ cədvəldə qarşılığı OLMAYAN sol sətirlər tapılır (heç vaxt sifariş etməyən müştərilər).',
      'Filters for left rows that have ZERO matching rows on the right (customers who never placed an order).'
    ),
  },
};

export function JoinVenn() {
  const [activeType, setActiveType] = useState<JoinType>('inner');
  const { lt } = useViz();

  const results = computeJoinResult(activeType);
  const sql = SQL_QUERIES[activeType];
  const meta = JOIN_DESCRIPTIONS[activeType];

  return (
    <VizFrame
      title={L('SQL Birləşmələri: Cədvəl Səviyyəsində Fiziki Birləşmə', 'SQL Joins: Row-Level Physical Table Matching')}
      subtitle={L('Venn dairələri əvəzinə real sətir birləşməsi və NULL davranışı', 'Real row matching & NULL propagation instead of abstract Venn')}
      badge="SQL Engine"
      footer={meta.desc}
    >
      {/* 1. Join Type Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-line pb-4">
        {(['inner', 'left', 'right', 'full', 'leftAnti'] as JoinType[]).map((jt) => {
          const isActive = activeType === jt;
          return (
            <button
              key={jt}
              onClick={() => setActiveType(jt)}
              className={cn(
                'rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink border border-line'
              )}
            >
              {JOIN_DESCRIPTIONS[jt].title}
            </button>
          );
        })}
      </div>

      {/* 2. Visual Table Row Matching Layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1.1fr] items-start">
        {/* Left Side: Input Tables A and B */}
        <div className="space-y-4">
          {/* Table A: users */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-line text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
              <span className="flex items-center gap-1.5">
                <Table2 className="h-3.5 w-3.5" />
                table: users (A)
              </span>
              <span className="text-[10px] text-muted">Primary: id</span>
            </div>
            <div className="mt-2 divide-y divide-line/60 font-mono text-xs">
              {USERS.map((u) => {
                const isMatched = activeType === 'leftAnti' ? u.id === 3 : u.id === 1 || u.id === 2 || (activeType !== 'inner' && activeType !== 'right' && u.id === 3);
                return (
                  <div
                    key={u.id}
                    className={cn(
                      'flex items-center justify-between py-1.5 px-2 rounded-md transition-colors',
                      isMatched ? 'bg-blue-500/10 text-ink font-semibold' : 'text-muted opacity-60'
                    )}
                  >
                    <span>id: <b className="text-blue-600 dark:text-blue-400">{u.id}</b></span>
                    <span>name: &apos;{u.name}&apos;</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table B: orders */}
          <div className="rounded-xl border border-line bg-surface p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-line text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <Table2 className="h-3.5 w-3.5" />
                table: orders (B)
              </span>
              <span className="text-[10px] text-muted">FK: user_id</span>
            </div>
            <div className="mt-2 divide-y divide-line/60 font-mono text-xs">
              {ORDERS.map((o) => {
                const isMatched = o.userId === 1 || o.userId === 2 || ((activeType === 'right' || activeType === 'full') && o.userId === 9);
                return (
                  <div
                    key={o.orderId}
                    className={cn(
                      'flex items-center justify-between py-1.5 px-2 rounded-md transition-colors',
                      isMatched ? 'bg-amber-500/10 text-ink font-semibold' : 'text-muted opacity-60'
                    )}
                  >
                    <span>order: <b>{o.orderId}</b></span>
                    <span>user_id: <b className="text-amber-600 dark:text-amber-400">{o.userId}</b></span>
                    <span>{o.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Arrow Indicator */}
        <div className="hidden lg:flex flex-col items-center justify-center self-center px-2 text-muted">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1">JOIN ON</span>
          <ArrowRight className="h-6 w-6 text-blue-500 animate-pulse" />
        </div>

        {/* Right Side: Output Result Table + Generated SQL */}
        <div className="space-y-4">
          {/* Result Table */}
          <div className="rounded-xl border border-blue-500/40 bg-surface p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-line text-xs font-bold font-mono text-ink">
              <span className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-500" />
                Nəticə Cədvəli ({results.length} sətir)
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                OUTPUT
              </span>
            </div>

            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-line text-muted text-[11px]">
                    <th className="pb-1.5">u.id</th>
                    <th className="pb-1.5">u.name</th>
                    <th className="pb-1.5">o.order_id</th>
                    <th className="pb-1.5">o.amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-surface-2/60 transition-colors">
                      <td className="py-1.5 text-blue-600 dark:text-blue-400 font-bold">
                        {r.userId !== null ? r.userId : <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">NULL</span>}
                      </td>
                      <td className="py-1.5 text-ink">
                        {r.name !== null ? r.name : <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">NULL</span>}
                      </td>
                      <td className="py-1.5 text-amber-600 dark:text-amber-400 font-bold">
                        {r.orderId !== null ? r.orderId : <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">NULL</span>}
                      </td>
                      <td className="py-1.5 text-ink">
                        {r.amount !== null ? r.amount : <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[10px] text-amber-600 dark:text-amber-400 font-bold">NULL</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generated SQL snippet */}
          <div className="rounded-xl border border-line bg-zinc-950 p-3 font-mono text-xs text-zinc-200 shadow-2xs">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">İcra Edilən SQL:</div>
            <pre className="text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
              {sql}
            </pre>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
