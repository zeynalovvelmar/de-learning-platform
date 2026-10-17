'use client';

import React from 'react';
import { ICONS, type IconName, type LText, type Tone } from './shared';
import { VizFrame, useViz } from './VizFrame';
import { cn } from '@/lib/utils';

export interface FlowNodeSpec {
  label: LText;
  sub?: LText;
  icon: IconName;
  tone?: Tone;
  badge?: LText;
}

export interface FlowStageSpec {
  title?: LText;
  nodes: FlowNodeSpec[];
  /** Small caption shown on the connector that leads INTO this stage. */
  arrowLabel?: LText;
}

export interface FlowRowSpec {
  label?: LText;
  tone?: Tone;
  stages: FlowStageSpec[];
}

export interface FlowSpec {
  title?: LText;
  subtitle?: LText;
  badge?: LText;
  footer?: LText;
  rows: FlowRowSpec[];
}

function FlowRow({ row, rowIndex }: { row: FlowRowSpec; rowIndex: number }) {
  const { lt } = useViz();
  const dense = row.stages.length >= 4;
  let idx = rowIndex * 12;

  return (
    <div className={cn('flex flex-col items-center gap-3 w-fit min-w-full mx-auto', dense && 'vz-dense')}>
      {row.label && (
        <span
          className={cn(
            'tone-' + (row.tone ?? 'indigo'),
            'rounded-full border px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider',
            'border-[rgb(var(--tone)/0.4)] bg-[rgb(var(--tone)/0.1)] text-[rgb(var(--tone))]',
          )}
        >
          {lt(row.label)}
        </span>
      )}
      <div
        className={cn(
          'flex flex-col items-center gap-2.5 md:flex-row md:items-center md:justify-center w-fit mx-auto px-1',
          dense ? 'md:gap-1' : 'md:gap-2',
        )}
      >
        {row.stages.map((stage, sIdx) => {
          const stageIdx = idx++;
          const tone = stage.nodes[0]?.tone ?? row.tone ?? 'indigo';
          return (
            <React.Fragment key={sIdx}>
              {sIdx > 0 && (
                <div
                  className={cn('vz-connector', 'tone-' + tone)}
                  style={{ '--i': stageIdx } as React.CSSProperties}
                  aria-hidden
                >
                  <div className="vz-line">
                    <span className="vz-comet" style={{ '--i': sIdx } as React.CSSProperties} />
                  </div>
                  {stage.arrowLabel && <span className="vz-conn-label">{lt(stage.arrowLabel)}</span>}
                </div>
              )}
              <div className="flex flex-col items-stretch gap-2.5">
                {stage.title && (
                  <div className="vz-stage-title" style={{ '--i': stageIdx } as React.CSSProperties}>
                    {lt(stage.title)}
                  </div>
                )}
                {stage.nodes.map((node, nIdx) => {
                  const Icon = ICONS[node.icon];
                  return (
                    <div
                      key={nIdx}
                      className={cn('vz-card', 'tone-' + (node.tone ?? row.tone ?? 'indigo'))}
                      style={{ '--i': stageIdx + nIdx * 0.6 } as React.CSSProperties}
                    >
                      {node.badge && <span className="vz-badge">{lt(node.badge)}</span>}
                      <span className="vz-icon">
                        <Icon className="h-[0.95rem] w-[0.95rem]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 pr-1">
                        <span className="vz-label block whitespace-nowrap">{lt(node.label)}</span>
                        {node.sub && <span className="vz-sub block whitespace-nowrap">{lt(node.sub)}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function FlowRows({ spec }: { spec: FlowSpec }) {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-1">
      <div className="flex flex-col gap-5 w-fit min-w-full mx-auto px-1">
        {spec.rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="flex items-center gap-3 px-2 w-full max-w-xl mx-auto" aria-hidden>
                <span className="h-px flex-1 bg-line" />
                <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[0.625rem] font-extrabold tracking-[0.18em] text-muted">
                  VS
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            )}
            <FlowRow row={row} rowIndex={i} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** Declarative, animated "boxes and arrows" diagram driven by a FlowSpec. */
export function FlowDiagram({ spec }: { spec: FlowSpec }) {
  return (
    <VizFrame title={spec.title} subtitle={spec.subtitle} badge={spec.badge} footer={spec.footer}>
      <FlowRows spec={spec} />
    </VizFrame>
  );
}
