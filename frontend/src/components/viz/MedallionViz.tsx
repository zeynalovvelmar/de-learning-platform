'use client';

import React, { useState } from 'react';
import { 
  Archive, 
  Filter, 
  Trophy, 
  Radio, 
  BarChart3, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Database
} from 'lucide-react';
import { VizFrame, useViz } from './VizFrame';
import { L, type LText } from './shared';
import { cn } from '@/lib/utils';

type MedallionTier = 'bronze' | 'silver' | 'gold';

interface TierDetail {
  id: MedallionTier;
  title: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  summary: LText;
  schemaEnforcement: LText;
  retention: LText;
  sampleSql: string;
  traits: LText[];
}

const TIERS: Record<MedallionTier, TierDetail> = {
  bronze: {
    id: 'bronze',
    title: 'Bronze Layer (Xam / Raw)',
    badge: 'RAW / APPEND-ONLY',
    badgeColor: 'bg-amber-700/20 text-amber-500 border-amber-600/40',
    borderColor: 'border-amber-600/50',
    glowColor: 'bg-amber-600/10',
    summary: L(
      'Mənbələrdən gələn datanın heç bir dəyişiklik edilmədən, xam şəkildə saxlandığı təbəqə. Həmişə append-only işləyir.',
      'Untouched raw ingestion layer from all source systems. Always append-only to preserve an immutable audit trail.',
    ),
    schemaEnforcement: L('Yoxdur (Schema-on-read)', 'None (Schema-on-read)'),
    retention: L('Uzunmüddətli (İllər / Tarixçə)', 'Long-term (Years / Immutable history)'),
    sampleSql: `-- Bronze: Xam JSON payload olduğu kimi yazılır
INSERT INTO bronze_orders 
SELECT 
  current_timestamp() as _ingested_at,
  'kafka_topic_orders' as _source,
  raw_payload:order_id::string as raw_id,
  raw_payload as raw_json
FROM stream_kafka_orders;`,
    traits: [
      L('Toxunulmaz audit arxivi', 'Immutable audit trail'),
      L('Hər hansı xəta olduqda yenidən emal imkanı', 'Ability to reprocess on pipeline bugs'),
      L('Minimum gecikmə ilə sürətli qəbul', 'Ultra-fast ingestion with minimal latency'),
    ],
  },
  silver: {
    id: 'silver',
    title: 'Silver Layer (Təmizlənmiş / Cleansed)',
    badge: 'CONFORMED & CLEAN',
    badgeColor: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
    borderColor: 'border-slate-400/50',
    glowColor: 'bg-slate-400/10',
    summary: L(
      'Xam məlumatların təmizləndiyi, tiplərin təyin edildiyi, təkrar sətirlərin (deduplication) silindiyi və normallaşdırıldığı təbəqə.',
      'Cleansed, deduplicated, and conformed enterprise layer. Types are cast, NULL values handled, and entities conformed.',
    ),
    schemaEnforcement: L('Sərt (Schema Enforcement: ON)', 'Strict (Schema Enforcement: ON)'),
    retention: L('Əməliyyat tarixi (Aktual + SCD Type 2)', 'Operational history (Current + SCD Type 2)'),
    sampleSql: `-- Silver: Təmizləmə, deduplication və tip çevrilməsi
MERGE INTO silver_orders as target
USING (
  SELECT 
    raw_id as order_id,
    TRY_CAST(raw_json:user_id AS INT) as user_id,
    TRY_CAST(raw_json:amount AS DECIMAL(10,2)) as amount,
    TO_TIMESTAMP(raw_json:timestamp) as order_time
  FROM bronze_orders
  WHERE raw_id IS NOT NULL
  QUALIFY ROW_NUMBER() OVER(PARTITION BY raw_id ORDER BY _ingested_at DESC) = 1
) as src
ON target.order_id = src.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;`,
    traits: [
      L('Deduplication (təkrar sətirlərin ləğvi)', 'Strict deduplication per entity key'),
      L('NULL və çirkli tiplərin filtrasiyası', 'Null checks and data type verification'),
      L('Bütün mühəndislər üçün tək həqiqət mənbəyi', 'Enterprise-wide single source of clean data'),
    ],
  },
  gold: {
    id: 'gold',
    title: 'Gold Layer (Biznes-Hazır / Aggregated)',
    badge: 'STAR SCHEMA / KPIS',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    borderColor: 'border-amber-400/60',
    glowColor: 'bg-amber-400/15',
    summary: L(
      'Biznes analitikləri və hesabatlar üçün xüsusi olaraq aqreqasiya edilmiş, Star Schema (ulduz sxemi) şəklində yığılmış yüksək sürətli təbəqə.',
      'Curated business-level tables, star-schema fact and dimensions, and pre-computed aggregations for instant BI queries.',
    ),
    schemaEnforcement: L('Analitik Sxem (Fact & Dim)', 'Analytical Schema (Fact & Dim)'),
    retention: L('Biznes ehtiyacına görə (Marts)', 'Per business requirements (Data Marts)'),
    sampleSql: `-- Gold: Gündəlik gəlir və istifadəçi aktivliyi KPI-ları
CREATE OR REPLACE TABLE gold_daily_sales_kpi AS
SELECT 
  DATE_TRUNC('day', order_time) as sales_date,
  user_country,
  COUNT(DISTINCT user_id) as active_buyers,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_order_value
FROM silver_orders s
JOIN silver_users u ON s.user_id = u.user_id
GROUP BY 1, 2;`,
    traits: [
      L('BI alətləri üçün saniyəaltı cavab müddəti', 'Sub-second response times for dashboards'),
      L('Öncədən hesablanmış KPI və aqreqatlar', 'Pre-calculated metrics and Kimball star schemas'),
      L('ML Feature Store və rəhbərlik hesabatları', 'Feeds ML feature stores and executive boards'),
    ],
  },
};

