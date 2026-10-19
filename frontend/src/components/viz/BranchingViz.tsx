'use client';

import React, { useState } from 'react';
import { GitBranch, CheckCircle2, FastForward, AlertTriangle, ShieldCheck, ArrowDown } from 'lucide-react';
import { VizFrame } from './VizFrame';
import { L } from './shared';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

export function BranchingViz() {
  const { language } = useLanguage();
  const az = language === 'az';

  const [dayMode, setDayMode] = useState<'weekday' | 'weekend'>('weekday');
  const [ruleMode, setRuleMode] = useState<'all_success' | 'none_failed_min_one_success'>('none_failed_min_one_success');

  const isTrap = ruleMode === 'all_success';

  return (
    <VizFrame
      badge="@task.branch"
      title={L(
        'Airflow Şərti Budaqlanma və Trigger Rule Tələsi',
        'Airflow Conditional Branching & The Trigger Rule Trap'
      )}
      subtitle={L(
        'Budaqlanan qollardan biri SKIP olduqda növbəti birləşdirici taskın dayanmaması üçün trigger_rule seçimi',
        'How trigger_rule prevents downstream join tasks from being accidentally skipped after a branch'
      )}
      actions={
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Day Toggle */}
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setDayMode('weekday')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                dayMode === 'weekday'
                  ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              {az ? 'Gün: İş Günü' : 'Day: Weekday'}
            </button>
            <button
              type="button"
              onClick={() => setDayMode('weekend')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                dayMode === 'weekend'
                  ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              {az ? 'Gün: Həftəsonu' : 'Day: Weekend'}
            </button>
          </div>

          {/* Trigger Rule Toggle */}
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setRuleMode('all_success')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                isTrap
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              all_success (Default)
            </button>
            <button
              type="button"
              onClick={() => setRuleMode('none_failed_min_one_success')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                !isTrap
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              none_failed_min_one_success ✓
            </button>
          </div>
        </div>
      }
      footer={L(
        'Susmaya görə hər task trigger_rule="all_success" gözləyir. Budaqlanmadan sonra birləşən task-a mütləq trigger_rule="none_failed_min_one_success" verilməlidir ki, seçilməyən SKIP qolu onu dayandırmasın.',
        'By default tasks use trigger_rule="all_success". Always set trigger_rule="none_failed_min_one_success" on join tasks after @task.branch so the skipped branch does not cascade.'
      )}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3 font-mono text-xs">
        {/* 1. Branching Task */}
        <div className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-4 py-2.5 flex items-center gap-2.5 shadow-2xs">
          <GitBranch className="h-4 w-4 text-violet-400" />
          <div>
            <div className="font-bold text-ink">@task.branch: check_day_of_week()</div>
            <div className="text-[10px] text-violet-300">
              return &quot;{dayMode === 'weekday' ? 'heavy_batch_transform' : 'quick_audit_transform'}&quot;
            </div>
          </div>
        </div>

        {/* Split Connectors */}
        <div className="grid grid-cols-2 w-full max-w-md text-center text-[10px] text-muted">
          <div className="flex flex-col items-center">
            <ArrowDown className={cn('h-4 w-4', dayMode === 'weekday' ? 'text-emerald-400' : 'text-muted/40')} />
            <span>{az ? 'Bazar ertəsi – Cümə' : 'Mon – Fri'}</span>
          </div>
          <div className="flex flex-col items-center">
            <ArrowDown className={cn('h-4 w-4', dayMode === 'weekend' ? 'text-emerald-400' : 'text-muted/40')} />
            <span>{az ? 'Şənbə – Bazar' : 'Sat – Sun'}</span>
          </div>
        </div>

        {/* 2. Two Parallel Branch Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Left Branch: Weekday */}
          <div
            className={cn(
              'rounded-xl border p-3.5 transition-all flex items-center justify-between gap-2',
              dayMode === 'weekday'
                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                : 'border-pink-500/30 bg-pink-500/5 opacity-60'
            )}
          >
            <div>
              <div className="font-bold text-ink">heavy_batch_transform</div>
              <div className="text-[10px] text-muted mt-0.5">
                {az ? 'Tam Spark ETL emalı' : 'Full Spark ETL job'}
              </div>
            </div>
            {dayMode === 'weekday' ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> SUCCESS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-pink-500/20 border border-pink-500/40 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                <FastForward className="h-3 w-3" /> SKIPPED
              </span>
            )}
          </div>

          {/* Right Branch: Weekend */}
          <div
            className={cn(
              'rounded-xl border p-3.5 transition-all flex items-center justify-between gap-2',
              dayMode === 'weekend'
                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                : 'border-pink-500/30 bg-pink-500/5 opacity-60'
            )}
          >
            <div>
              <div className="font-bold text-ink">quick_audit_transform</div>
              <div className="text-[10px] text-muted mt-0.5">
                {az ? 'Yüngül audit yoxlanışı' : 'Lightweight audit check'}
              </div>
            </div>
            {dayMode === 'weekend' ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> SUCCESS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-pink-500/20 border border-pink-500/40 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                <FastForward className="h-3 w-3" /> SKIPPED
              </span>
            )}
          </div>
        </div>

        {/* Join Connectors */}
        <div className="flex flex-col items-center text-muted">
          <ArrowDown className={cn('h-4 w-4', isTrap ? 'text-amber-400' : 'text-emerald-400')} />
          <span className="text-[10px]">trigger_rule = &quot;{ruleMode}&quot;</span>
        </div>

        {/* 3. Downstream Join Task */}
        <div
          className={cn(
            'w-full rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
            isTrap
              ? 'border-amber-500/60 bg-amber-500/10'
              : 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.15)]'
          )}
        >
          <div className="flex items-start gap-2.5">
            {isTrap ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-ink text-sm">generate_report()</div>
              <p className="text-[11px] text-ink-2 font-sans mt-0.5">
                {isTrap
                  ? az
                    ? 'TƏLƏ! all_success hər iki qolun SUCCESS olmasını tələb edir. Qollardan biri SKIPPED olduğu üçün hesabat da avtomatik SKIPPED olur!'
                    : 'TRAP! all_success requires BOTH parents to succeed. Because one branch was SKIPPED, generate_report is also SKIPPED!'
                  : az
                  ? 'HƏLL! none_failed_min_one_success qaydası ilə heç bir xəta yoxdursa və ən azı 1 qol uğurludursa, hesabat dərhal icra olunur!'
                  : 'SOLVED! With none_failed_min_one_success, as soon as the chosen branch succeeds and none failed, generate_report executes!'}
              </p>
            </div>
          </div>

          {isTrap ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300 shrink-0">
              <FastForward className="h-3.5 w-3.5" /> SKIPPED!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS ✓
            </span>
          )}
        </div>
      </div>
    </VizFrame>
  );
}
