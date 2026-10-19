'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ArrowRight, 
  Terminal, 
  Database, 
  Zap, 
  Layers, 
  Clock, 
  Cpu, 
  Box, 
  GitBranch, 
  CheckCircle2, 
  Copy, 
  Check, 
  Maximize2,
  Sparkles,
  Server,
  PlayCircle,
  Radio
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { ModuleSummary, LessonSummary } from '@/types';
import { cn } from '@/lib/utils';

interface HomeHubProps {
  modules: ModuleSummary[];
  moduleLessons: Record<string, LessonSummary[]>;
  lastLessonId?: { moduleId: string; lessonId: string } | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

const MODULE_TRACKS: Record<string, {
  track: string;
  badge: { az: string; en: string };
  badgeColor: string;
  engine: string;
  desc: { az: string; en: string };
  icon: React.ElementType;
}> = {
  sql: {
    track: 'TRACK 01',
    badge: { az: 'TAMAMLANDI', en: 'COMPLETED' },
    badgeColor: 'bg-secondary/15 text-secondary border-secondary/30',
    engine: 'Engine: PostgreSQL 16',
    desc: {
      az: 'EXPLAIN ANALYZE, B-Trees, Window Functions və paralel yüklər altında sorğu planları.',
      en: 'EXPLAIN ANALYZE, B-Trees, Window Functions, and query execution plans under parallel load.'
    },
    icon: Database,
  },
  python: {
    track: 'TRACK 02',
    badge: { az: 'DAVAM EDİR', en: 'IN PROGRESS' },
    badgeColor: 'bg-primary/15 text-primary border-primary/30',
    engine: 'Kernel: Python 3.12',
    desc: {
      az: 'Generatorlar, Polars yaddaş profili, AsyncIO streaming dövrləri və GIL-siz paralel icra.',
      en: 'Generators, Polars memory profiling, AsyncIO streaming loops, and GIL-free concurrency.'
    },
    icon: Terminal,
  },
  data_architecture: {
    track: 'TRACK 03',
    badge: { az: 'NƏZƏRİYYƏ & RFC', en: 'THEORY & RFC' },
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    engine: 'Specs: 4 Architecture RFCs',
    desc: {
      az: 'Kimball Ulduz Sxemi, Medallion Bronze/Silver/Gold və Parquet/Delta ACID saxlancı.',
      en: 'Kimball Star Schema, Medallion Bronze/Silver/Gold, and Parquet/Delta ACID storage.'
    },
    icon: Cpu,
  },
  kafka: {
    track: 'TRACK 04',
    badge: { az: 'AXIN ŞİNİ', en: 'STREAMING BUS' },
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    engine: 'Cluster: KRaft v3.7',
    desc: {
      az: 'Partisiya strategiyaları, rebalance protokolları, Schema Registry və producer idempotentliyi.',
      en: 'Partitioning strategies, rebalance protocols, Schema Registry, and producer idempotency.'
    },
    icon: Layers,
  },
  spark: {
    track: 'TRACK 05',
    badge: { az: 'EMAL MÜHƏRRİKİ', en: 'PROCESSING' },
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    engine: 'Spark 3.5 Engine',
    desc: {
      az: 'Catalyst Optimizer, Shuffle Partitions tuning, Tungsten yaddaş idarəsi və Spill mitigasiyası.',
      en: 'Catalyst Optimizer, Shuffle Partitions tuning, Tungsten memory management, and Spill mitigation.'
    },
    icon: Zap,
  },
  airflow: {
    track: 'TRACK 06',
    badge: { az: 'ORKESTRASİYA', en: 'ORCHESTRATION' },
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    engine: 'Airflow 2.9 LTS',
    desc: {
      az: 'Dinamik DAG generatoru, TaskFlow API dekoratorları, deferrable sensorlar və Celery işçiləri.',
      en: 'Dynamic DAG generator, TaskFlow API decorators, deferred sensors, and Celery workers.'
    },
    icon: Clock,
  },
  dbt: {
    track: 'TRACK 07',
    badge: { az: 'TRANSFORMASİYA', en: 'TRANSFORM' },
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    engine: 'dbt Core v1.8',
    desc: {
      az: 'İnkremental materializasiyalar, Kimball Star Schema modelləri, müqavilə testləri və lineage.',
      en: 'Incremental materializations, Kimball Star Schema models, contract testing, and lineage graph.'
    },
    icon: GitBranch,
  },
  devops: {
    track: 'TRACK 08',
    badge: { az: 'İNFRASTRUKTUR', en: 'INFRASTRUCTURE' },
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    engine: 'Stack: K8s / Helm / Docker',
    desc: {
      az: 'Konteynerləşdirilmiş data pipeline-lar, Helm çartları, CI/CD sxem yoxlaması və K8s icrası.',
      en: 'Containerized data pipelines, Helm deployment charts, CI/CD schema validation, and K8s.'
    },
    icon: Box,
  },
};

const SAMPLE_HCL = `pipeline "medallion_clickstream" {
  engine       = "SPARK_3_5"
  source_topic = "telemetry.events.raw"

  storage_tier "bronze" {
    format       = "DELTA"
    partition_by = ["date", "tenant_id"]
    retention    = "90d"
  }

  compaction {
    strategy    = "AUTO_OPTIMIZE"
    target_size = "128MB"
  }
}`;

export function HomeHub({ modules, moduleLessons, lastLessonId, onSelectLesson }: HomeHubProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, completedLessons } = useProgress();
  const [filter, setFilter] = useState<'all' | 'streaming' | 'storage'>('all');
  const [copiedHcl, setCopiedHcl] = useState(false);
  const [activeStage, setActiveStage] = useState(2); // default Lakehouse