export function MedallionViz() {
  const { lt } = useViz();
  const [selectedTier, setSelectedTier] = useState<MedallionTier>('silver');

  const active = TIERS[selectedTier];

  return (
    <VizFrame
      title={L('Lakehouse Medallion Arxitekturası (Bronze → Silver → Gold)', 'Lakehouse Medallion Architecture (Bronze → Silver → Gold)')}
      subtitle={L('Databricks və müasir Lakehouse-ların qızıl standartı: hər təbəqədə artan keyfiyyət', 'The gold standard of Databricks and modern lakehouses: progressive data quality')}
      badge="Lakehouse"
      footer={L(
        'Xam data Bronze-da toxunulmaz qalır (hər hansı xəta olduqda hər şeyi sıfırdan bərpa etmək mümkündür). Silver daxili təhlillər, Gold isə Power BI / Tableau və rəhbərlik hesabatları üçün nəzərdə tutulur.',
        'Bronze retains the raw truth indefinitely, enabling zero-data-loss pipeline rollbacks. Silver serves engineers and clean queries, while Gold powers sub-second dashboards and ML.',
      )}
    >
      {/* 1. Main End-to-End Pipeline Strip */}
      <div className="mb-6 rounded-xl border border-line bg-surface-2/60 p-3 sm:p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto pb-1">
          {/* Stage: Ingestion */}
          <div className="flex flex-col items-center gap-1 min-w-[7.5rem] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Mənbələr</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink shadow-2xs">
              <Radio className="h-3.5 w-3.5 text-blue-500" />
              <span>Kafka / CDC / API</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-muted shrink-0 hidden md:block" />

          {/* Stage: Bronze */}
          <button
            type="button"
            onClick={() => setSelectedTier('bronze')}
            className={cn(
              'group flex flex-col items-center gap-1 min-w-[8.5rem] rounded-xl border p-2 text-center transition-all cursor-pointer',
              selectedTier === 'bronze' 
                ? 'border-amber-600 bg-amber-600/15 shadow-sm scale-102' 
                : 'border-line bg-surface hover:border-amber-600/40',
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-500">
              <Archive className="h-3.5 w-3.5" />
              <span>1. BRONZE</span>
            </div>
            <span className="font-mono text-[10px] text-muted">Xam / Append-only</span>
            <span className="rounded-full bg-amber-600/20 px-2 py-0.5 text-[9px] font-bold text-amber-500">
              Raw Parquet
            </span>
          </button>

          <ArrowRight className="h-4 w-4 text-muted shrink-0 hidden md:block" />

          {/* Stage: Silver */}
          <button
            type="button"
            onClick={() => setSelectedTier('silver')}
            className={cn(
              'group flex flex-col items-center gap-1 min-w-[8.5rem] rounded-xl border p-2 text-center transition-all cursor-pointer',
              selectedTier === 'silver' 
                ? 'border-slate-400 bg-slate-400/20 shadow-sm scale-102' 
                : 'border-line bg-surface hover:border-slate-400/40',
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300">
              <Filter className="h-3.5 w-3.5" />
              <span>2. SILVER</span>
            </div>
            <span className="font-mono text-[10px] text-muted">Təmizlənmiş / Dedupe</span>
            <span className="rounded-full bg-slate-400/20 px-2 py-0.5 text-[9px] font-bold text-slate-300">
              Clean Delta
            </span>
          </button>

          <ArrowRight className="h-4 w-4 text-muted shrink-0 hidden md:block" />

          {/* Stage: Gold */}
          <button
            type="button"
            onClick={() => setSelectedTier('gold')}
            className={cn(
              'group flex flex-col items-center gap-1 min-w-[8.5rem] rounded-xl border p-2 text-center transition-all cursor-pointer',
              selectedTier === 'gold' 
                ? 'border-amber-400 bg-amber-400/20 shadow-sm scale-102' 
                : 'border-line bg-surface hover:border-amber-400/40',
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              <span>3. GOLD</span>
            </div>
            <span className="font-mono text-[10px] text-muted">Biznes / Star Schema</span>
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
              Marts & KPIs
            </span>
          </button>

          <ArrowRight className="h-4 w-4 text-muted shrink-0 hidden md:block" />

          {/* Stage: Consumption */}
          <div className="flex flex-col items-center gap-1 min-w-[7.5rem] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">İstifadə</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-2xs">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              <span>BI / ML / SQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Deep Dive into Selected Layer */}
      <div className={cn('rounded-xl border p-4 transition-all', active.borderColor, active.glowColor)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-md border px-2.5 py-1 font-mono text-[10px] font-extrabold', active.badgeColor)}>
              {active.badge}
            </span>
            <h3 className="text-sm font-bold text-ink">{active.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted">
            <span>Sxem: <b className="text-ink">{lt(active.schemaEnforcement)}</b></span>
            <span>Saxlanma: <b className="text-ink">{lt(active.retention)}</b></span>
          </div>
        </div>

        <p className="text-xs text-ink-2 mb-4 leading-relaxed font-sans">
          {lt(active.summary)}
        </p>

        {/* Two-column view: Key traits & Sample SQL transformation */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: Architectural traits */}
          <div className="space-y-2 rounded-lg border border-line bg-surface p-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Əsas Prinsiplər & Qaydalar</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {active.traits.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-ink-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{lt(t)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Concrete SQL execution */}
          <div className="rounded-lg border border-line bg-zinc-950 p-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono text-muted">
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3 text-accent" />
                <span>Nümunə SQL Transformasiyası</span>
              </span>
              <span>SQL</span>
            </div>
            <pre className="overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-snug">
              <code>{active.sampleSql}</code>
            </pre>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
