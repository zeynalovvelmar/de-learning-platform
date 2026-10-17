'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pause, Play, Layers } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import type { LText } from './shared';

interface VizState {
  /** Infinite animations/timers should run only while this is true. */
  playing: boolean;
  /** True once the frame has entered the viewport (drives reveal animations). */
  inView: boolean;
  /** Resolve a bilingual label for the current UI language. */
  lt: (text?: LText) => string;
}

const VizContext = createContext<VizState>({ playing: true, inView: true, lt: (t) => (typeof t === 'string' ? t : (t?.en ?? '')) });

export function useViz() {
  return useContext(VizContext);
}

interface VizFrameProps {
  title?: LText;
  subtitle?: LText;
  badge?: LText;
  footer?: LText;
  /** Extra controls rendered next to the play/pause button. */
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for every animated infographic:
 *  - reveals content when scrolled into view (IntersectionObserver),
 *  - exposes a Pause/Play switch (WCAG 2.2.2 "Pause, Stop, Hide"),
 *  - starts paused for users who prefer reduced motion,
 *  - pauses SMIL animations inside child <svg>s too.
 */
export function VizFrame({ title, subtitle, badge, footer, actions, className, children }: VizFrameProps) {
  const { language } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(true);

  const lt = useCallback(
    (text?: LText) => (text === undefined ? '' : typeof text === 'string' ? text : text[language]),
    [language],
  );

  // Respect prefers-reduced-motion: start paused, user can opt in.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setPlaying(false);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // SMIL (<animateMotion>) is not controlled by CSS, so drive it through the SVG API.
  useEffect(() => {
    const svgs = ref.current?.querySelectorAll('svg') ?? [];
    svgs.forEach((svg) => {
      try {
        if (playing) svg.unpauseAnimations();
        else svg.pauseAnimations();
      } catch {
        /* not supported */
      }
    });
  }, [playing, inView, children]);

  const az = language === 'az';

  return (
    <VizContext.Provider value={{ playing, inView, lt }}>
      <figure
        ref={ref}
        data-inview={inView}
        data-motion={playing ? 'on' : 'off'}
        className={cn(
          'vz-reveal relative my-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm',
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-2 shadow-2xs">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-ink">
                {title ? lt(title) : (az ? 'Arxitektura Sxemi' : 'Architecture Blueprint')}
              </p>
              {subtitle && <p className="truncate text-[11px] text-muted">{lt(subtitle)}</p>}
            </div>
            {badge && (
              <span className="hidden shrink-0 rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2 sm:inline">
                {lt(badge)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {actions}
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-2 transition hover:border-accent/40 hover:text-accent"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? (az ? 'Dayandır' : 'Pause') : az ? 'Oynat' : 'Play'}
            </button>
          </div>
        </div>
        <div className="relative px-2 py-5 sm:px-3">{children}</div>
        {footer && (
          <figcaption className="relative border-t border-line bg-surface-2/50 px-4 py-2.5 text-[0.75rem] leading-relaxed text-muted">
            {lt(footer)}
          </figcaption>
        )}
      </figure>
    </VizContext.Provider>
  );
}
