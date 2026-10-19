'use client';

import React, { useState } from 'react';
import { Archive, Sparkles, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { VizFrame } from './VizFrame';
import { L } from './shared';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

export function LogCompactionViz() {
  const { language } = useLanguage();
  const az = language === 'az';

  const [policy, setPolicy] = useState<'compact' | 'delete'>('compact');
  const [compacted, setCompacted] = useState(true);

  const records = [
    { offset: 0, key: 'user_A', val: '"Bakı"', latest: false, tombstone: false },
    { offset: 1, key: 'user_B', val: '"London"', latest: false, tombstone: false },
    { offset: 2, key: 'user_A', val: '"Gəncə"', latest: false, tombstone: false },
    { offset: 3, key: 'user_C', val: '"Berlin"', latest: true, tombstone: false },
    { offset: 4, key: 'user_A', val: '"Sumqayıt"', latest: true, tombstone: false },
    { offset: 5, key: 'user_B', val: 'NULL', latest: true, tombstone: true },
  ];

  return (
    <VizFrame
      badge="Kafka Storage"
      title={L(
        'Kafka Saxlanma Siyasəti: Log Compaction vs Delete Retention',
        'Kafka Storage Policy: Log Compaction vs Delete Retention'
      )}
      subtitle={L(
        'cleanup.policy = compact hər açar (Key) üçün yalnız ən son vəziyyəti saxlayır; delete isə köhnə seqmentləri vaxta görə silir',
        'cleanup.policy = compact retains only the latest value per key; delete drops whole segments by age or size'
      )}
      actions={
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setPolicy('compact')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                policy === 'compact'
                  ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              cleanup.policy = compact
            </button>
            <button
              type="button"
              onClick={() => setPolicy('delete')}
              className={cn(
                'rounded-md px-2.5 py-1 transition cursor-pointer',
                policy === 'delete'
                  ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                  : 'text-muted hover:text-ink'
              )}
            >
              cleanup.policy = delete
            </button>
          </div>

          {policy === 'compact' && (
            <button
              type="button"
              onClick={() => setCompacted((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-bold transition cursor-pointer',
                compacted
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {compacted
                  ? az
                    ? 'Təmizlənmiş Hal (After Compaction)'
                    : 'After Log Compaction'
                  : az
                  ? 'Xam Hal (Before Compaction)'
                  : 'Before Log Compaction'}
              </span>
            </button>
          )}
        </div>
      }
      footer={
        policy === 'compact'
          ? L(
              'Log Compaction zamanı eyni açarın (məs: user_A) köhnə offsetləri (0 və 2) silinir, yalnız ən son halı (Offset 4: Sumqayıt) qalır. Dəyəri NULL olan mesaj (Tombstone) isə həmin açarı tamamilə silir.',
              'Log Compaction removes older offsets for the same key (offsets 0 and 2 for user_A) and keeps only the latest value (Offset 4). A NULL payload acts as a Tombstone to delete the key.'
            )
          : L(
              'Standart delete rejimində log.retention.hours (məs: 48 saat) bitdikdə bütöv qapalı seqment faylı açarlardan asılı olmayaraq diskdən silinir.',
              'In standard delete mode, once a closed segment exceeds log.retention.hours (e.g. 48h), the entire segment file is deleted from disk regardless of keys.'
            )
      }
    >
      {policy === 'compact' ? (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {records.map((r) => {
              const removed = compacted && !r.latest;
              return (
                <div
                  key={r.offset}
                  className={cn(
                    'rounded-xl border p-3 transition-all flex flex-col justify-between gap-2',
                    removed
                      ? 'border-line/40 bg-surface/30 opacity-35 line-through'
                      : r.tombstone
                      ? 'border-rose-500/50 bg-rose-500/10'
                      : r.latest
                      ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                      : 'border-line bg-surface'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted font-bold">Offset {r.offset}</span>
                    {removed ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] text-muted">DROPPED</span>
                    ) : r.tombstone ? (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                        TOMBSTONE
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                        KEPT ✓
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-primary">Key: {r.key}</div>
                    <div className={cn('text-xs font-semibold', r.tombstone ? 'text-rose-300' : 'text-ink')}>
                      Val: {r.val}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-sans text-ink-2">
                {az
                  ? 'Nəticə: user_A üçün Bakı və Gəncə silindi, yalnız ən son ünvanı "Sumqayıt" (Offset 4) saxlanıldı.'
                  : 'Result: Older values for user_A are garbage-collected; only Offset 4 ("Sumqayıt") remains.'}
              </span>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-2.5">
              <Trash2 className="h-4 w-4 text-rose-400 shrink-0" />
              <span className="font-sans text-ink-2">
                {az
                  ? 'Tombstone (Offset 5): user_B = NULL göndərildiyi üçün köhnə Offset 1 və açarın özü kökündən silinir (GDPR silinmə).'
                  : 'Tombstone (Offset 5): Sending key="user_B", value=NULL purges all prior occurrences of user_B.'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-2 opacity-75">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" /> Segment 01 (72h)
              </span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                DELETED
              </span>
            </div>
            <div className="text-[11px] text-muted">Offsets 0000 – 0999 (1 GB)</div>
            <p className="text-[11px] text-ink-2 font-sans">
              {az
                ? '48 saatlıq retention vaxtı bitdiyi üçün bütöv fayl diskdən silindi.'
                : 'Age > 48h retention threshold; entire .log file unlinked from disk.'}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <Archive className="h-4 w-4" /> Segment 02 (24h)
              </span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                RETAINED
              </span>
            </div>
            <div className="text-[11px] text-muted">Offsets 1000 – 1999 (1 GB)</div>
            <p className="text-[11px] text-ink-2 font-sans">
              {az
                ? 'Qapalı seqmentdir, lakin 48 saat tamam olmadığı üçün oxumağa açıqdır.'
                : 'Closed read-only segment still within the 48h retention window.'}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 space-y-2 shadow-[0_0_16px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Segment 03 (Active)
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                WRITING ✓
              </span>
            </div>
            <div className="text-[11px] text-muted">Offsets 2000 – 2410 (410 MB)</div>
            <p className="text-[11px] text-ink-2 font-sans">
              {az
                ? 'Aktiv seqmentdir — yeni gələn bütün mesajlar yalnız bura append olunur.'
                : 'Active segment receiving live producer appends.'}
            </p>
          </div>
        </div>
      )}
    </VizFrame>
  );
}