  const isAz = language === 'az';

  const totalLessonsCount = modules.reduce((acc, m) => acc + m.total_lessons, 0);
  const completedCount = completedLessons.size;
  const overallProgressPct = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  // Active or last lesson details
  const activeModule = lastLessonId ? modules.find(m => m.id === lastLessonId.moduleId) : modules[2] || modules[0];
  const activeLessonList = activeModule ? moduleLessons[activeModule.id] || [] : [];
  const activeLesson = lastLessonId 
    ? activeLessonList.find(l => l.id === lastLessonId.lessonId) 
    : activeLessonList[2] || activeLessonList[0];

  const handleResume = () => {
    if (lastLessonId) {
      onSelectLesson(lastLessonId.moduleId, lastLessonId.lessonId);
    } else if (activeModule && activeLesson) {
      onSelectLesson(activeModule.id, activeLesson.id);
    }
  };

  const handleCopyHcl = () => {
    navigator.clipboard.writeText(SAMPLE_HCL);
    setCopiedHcl(true);
    setTimeout(() => setCopiedHcl(false), 2000);
  };

  const filteredModules = modules.filter(m => {
    if (filter === 'streaming') return ['kafka', 'spark', 'airflow'].includes(m.id);
    if (filter === 'storage') return ['data_architecture', 'sql', 'dbt'].includes(m.id);
    return true;
  });

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      {/* 1. Hero Section & Active Journey Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Header */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-low border border-line text-primary font-mono text-[11px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span>SYSTEM ROADMAP 2025</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink font-sans leading-tight">
              {isAz ? 'Data Mühəndisliyi Bilik Bazası & Sistem Arxitekturası' : 'Data Engineering Knowledge Base & Systems Architecture'}
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              {isAz 
                ? 'Paylanmış emal nüvələri, saxlanc mühərrikləri və istehsalat qaydaları. Sıfır boş söz, yalnız mühəndislik dəqiqliyi.' 
                : 'Production patterns, distributed processing kernels, and storage engines for scale. Zero fluff, publication-grade engineering rigor.'}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-2 border-t border-line/60">
            <div>
              <span className="text-ink font-bold">{totalLessonsCount || 87}</span> {isAz ? 'Dərs' : 'Lessons'}
            </div>
            <span>•</span>
            <div>
              <span className="text-ink font-bold">8</span> {isAz ? 'Əsas Track' : 'Core Tracks'}
            </div>
            <span>•</span>
            <div>
              <span className="text-secondary font-bold">DuckDB WASM</span> {isAz ? 'İnteraktiv İcra' : 'Engine Live'}
            </div>
            <span>•</span>
            <div>
              <span className="text-primary font-bold">ByteByteGo</span> {isAz ? 'Vektor Sxemləri' : 'Diagrams'}
            </div>
          </div>
        </div>

        {/* Right: Resume Active Journey Card */}
        <div className="lg:col-span-4 rounded-xl border border-line bg-surface-low p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                {isAz ? 'AKTİV DƏRSİ DAVAM ET' : 'RESUME ACTIVE JOURNEY'}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] font-extrabold text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                <span>{overallProgressPct}% {isAz ? 'hazır' : 'complete'}</span>
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-primary font-mono truncate">
                {activeModule ? t(activeModule.title) : 'Data Architecture'}
              </div>
              <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-1">
                {activeLesson ? t(activeLesson.title) : 'Medallion Architecture & Delta Lake'}
              </h3>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-high h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(overallProgressPct, 15)}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-line/50">
            <span className="font-mono text-[10px] text-muted">
              Session ready (0.12s)
            </span>
            <button
              onClick={handleResume}
              className="px-3 py-1.5 bg-primary-container text-zinc-950 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer shadow-xs"
            >
              <span>{isAz ? 'Dərsə Başla' : 'Open Lesson'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Reference Diagram: Distributed End-to-End Pipeline Map */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-line pb-2.5 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              {isAz ? 'ARXİTEKTURA SXEMİ' : 'REFERENCE DIAGRAM'}
            </span>
            <span className="h-3 w-px bg-line" />
            <h2 className="text-base sm:text-lg font-bold text-ink">
              {isAz ? 'Paylanmış Ucdan-Uca Data Pipeline Xəritəsi' : 'Distributed End-to-End Pipeline Map'}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <span>Architecture: Medallion Lakehouse v2.4</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-secondary font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
              Live Blueprint
            </span>
          </div>
        </div>

        {/* Diagram Display Frame */}
        <div className="relative rounded-xl border border-line bg-surface-lowest overflow-hidden shadow-xs">
          {/* Top Label Pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-surface-low/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-line">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-wider text-ink">
              TOPOLOGY VIEW: DISTRIBUTED DATA MAP
            </span>
          </div>

          {/* High-Resolution Pipeline Image */}
          <div className="w-full flex items-center justify-center p-4 sm:p-6 bg-[#090a0f] min-h-[300px]">
            <Image
              src="/stitch/pipeline_map.png"
              alt="Distributed Data Pipeline Map and Medallion Storage Architecture"
              width={1024}
              height={550}
              className="w-full max-h-[460px] object-contain rounded-lg"
              priority
            />
          </div>

          {/* Interactive Pipeline Stage Ticker */}
          <div className="bg-surface-low border-t border-line p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] font-bold text-muted flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-primary" />
              <span>DATA FLOW STAGES:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Stage 1: Ingestion */}
              <button
                type="button"
                onClick={() => setActiveStage(0)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer',
                  activeStage === 0 
                    ? 'border-primary bg-surface text-primary shadow-xs' 
                    : 'border-line bg-surface-2 text-ink-2 hover:border-outline'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-semibold">Ingestion (Kafka)</span>
                <span className="font-mono text-[10px] text-muted bg-surface-high px-1.5 py-0.2 rounded">
                  14.2M msgs/s
                </span>
              </button>

              <span className="text-muted font-mono">→</span>

              {/* Stage 2: Stream Processing */}
              <button
                type="button"
                onClick={() => setActiveStage(1)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer',
                  activeStage === 1 
                    ? 'border-primary bg-surface text-primary shadow-xs' 
                    : 'border-line bg-surface-2 text-ink-2 hover:border-outline'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-semibold">Stream Processing (Spark)</span>
                <span className="font-mono text-[10px] text-muted bg-surface-high px-1.5 py-0.2 rounded">
                  128 Partitions
                </span>
              </button>

              <span className="text-muted font-mono">→</span>

              {/* Stage 3: Lakehouse Storage */}
              <button
                type="button"
                onClick={() => setActiveStage(2)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer',
                  activeStage === 2 
                    ? 'border-primary bg-surface text-primary font-bold shadow-xs' 
                    : 'border-line bg-surface-2 text-ink-2 hover:border-outline'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>Lakehouse Storage (Delta)</span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-bold">
                  Bronze/Silver/Gold
                </span>
              </button>

              <span className="text-muted font-mono">→</span>

              {/* Stage 4: Transformation */}
              <button
                type="button"
                onClick={() => setActiveStage(3)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer',
                  activeStage === 3 
                    ? 'border-primary bg-surface text-primary shadow-xs' 
                    : 'border-line bg-surface-2 text-ink-2 hover:border-outline'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                <span className="font-semibold">Transformation (dbt)</span>
                <span className="font-mono text-[10px] text-muted bg-surface-high px-1.5 py-0.2 rounded">
                  42 Models
                </span>
              </button>

              <span className="text-muted font-mono">→</span>

              {/* Stage 5: Serving */}
              <button
                type="button"
                onClick={() => setActiveStage(4)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer',
                  activeStage === 4 
                    ? 'border-primary bg-surface text-primary shadow-xs' 
                    : 'border-line bg-surface-2 text-ink-2 hover:border-outline'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-semibold">Serving (Trino / BI)</span>
                <span className="font-mono text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.2 rounded font-bold">
                  99.99% SLA
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Curriculum Modules Bento Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-line pb-2.5 gap-2">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {isAz ? 'Kurrikulum Modulları & Mühərrik Arxitekturası' : 'Curriculum Modules & Engine Internals'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {isAz 
                ? 'Paylanmış data nüvələri, axın runtime-ı və modelləşdirmə çərçivələrinin sistemli icmalı.' 
                : 'Systematic breakdown of distributed data kernels, streaming runtime, and modeling frameworks.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-outline uppercase text-[10px] mr-1">FILTER:</span>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md border text-[11px] font-bold transition',
                filter === 'all' 
                  ? 'bg-surface text-primary border-primary shadow-xs' 
                  : 'bg-surface-2 text-muted border-line hover:text-ink'
              )}
            >
              ALL ({modules.length})
            </button>
            <button
              onClick={() => setFilter('streaming')}
              className={cn(
                'px-2.5 py-1 rounded-md border text-[11px] font-bold transition',
                filter === 'streaming' 
                  ? 'bg-surface text-primary border-primary shadow-xs' 
                  : 'bg-surface-2 text-muted border-line hover:text-ink'
              )}
            >
              STREAMING
            </button>
            <button
              onClick={() => setFilter('storage')}
              className={cn(
                'px-2.5 py-1 rounded-md border text-[11px] font-bold transition',
                filter === 'storage' 
                  ? 'bg-surface text-primary border-primary shadow-xs' 
                  : 'bg-surface-2 text-muted border-line hover:text-ink'
              )}
            >
              STORAGE
            </button>
          </div>
        </div>

        {/* 8-Card Bento Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredModules.map((mod) => {
            const trackInfo = MODULE_TRACKS[mod.id] || {
              track: 'TRACK',
              badge: { az: 'AKTİV', en: 'ACTIVE' },
              badgeColor: 'bg-primary/10 text-primary border-primary/20',
              engine: 'Custom Engine',
              desc: { az: mod.title.az || '', en: mod.title.en || '' },
              icon: Database,
            };

            const Icon = trackInfo.icon;
            const lessons = moduleLessons[mod.id] || [];
            const completedInMod = lessons.filter(l => isLessonCompleted(l.id)).length;
            const pct = lessons.length > 0 ? Math.round((completedInMod / lessons.length) * 100) : 0;

            const handleLaunchModule = () => {
              if (lessons.length > 0) {
                onSelectLesson(mod.id, lessons[0].id);
              }
            };

            return (
              <div
                key={mod.id}
                onClick={handleLaunchModule}
                className="group rounded-xl border border-line bg-surface-low p-4 flex flex-col justify-between space-y-4 hover:border-outline hover:shadow-xs transition-all duration-150 cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider">
                      {trackInfo.track}
                    </span>
                    <span className={cn('font-mono text-[10px] font-bold px-2 py-0.5 rounded border', trackInfo.badgeColor)}>
                      {isAz ? trackInfo.badge.az : trackInfo.badge.en}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surface border border-line text-primary group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-ink group-hover:text-primary transition-colors">
                      {t(mod.title)}
                    </h3>
                  </div>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {isAz ? trackInfo.desc.az : trackInfo.desc.en}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-line/60">
                  <div className="flex items-center justify-between font-mono text-[11px] text-outline">
                    <span>{mod.total_lessons} {isAz ? 'Dərs' : 'Lessons'}</span>
                    <span className="font-bold text-ink">{pct}%</span>
                  </div>

                  <div className="w-full bg-surface-high h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-secondary h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                    <span className="text-muted text-[10px]">{trackInfo.engine}</span>
                    <span className="text-primary font-bold group-hover:underline flex items-center gap-0.5">
                      <span>{isAz ? 'Başla' : 'Start'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Configuration Preview Block */}
      <section className="rounded-xl border border-line bg-surface-lowest overflow-hidden shadow-xs">
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-surface-low border-b border-line text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-outline uppercase text-[10px] font-bold">CONFIG PREVIEW</span>
            <span className="text-line">•</span>
            <span className="text-primary font-bold">pipeline-manifest.hcl</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted text-[11px] hidden sm:inline">Target: AWS / EKS / Delta Lakehouse</span>
            <button
              onClick={handleCopyHcl}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-line bg-surface hover:bg-surface-2 text-ink text-[11px] font-bold transition cursor-pointer"
            >
              {copiedHcl ? (
                <>
                  <Check className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-secondary">{isAz ? 'Kopyalandı!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted" />
                  <span>{isAz ? 'Kodu Kopyala' : 'Copy Manifest'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="p-4 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-ink-2 bg-[#090a0f]">
          <code>{SAMPLE_HCL}</code>
        </pre>
      </section>
    </div>
  );
}
