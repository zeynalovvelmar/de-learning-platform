'use client';

import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { VizFrame, useViz } from './VizFrame';
import { L } from './shared';
import { cn } from '@/lib/utils';

interface KeyDef {
  key: string;
  partition: number;
  tone: string;
  chip: string;
}

const KEYS: KeyDef[] = [
  { key: 'user-A', partition: 0, tone: 'tone-blue', chip: 'bg-blue-500' },
  { key: 'user-B', partition: 1, tone: 'tone-emerald', chip: 'bg-emerald-500' },
  { key: 'user-C', partition: 2, tone: 'tone-amber', chip: 'bg-amber-500' },
];
// A deliberately uneven stream to show that ordering is per-key, not global.
const STREAM = [0, 1, 0, 2, 1, 0, 0, 2, 1, 2, 0, 1, 2, 0];
const MAX_OFFSETS = 7;

function Lanes() {
  const { playing, inView, lt } = useViz();
  const [state, setState] = useState<{ lanes: number[][]; last: { key: number; offset: number } | null }>({
    lanes: [[], [], []],
    last: null,
  });
  const [tick, setTick] = useState(0);
  const { lanes, last } = state;

  useEffect(() => {
    if (!playing || !inView) return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 950);
    return () => window.clearInterval(id);
  }, [playing, inView]);

  useEffect(() => {
    if (tick === 0) return;
    const keyIdx = STREAM[(tick - 1) % STREAM.length];
    setState((prev) => {
      const p = KEYS[keyIdx].partition;
      const full = prev.lanes[p].length >= MAX_OFFSETS;
      const base = full ? [[], [], []] : prev.lanes.map((l) => [...l]);
      base[p] = [...base[p], keyIdx];
      return { lanes: base, last: { key: keyIdx, offset: base[p].length - 1 } };
    });
  }, [tick]);

  const lastKey = last ? KEYS[last.key] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[0.75rem]">
        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 font-semibold text-ink">
          <Send className="h-3.5 w-3.5 text-accent" />
          Producer
        </span>
        <span className="text-muted">→</span>
        <code className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-ink-2" aria-live="polite">
          {lastKey ? (
            <>
              key=<b className="text-ink">{lastKey.key}</b> · hash(key) % 3 ={' '}
              <b className="text-accent">P{lastKey.partition}</b>
            </>
          ) : (
            <>{lt(L('mesaj gözlənilir…', 'waiting for a message…'))}</>
          )}
        </code>
      </div>

      <div className="space-y-2.5">
        {KEYS.map((def, p) => {
          const lane = lanes[p];
          const active = last && KEYS[last.key].partition === p;
          return (
            <div
              key={p}
              className={cn(
                'flex items-center gap-3 rounded-xl border bg-surface p-2.5 transition-colors',
                active ? 'border-accent/50 shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line',
              )}
            >
              <div className="w-16 shrink-0">
                <div className="font-mono text-[0.8125rem] font-bold text-ink">P{p}</div>
                <div className="text-[0.625rem] text-muted">LEO: {lane.length}</div>
              </div>
              <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
                {Array.from({ length: MAX_OFFSETS }).map((_, i) => {
                  const keyIdx = lane[i];
                  const filled = keyIdx !== undefined;
                  const isNew = filled && last && last.offset === i && KEYS[last.key].partition === p;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'relative grid h-10 min-w-0 flex-1 place-items-center rounded-lg border text-center',
                        filled ? 'border-transparent text-white' : 'border-dashed border-line bg-surface-2/50',
                        filled && KEYS[keyIdx].chip,
                      )}
                      style={isNew ? { animation: 'vz-slot-in .45s cubic-bezier(.2,.8,.2,1) both' } : undefined}
                    >
                      {filled ? (
                        <span className="font-mono text-[0.625rem] font-bold leading-tight">
                          {KEYS[keyIdx].key.slice(-1)}
                        </span>
                      ) : null}
                      <span className="absolute -bottom-[0.95rem] font-mono text-[0.5625rem] text-muted">{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[0.6875rem] text-muted">
        {KEYS.map((k) => (
          <span key={k.key} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-[3px]', k.chip)} />
            <code className="font-mono text-ink-2">{k.key}</code>
            <span>→ P{k.partition}</span>
          </span>
        ))}
        <span>· {lt(L('rəqəm = offset', 'number = offset'))}</span>
      </div>
    </div>
  );
}

export function PartitionLogViz() {
  return (
    <VizFrame
      title={L('Kafka Topic: Partition-lar append-only log-dur', 'Kafka topic: partitions are append-only logs')}
      subtitle={L('Eyni key həmişə eyni partition-a düşür', 'The same key always lands in the same partition')}
      badge="Live"
      footer={L(
        'Mesajlar yalnız sona əlavə olunur (append-only). Sıralama garantiyası partition daxilindədir — qlobal deyil.',
        'Records are only ever appended. Ordering is guaranteed inside a partition — not across the whole topic.',
      )}
    >
      <Lanes />
    </VizFrame>
  );
}
