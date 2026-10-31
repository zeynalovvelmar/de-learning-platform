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
    badge: { az: 'TƏMƏL BAZA & SQL', en: 'CORE SQL' },
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    engine: 'Engine: SQLite / PostgreSQL',
    desc: {
      az: 'SELECT/WHERE icra ardıcıllığı, JOIN-lar, GROUP BY, Window Functions, CTE-lər və cədvəl normallaşdırması (1NF–3NF).',
      en: 'Logical query execution order, JOINs, GROUP BY, Window Functions, CTEs, and database normalization (1NF–3NF).'
    },
    icon: Database,
  },
  python: {
    track: 'TRACK 02',
    badge: { az: 'PYTHON CORE', en: 'PYTHON CORE' },
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    engine: 'Runtime: Python 3.12',
    desc: {
      az: 'Data strukturları (dict, set, list), JSON emalı, generatorlar (O(1) yaddaş), xəta idarəetməsi və Dead-Letter Queue (DLQ).',
      en: 'Data structures (dict, set, list), JSON parsing, memory-efficient generators, error handling, and Dead-Letter Queue (DLQ).'
    },
    icon: Terminal,
  },
  data_architecture: {
    track: 'TRACK 03',
    badge: { az: 'ARXİTEKTURA & DWH', en: 'ARCHITECTURE & DWH' },
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    engine: 'Pattern: Kimball & Lakehouse',
    desc: {
      az: 'OLTP vs OLAP, Kimball modelləşdirməsi, Star və Snowflake schema, SCD Type 1/2, Medallion Architecture və Delta/Iceberg.',
      en: 'OLTP vs OLAP, Kimball modeling, Star & Snowflake schemas, SCD Type 1/2, Medallion Architecture, and Delta/Iceberg.'
    },
    icon: Cpu,
  },
  devops: {
    track: 'TRACK 04',
    badge: { az: 'DEVOPS & DOCKER', en: 'DEVOPS & DOCKER' },
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    engine: 'Stack: Linux / Git / Docker',
    desc: {
      az: 'Linux pipe və bash skriptləri, Git iş axını, Docker image və layer-lər, Volume/Network, Docker Compose və CI/CD pipeline-ları.',
      en: 'Linux pipes & bash scripts, Git workflows, Docker images & layers, Volumes/Networking, Docker Compose, and CI/CD pipelines.'
    },
    icon: Box,
  },
  spark: {
    track: 'TRACK 05',
    badge: { az: 'PAYLANMIŞ EMAL', en: 'DISTRIBUTED ENGINE' },
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    engine: 'Engine: PySpark / Spark SQL',
    desc: {
      az: 'Driver və Executor arxitekturası, Lazy Evaluation, Shuffle, repartition vs coalesce, Broadcast Join, Data Skew və Catalyst.',
      en: 'Driver & Executor architecture, Lazy Evaluation, Shuffle, repartition vs coalesce, Broadcast Join, Data Skew, and Catalyst.'
    },
    icon: Zap,
  },
  airflow: {
    track: 'TRACK 06',
    badge: { az: 'ORKESTRASİYA', en: 'ORCHESTRATION' },
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    engine: 'Orchestrator: Apache Airflow',
    desc: {
      az: 'DAG arxitekturası, TaskFlow API (@dag, @task), XCom limiti, logical_date, Catchup/Backfill, Idempotence və Dynamic Task Mapping.',
      en: 'DAG architecture, TaskFlow API (@dag, @task), XCom limits, logical_date, Catchup/Backfill, Idempotency, and Dynamic Task Mapping.'
    },
    icon: Clock,
  },
  dbt: {
    track: 'TRACK 07',
    badge: { az: 'ELT TRANSFORMASİYA', en: 'ELT TRANSFORM' },
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    engine: 'Framework: dbt Core',
    desc: {
      az: 'ELT fəlsəfəsi, ref() və source() DAG asılılıqları, View/Table/Incremental materializasiya, generic/singular testlər və SCD2 Snapshots.',
      en: 'ELT philosophy, ref() & source() lineage, View/Table/Incremental materializations, generic/singular tests, and SCD2 Snapshots.'
    },
    icon: GitBranch,
  },
  kafka: {
    track: 'TRACK 08',
    badge: { az: 'EVENT STREAMING', en: 'EVENT STREAMING' },
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    engine: 'Cluster: Apache Kafka (KRaft)',
    desc: {
      az: 'Broker və KRaft arxitekturası, Topic/Partition log-u, Offset-lər, Producer acks, ISR, Consumer Group Rebalance və Delivery Semantics.',
      en: 'Broker & KRaft architecture, Topic/Partition logs, Offsets, Producer acks, ISR, Consumer Group Rebalance, and Delivery Semantics.'
    },
    icon: Layers,
  },
  ms_sql: {
    track: 'TRACK 09',
    badge: { az: 'MS SQL & T-SQL', en: 'MS SQL & T-SQL' },
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    engine: 'Engine: Microsoft SQL Server',
    desc: {
      az: 'T-SQL sintaksisi, dəyişənlər və idarəetmə, Stored Procedure-lar, Scalar/Table Funksiyalar və tranzaksiya bütövlüyü.',
      en: 'T-SQL syntax, variables & control flow, Stored Procedures, Scalar/Table Functions, and transaction ACID integrity.'
    },
    icon: Database,
  },
  modern_lakehouse: {
    track: 'TRACK 10',
    badge: { az: 'LAKEHOUSE ARCHITECTURE', en: 'LAKEHOUSE STACK' },
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    engine: 'Stack: Iceberg / Nessie / Trino',
    desc: {
      az: 'Açıq cədvəl formatı (Iceberg), Git kataloqu və WAP (Nessie), paylanmış in-memory sorğu mühərriki (Trino) və dbt.',
      en: 'Open table format (Iceberg), Git catalog & WAP (Nessie), distributed query engine (Trino), and dbt.'
    },
    icon: Layers,
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
  const activeModule = lastLessonId ? modules.find(m => m.id === lastLessonId.moduleId) : modules[0];
  const activeLessonList = activeModule ? moduleLessons[activeModule.id] || [] : [];
  const activeLesson = lastLessonId 
    ? activeLessonList.find(l => l.id === lastLessonId.lessonId) 
    : activeLessonList[0];

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
    if (filter === 'streaming') return ['python', 'devops', 'spark', 'airflow', 'kafka'].includes(m.id);
    if (filter === 'storage') return ['sql', 'ms_sql', 'data_architecture', 'dbt', 'modern_lakehouse'].includes(m.id);
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
              <span>INTERN &amp; JUNIOR DE ROADMAP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink font-sans leading-tight">
              {isAz ? 'Data Engineering Tədris Bazası & Sistem Arxitekturası' : 'Data Engineering Learning Base & Systems Architecture'}
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              {isAz 
                ? 'Intern və Junior Data Engineer vakansiyalarına hazırlıq üçün addım-addım nəzəriyyə, arxitektura sxemləri, interaktiv kod mühiti və real müsahibə sualları.' 
                : 'Step-by-step theory, architecture blueprints, interactive code sandboxes, and real interview questions designed for Intern and Junior Data Engineer preparation.'}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-2 border-t border-line/60">
            <div>
              <span className="text-ink font-bold">{totalLessonsCount || 87}</span> {isAz ? 'Dərs' : 'Lessons'}
            </div>
            <span>•</span>
            <div>
              <span className="text-ink font-bold">8</span> {isAz ? 'Əsas Modul' : 'Core Modules'}
            </div>
            <span>•</span>
            <div>
              <span className="text-secondary font-bold">SQL &amp; Python</span> {isAz ? 'İnteraktiv Sandbox' : 'Live Sandbox'}
            </div>
            <span>•</span>
            <div>
              <span className="text-primary font-bold">87 SVG</span> {isAz ? 'Arxitektura Sxemi' : 'Architecture Diagrams'}
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

            const badgeText = pct === 100
              ? (isAz ? 'TAMAMLANDI' : 'COMPLETED')
              : pct > 0
              ? (isAz ? `DAVAM EDİR (${pct}%)` : `IN PROGRESS (${pct}%)`)
              : (isAz ? trackInfo.badge.az : trackInfo.badge.en);

            const badgeClass = pct === 100
              ? 'bg-secondary/15 text-secondary border-secondary/30'
              : pct > 0
              ? 'bg-primary/15 text-primary border-primary/30'
              : trackInfo.badgeColor;

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
                    <span className={cn('font-mono text-[10px] font-bold px-2 py-0.5 rounded border', badgeClass)}>
                      {badgeText}
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
