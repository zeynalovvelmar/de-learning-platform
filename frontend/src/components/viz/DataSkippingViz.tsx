'use client';

import React, { useState } from 'react';
import { FolderTree, Hash, Grid, CheckCircle2, XCircle, AlertTriangle, ArrowDown } from 'lucide-react';
import { VizFrame } from './VizFrame';
import { L } from './shared';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

type TabMode = 'partition' | 'bucket' | 'zorder';

export function DataSkippingViz() {
  const { language } = useLanguage();
  const az = language === 'az';
  const [tab, setTab] = useState<TabMode>('zorder');

  const tabs: { id: TabMode; label: string; badge: string; icon: React.ElementType }[] = [
    {
      id: 'partition',
      label: az ? '1. Partisiya (Qovluq)' : '1. Partitioning',
      badge: 'Low Cardinality',
      icon: FolderTree,
    },
    {
      id: 'bucket',
      label: az ? '2. Bucketing (Heş)' : '2. Bucketing (Hash)',
      badge: 'Shuffle-Free Join',
      icon: Hash,
    },
    {
      id: 'zorder',
      label: az ? '3. Z-Order (Morton Əyrisi)' : '3. Z-Order (Multi-Column)',
      badge: '2D Skipping',
      icon: Grid,
    },
  ];

  return (
    <VizFrame
      badge="Data Skipping"
      title={L(
        'Data Skipping Müqayisəsi: Partisiya vs Bucketing vs Z-Order',
        'Data Skipping Comparison: Partitioning vs Bucketing vs Z-Order'
      )}
      subtitle={L(
        'Lazımsız faylları diskdən oxumadan (I/O Pruning) sorğunu 10x–100x sürətləndirmə üsulları',
        'Techniques to skip irrelevant files before disk I/O and speed up queries 10x–100x'
      )}
      actions={
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs font-mono">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition cursor-pointer',
                  active
                    ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                    : 'text-muted hover:text-ink'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      }
      footer={
        tab === 'partition'
          ? L(
              'Partisiya yalnız aşağı kardinallıqlı sütunlar (date, country) üçündür. user_id kimi milyonlarla unikal dəyəri olan sütuna partisiya versəniz "Xırda Fayllar Problemi" (Small Files Problem) yaranar.',
              'Partitioning is strictly for low-cardinality columns (date, country). Partitioning on high-cardinality columns like user_id causes the Small Files Problem.'
            )
          : tab === 'bucket'
          ? L(
              'Bucketing məlumatı hash(user_id) % N ilə sabit sayda fayla bölür. İki böyük cədvəl eyni sayda bucket-ə malikdirsə, JOIN zamanı şəbəkə üzərindən Shuffle baş vermir!',
              'Bucketing distributes rows into a fixed number of files via hash(key) % N. Co-bucketed tables join locally without expensive network shuffles!'
            )
          : L(
              'Z-Order (Morton əyrisi) bir neçə sütunu (məs: customer_id + event_type) 2D fəzada qruplaşdırır. Hər iki sütun üzrə Min/Max statistika sayəsində faylların 75–90%-i oxunmadan atılır.',
              'Z-Order maps multi-dimensional columns along a Z-shaped space-filling curve so Min/Max file statistics can skip 75–90% of Parquet files on multi-column filters.'
            )
      }
    >
      <div className="w-full space-y-4">
        {/* TAB 1: PARTITIONING */}
        {tab === 'partition' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 font-mono text-xs">
              <span className="text-muted">
                SQL: <code className="text-primary font-bold">SELECT SUM(rev) FROM sales WHERE date = &apos;2026-10-16&apos;;</code>
              </span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-bold">
                {az ? '75% Qovluq Atıldı (Partition Pruning)' : '75% Folders Pruned'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { dir: 'date=2026-10-14', files: 'part-00.parquet (128MB)', hit: false },
                { dir: 'date=2026-10-15', files: 'part-00.parquet (140MB)', hit: false },
                { dir: 'date=2026-10-16', files: 'part-00.parquet (132MB)', hit: true },
                { dir: 'date=2026-10-17', files: 'part-00.parquet (119MB)', hit: false },
              ].map((p) => (
                <div
                  key={p.dir}
                  className={cn(
                    'rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-2.5 font-mono',
                    p.hit
                      ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                      : 'border-line/50 bg-surface/40 opacity-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                      <FolderTree className={cn('h-4 w-4', p.hit ? 'text-emerald-400' : 'text-muted')} />
                      {p.dir}/
                    </span>
                    {p.hit ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> READ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                        <XCircle className="h-3 w-3" /> SKIP
                      </span>
                    )}
                  </div>
                  <div className="rounded bg-surface-lowest px-2.5 py-1.5 text-[10px] text-muted border border-line/40">
                    {p.files}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                {az
                  ? 'Təhlükə: Yüksək kardinallıqlı sütuna (məs: user_id) görə partisiya etsəniz milyonlarla 1 KB-lıq qovluq yaranır və NameNode / S3 LIST əməliyyatı çökür!'
                  : 'Warning: Partitioning by high-cardinality columns (e.g. user_id) creates millions of tiny 1 KB files and bottlenecks metadata listing!'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: BUCKETING */}
        {tab === 'bucket' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 font-mono text-xs">
              <span className="text-muted">
                Formula: <code className="text-primary font-bold">bucket_id = hash(user_id) % 4</code>
              </span>
              <span className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-primary font-bold">
                {az ? '0 MB Şəbəkə Shuffle (Lokal Sort-Merge Join)' : '0 MB Network Shuffle (Local Bucket Join)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              {[0, 1, 2, 3].map((b) => (
                <div key={b} className="rounded-xl border border-line bg-surface p-3 flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg border border-blue-500/40 bg-blue-500/10 p-2 text-center">
                    <div className="text-[10px] text-blue-300 uppercase font-bold">orders · bucket_0{b}</div>
                    <div className="text-[11px] text-ink mt-0.5">hash % 4 == {b}</div>
                  </div>

                  <div className="flex flex-col items-center text-emerald-400 text-[10px] font-bold py-0.5">
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>LOCAL JOIN</span>
                  </div>

                  <div className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-center">
                    <div className="text-[10px] text-emerald-300 uppercase font-bold">users · bucket_0{b}</div>
                    <div className="text-[11px] text-ink mt-0.5">hash % 4 == {b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Z-ORDER */}
        {tab === 'zorder' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 font-mono text-xs">
              <span className="text-muted">
                DDL: <code className="text-primary font-bold">OPTIMIZE events ZORDER BY (customer_id, event_type);</code>
              </span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-bold">
                {az ? '4 Fayldan Yalnız 1-i Oxunur (75% Skipped)' : 'Only 1 of 4 Files Scanned (75% Skipped)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Left: 2D Coordinate Grid with Z-Order Curve SVG */}
              <div className="rounded-xl border border-line bg-surface-lowest p-4 flex flex-col items-center">
                <div className="text-[11px] font-mono text-muted mb-2 uppercase tracking-wider">
                  {az ? '2D Fəzada Morton Z-Əyrisi (4 Parquet Faylı)' : '2D Morton Z-Curve across 4 Parquet Files'}
                </div>

                <svg viewBox="0 0 280 220" className="w-full max-w-[290px] h-auto">
                  {/* Quadrant 1 (Top-Left) - TARGET HIT */}
                  <rect x="25" y="15" width="110" height="85" rx="8" fill="rgba(16,185,129,0.14)" stroke="rgba(16,185,129,0.7)" strokeWidth="2" />
                  <text x="35" y="32" fill="#6ee7b7" fontSize="10" fontWeight="bold" fontFamily="monospace">FILE 01 (READ ✓)</text>
                  <text x="35" y="46" fill="#d1fae5" fontSize="9" fontFamily="monospace">cust: 1..250</text>
                  <text x="35" y="58" fill="#d1fae5" fontSize="9" fontFamily="monospace">type: Click, Buy</text>

                  {/* Quadrant 2 (Top-Right) - SKIPPED */}
                  <rect x="150" y="15" width="110" height="85" rx="8" fill="rgba(30,31,37,0.7)" stroke="rgba(59,60,70,0.8)" strokeWidth="1.5" />
                  <text x="160" y="32" fill="#9ca3af" fontSize="10" fontWeight="bold" fontFamily="monospace">FILE 02 (SKIP)</text>
                  <text x="160" y="46" fill="#6b7280" fontSize="9" fontFamily="monospace">cust: 251..500</text>
                  <text x="160" y="58" fill="#6b7280" fontSize="9" fontFamily="monospace">type: Click, Buy</text>

                  {/* Quadrant 3 (Bottom-Left) - SKIPPED */}
                  <rect x="25" y="115" width="110" height="85" rx="8" fill="rgba(30,31,37,0.7)" stroke="rgba(59,60,70,0.8)" strokeWidth="1.5" />
                  <text x="35" y="132" fill="#9ca3af" fontSize="10" fontWeight="bold" fontFamily="monospace">FILE 03 (SKIP)</text>
                  <text x="35" y="146" fill="#6b7280" fontSize="9" fontFamily="monospace">cust: 1..250</text>
                  <text x="35" y="158" fill="#6b7280" fontSize="9" fontFamily="monospace">type: View, Exit</text>

                  {/* Quadrant 4 (Bottom-Right) - SKIPPED */}
                  <rect x="150" y="115" width="110" height="85" rx="8" fill="rgba(30,31,37,0.7)" stroke="rgba(59,60,70,0.8)" strokeWidth="1.5" />
                  <text x="160" y="132" fill="#9ca3af" fontSize="10" fontWeight="bold" fontFamily="monospace">FILE 04 (SKIP)</text>
                  <text x="160" y="146" fill="#6b7280" fontSize="9" fontFamily="monospace">cust: 251..500</text>
                  <text x="160" y="158" fill="#6b7280" fontSize="9" fontFamily="monospace">type: View, Exit</text>

                  {/* Glowing Z-Curve connecting Quadrant 1 -> 2 -> 3 -> 4 */}
                  <path
                    d="M 80 75 L 205 75 L 80 175 L 205 175"
                    fill="none"
                    stroke="#c0c1ff"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />
                  <circle cx="80" cy="75" r="5" fill="#10b981" />
                  <circle cx="205" cy="75" r="4" fill="#c0c1ff" />
                  <circle cx="80" cy="175" r="4" fill="#c0c1ff" />
                  <circle cx="205" cy="175" r="4" fill="#c0c1ff" />
                </svg>
              </div>

              {/* Right: Explanation of Multi-Dimensional Min/Max Skipping */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="rounded-lg border border-line bg-surface p-3 space-y-1.5">
                  <div className="text-[10px] text-primary uppercase font-bold">
                    {az ? 'Sorğu Filtri (Multi-Dimensional Filter)' : 'Multi-Dimensional Query Filter'}
                  </div>
                  <div className="text-ink font-semibold">
                    WHERE customer_id = 42 AND event_type = &apos;Buy&apos;
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-1">
                  <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>FILE 01 Metadata: [cust: 1..250, type: Buy..Click]</span>
                  </div>
                  <p className="text-[11px] text-ink-2 font-sans">
                    {az
                      ? '42 [1..250] aralığına düşür və "Buy" bu fayldadır → Yalnız bu Parquet faylı diskdən oxunur!'
                      : '42 falls inside [1..250] and "Buy" is present → Engine scans ONLY File 01!'}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface/60 p-3 space-y-1 text-muted">
                  <div className="font-bold flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                    <span>FILE 02, 03, 04 Metadata</span>
                  </div>
                  <p className="text-[11px] font-sans">
                    {az
                      ? 'Min/Max statistikası uyğun gəlmədiyi üçün fayllar heç açılmadan (Data Skipping) ötürülür.'
                      : 'Min/Max footer statistics do not match, so 75% of files are skipped without opening.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VizFrame>
  );
}
