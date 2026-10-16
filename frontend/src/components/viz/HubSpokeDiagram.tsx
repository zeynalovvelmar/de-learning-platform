'use client';

import React from 'react';
import { ICONS, type IconName, type LText, type Tone } from './shared';
import { VizFrame, useViz } from './VizFrame';
import { cn } from '@/lib/utils';

export interface HubNodeSpec {
  label: LText;
  sub?: LText;
  icon: IconName;
  tone?: Tone;
  /** Data direction relative to the hub (default: out). */
  direction?: 'in' | 'out' | 'both';
}

export interface HubSpec {
  title?: LText;
  subtitle?: LText;
  badge?: LText;
  footer?: LText;
  center: HubNodeSpec;
  spokes: HubNodeSpec[];
}

function NodeCard({ node, big = false, index = 0 }: { node: HubNodeSpec; big?: boolean; index?: number }) {
  const { lt } = useViz();
  const Icon = ICONS[node.icon];
  return (
    <div
      className={cn('vz-card', 'tone-' + (node.tone ?? 'indigo'), big && 'px-4 py-3.5')}
      style={{ '--i': index } as React.CSSProperties}
    >
      <span className={cn('vz-icon', big && 'h-11 w-11 rounded-xl')}>
        <Icon className={big ? 'h-5 w-5' : 'h-[1.05rem] w-[1.05rem]'} strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className={cn('vz-label block', big && 'text-[0.9375rem]')}>{lt(node.label)}</span>
        {node.sub && <span className="vz-sub block">{lt(node.sub)}</span>}
      </span>
    </div>
  );
}

/** Hub-and-spoke diagram (star schema, cluster architectures, compose stacks, ...). */
export function HubSpokeDiagram({ spec }: { spec: HubSpec }) {
  const n = spec.spokes.length;
  const pts = spec.spokes.map((_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: 50 + 37 * Math.cos(a), y: 50 + 36 * Math.sin(a) };
  });

  return (
    <VizFrame title={spec.title} subtitle={spec.subtitle} badge={spec.badge} footer={spec.footer}>
      {/* Desktop: radial layout */}
      <div className="relative hidden h-[23rem] md:block">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {pts.map((p, i) => {
            const tone = spec.spokes[i].tone ?? 'indigo';
            const dir = spec.spokes[i].direction ?? 'out';
            const d = dir === 'in' ? `M ${p.x} ${p.y} L 50 50` : `M 50 50 L ${p.x} ${p.y}`;
            return (
              <g key={i} className={'tone-' + tone}>
                <path d={`M 50 50 L ${p.x} ${p.y}`} stroke="rgb(var(--tone) / 0.22)" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
                <path
                  d={d}
                  stroke="rgb(var(--tone))"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  className="vz-flow-dash"
                  data-anim
                  style={{ animationDelay: `${i * 0.15}s`, animationDirection: dir === 'both' ? 'alternate' : 'normal' }}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <span className={cn('vz-pulse absolute -inset-3 rounded-[1.4rem]', 'tone-' + (spec.center.tone ?? 'indigo'), 'bg-[rgb(var(--tone)/0.14)]')} data-anim />
            <div className="relative">
              <NodeCard node={spec.center} big index={0} />
            </div>
          </div>
        </div>

        {spec.spokes.map((node, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
          >
            <NodeCard node={node} index={i + 1} />
          </div>
        ))}
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex flex-col items-center gap-2.5 md:hidden">
        <NodeCard node={spec.center} big index={0} />
        {spec.spokes.map((node, i) => (
          <React.Fragment key={i}>
            <div className={cn('vz-connector', 'tone-' + (node.tone ?? 'indigo'))} aria-hidden>
              <div className="vz-line">
                <span className="vz-comet" />
              </div>
            </div>
            <NodeCard node={node} index={i + 1} />
          </React.Fragment>
        ))}
      </div>
    </VizFrame>
  );
}
