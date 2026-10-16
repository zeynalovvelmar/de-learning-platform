'use client';

import React from 'react';
import { VizFrame } from './VizFrame';
import { L } from './shared';

const BLUE = 'rgb(59 130 246)';
const AMBER = 'rgb(245 158 11)';
const colorOf = (c: 'A' | 'B') => (c === 'A' ? BLUE : AMBER);

function Partition({ x, y, label, recs, w = 132 }: { x: number; y: number; label: string; recs: Array<'A' | 'B'>; w?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={9} className="fill-surface-2 stroke-line" strokeWidth={1.5} />
      <text x={x + 8} y={y - 6} className="fill-muted text-[10px] font-bold" style={{ letterSpacing: '0.06em' }}>
        {label}
      </text>
      {recs.map((r, i) => (
        <rect key={i} x={x + 10 + i * 29} y={y + 9} width={22} height={18} rx={5} fill={colorOf(r)} />
      ))}
    </g>
  );
}

function Dot({ path, color, begin, dur = 2.2 }: { path: string; color: string; begin: number; dur?: number }) {
  return (
    <circle r={4.5} fill={color}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}

function Wire({ d, color, dashed = false }: { d: string; color: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeOpacity={0.35}
      strokeWidth={2}
      strokeDasharray={dashed ? '4 5' : undefined}
    />
  );
}

export function ShuffleViz() {
  return (
    <VizFrame
      title={L('Narrow vs Wide dependency (Shuffle)', 'Narrow vs wide dependency (shuffle)')}
      subtitle={L('Spark-da ən bahalı əməliyyat: şəbəkə üzərindən data qarışdırmaq', 'The most expensive operation in Spark: moving data across the network')}
      badge="Spark"
      footer={L(
        'Narrow: hər giriş partition-u yalnız bir çıxış partition-una təsir edir (eyni stage). Wide: key-lərə görə data worker-lər arasında köçürülür və yeni Stage başlayır.',
        'Narrow: every input partition feeds exactly one output partition (same stage). Wide: records are redistributed by key across workers and a new stage begins.',
      )}
    >
      <div className="overflow-x-auto">
        <svg viewBox="0 0 640 352" className="mx-auto h-auto w-full min-w-[34rem]" role="img" aria-label="Narrow vs wide dependency diagram">
          {/* ---------- NARROW ---------- */}
          <g>
            <rect x={0} y={0} width={640} height={148} rx={14} fill="rgb(16 185 129 / 0.06)" stroke="rgb(16 185 129 / 0.3)" />
            <text x={16} y={22} className="fill-emerald-600 text-[12px] font-bold dark:fill-emerald-400">
              NARROW · filter / map / select
            </text>
            <text x={624} y={22} textAnchor="end" className="fill-muted text-[10px] font-semibold">
              no network · same stage · fast
            </text>

            <Partition x={30} y={50} label="PARTITION 1" recs={['A', 'B', 'A', 'B']} />
            <Partition x={30} y={100} label="PARTITION 2" recs={['B', 'A', 'B', 'A']} />
            <Partition x={478} y={50} label="PARTITION 1'" recs={['A', 'B', 'A', 'B']} />
            <Partition x={478} y={100} label="PARTITION 2'" recs={['B', 'A', 'B', 'A']} />

            <Wire d="M166 68 L474 68" color="rgb(16 185 129)" />
            <Wire d="M166 118 L474 118" color="rgb(16 185 129)" />
            <rect x={278} y={76} width={84} height={22} rx={11} className="fill-surface stroke-line" />
            <text x={320} y={91} textAnchor="middle" className="fill-ink-2 font-mono text-[10px] font-bold">
              filter()
            </text>
            <Dot path="M166 68 L474 68" color={BLUE} begin={0} />
            <Dot path="M166 68 L474 68" color={AMBER} begin={1.1} />
            <Dot path="M166 118 L474 118" color={AMBER} begin={0.5} />
            <Dot path="M166 118 L474 118" color={BLUE} begin={1.6} />
          </g>

          {/* ---------- WIDE ---------- */}
          <g>
            <rect x={0} y={164} width={640} height={188} rx={14} fill="rgb(244 63 94 / 0.06)" stroke="rgb(244 63 94 / 0.3)" />
            <text x={16} y={186} className="fill-rose-600 text-[12px] font-bold dark:fill-rose-400">
              WIDE · groupBy / join / distinct
            </text>
            <text x={624} y={186} textAnchor="end" className="fill-muted text-[10px] font-semibold">
              network + disk I/O · new stage · slow
            </text>

            <Partition x={30} y={214} label="PARTITION 1" recs={['A', 'B', 'A', 'B']} />
            <Partition x={30} y={288} label="PARTITION 2" recs={['B', 'A', 'B', 'A']} />
            <Partition x={478} y={214} label="ALL KEY A" recs={['A', 'A', 'A', 'A']} />
            <Partition x={478} y={288} label="ALL KEY B" recs={['B', 'B', 'B', 'B']} />

            <Wire d="M166 232 L474 232" color={BLUE} dashed />
            <Wire d="M166 238 C 320 238, 320 306, 474 306" color={AMBER} dashed />
            <Wire d="M166 312 C 320 312, 320 244, 474 244" color={BLUE} dashed />
            <Wire d="M166 318 L474 318" color={AMBER} dashed />

            <g>
              <rect x={262} y={252} width={116} height={30} rx={15} className="fill-surface stroke-rose-400" strokeWidth={1.5} />
              <text x={320} y={271} textAnchor="middle" className="fill-rose-600 text-[11px] font-extrabold dark:fill-rose-400" style={{ letterSpacing: '0.12em' }}>
                SHUFFLE
              </text>
            </g>

            <Dot path="M166 232 L474 232" color={BLUE} begin={0.1} />
            <Dot path="M166 238 C 320 238, 320 306, 474 306" color={AMBER} begin={0.7} dur={2.6} />
            <Dot path="M166 312 C 320 312, 320 244, 474 244" color={BLUE} begin={1.2} dur={2.6} />
            <Dot path="M166 318 L474 318" color={AMBER} begin={1.7} />
            <Dot path="M166 238 C 320 238, 320 306, 474 306" color={AMBER} begin={2.0} dur={2.6} />
            <Dot path="M166 312 C 320 312, 320 244, 474 244" color={BLUE} begin={2.4} dur={2.6} />
          </g>
        </svg>
      </div>
    </VizFrame>
  );
}
