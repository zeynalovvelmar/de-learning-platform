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
// Deliberately uneven stream to show that ordering is strictly per-key within a partition
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
      {/* Producer Header & Dynamic Hash Routing Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-bold text-ink shadow-2xs">
          <Send className="h-3.5 w-3.5 text-accent" />
          Producer
        </span>
        <span className="text-muted font-mono">──►</span>
        <code className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-ink-2 shadow-2xs" aria-live="polite">
          {lastKey ? (
            <>
              key=<b className="text-ink">{lastKey.key}</b> · murmur2(key) % 3 ={' '}
              <b className="text-accent underline font-extrabold">Partition {lastKey.partition}</b>
            </>
          ) : (
            <>{lt(L('mesaj axını gözlənilir…', 'waiting for message stream…'))}</>
          )}
        </code>
      </div>

      {/* 3 Kafka Partitions (Lanes) */}
      <div className="space-y-3">
        {KEYS.map((def, p) => {
          const lane = lanes[p];
          const active = last && KEYS[last.key].partition === p;
          return (
            <div
              key={p}
              className={cn(
                'flex items-center gap-3 rounded-xl border bg-surface p-3 transition-all',
                active 
                  ? 'border-accent shadow-[0_0_0_2px_var(--accent-soft)] bg-accent-soft/20' 
                  : 'border-line shadow-xs',
              )}
            >
              {/* Partition Header */}
              <div className="w-16 shrink-0">
                <div className="font-mono text-sm font-extrabold text-ink">P{p}</div>
                <div className="text-[11px] font-mono text-muted">LEO: <span className="font-bold text-ink">{lane.length}</span></div>
              </div>

              {/* Offset Slot Blocks */}
              <div className="flex min-w-0 flex-1 gap-1.5 sm:gap-2">
                {Array.from({ length: MAX_OFFSETS }).map((_, i) => {
                  const keyIdx = lane[i];
                  const filled = keyIdx !== undefined;
                  const isNew = filled && last && last.offset === i && KEYS[last.key].partition === p;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'relative flex flex-col justify-between h-12 min-w-0 flex-1 p-1 rounded-lg border text-center transition-all',
                        filled 
                          ? cn('border-transparent text-white shadow-sm', KEYS[keyIdx].chip) 
                          : 'border-dashed border-line bg-surface-2/60 text-muted',
                      )}
                      style={isNew ? { animation: 'vz-slot-in .35s cubic-bezier(.2,.8,.2,1) both' } : undefined}
                    >
                      {/* Top: Record key indicator */}
                      <span className="font-mono text-[10px] font-bold leading-tight">
                        {filled ? KEYS[keyIdx].key.slice(-1) : '—'}
                      </span>

                      {/* Bottom: Explicit Offset label */}
                      <span className={cn(
                        'font-mono text-[9px] font-semibold tracking-tighter leading-none',
                        filled ? 'text-white/80' : 'text-muted/60'
                      )}>
                        #{i}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Guide */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
        {KEYS.map((k) => (
          <span key={k.key} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-[3px] shadow-xs', k.chip)} />
            <code className="font-mono text-ink-2 font-semibold">{k.key}</code>
            <span>→ P{k.partition}</span>
          </span>
        ))}
        <span className="text-zinc-400">•</span>
        <span className="font-mono text-[11px]">{lt(L('# = partition offset (0..6)', '# = partition offset (0..6)'))}</span>
      </div>
    </div>
  );
}

export function PartitionLogViz() {
  return (
    <VizFrame
      title={L('Kafka Topic: Partition-lar append-only log-dur', 'Kafka topic: partitions are append-only logs')}
      subtitle={L('Eyni key həmişə eyni partition-a düşür və ardıcıllıq qorunur', 'The same key always lands in the same partition and preserves ordering')}
      badge="Kafka"
      footer={L(
        'Mesajlar yalnız sona əlavə olunur (append-only). Sıralama zəmanəti partisiya daxilindədir — qlobal deyil.',
        'Records are append-only. Order guarantees exist within a single partition — never globally across partitions.',
      )}
    >
      <Lanes />
    </VizFrame>
  );
}
