'use client';

import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Database, 
  Zap, 
  Layers, 
  Wind, 
  Cpu, 
  Box, 
  GitBranch, 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  Server,
  FileCode2,
  FolderTree
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { ModuleSummary, LessonSummary } from '@/types';

interface HomeHubProps {
  modules: ModuleSummary[];
  moduleLessons: Record<string, LessonSummary[]>;
  lastLessonId?: { moduleId: string; lessonId: string } | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  python: Terminal,
  sql: Database,
  spark: Zap,
  kafka: Layers,
  airflow: Wind,
  devops: Box,
  data_architecture: Cpu,
  dbt: GitBranch,
};

const MODULE_DESCRIPTIONS: Record<string, { az: string; en: string }> = {
  python: {
    az: 'Data mühəndisliyi üçün Python: yaddaş idarəetməsi, generatorlar, dunder metodlar və sürətli emal.',
    en: 'Python for Data Engineering: memory management, generators, dunder methods, and high-performance processing.'
  },
  sql: {
    az: 'Mürəkkəb analitik sorğular, Window Functions, sorğu optimizatorunun daxili işi və indeksləmə.',
    en: 'Advanced analytical queries, Window Functions, query optimizer internals, and indexing strategies.'
  },
  spark: {
    az: 'Böyük həcmli paylanmış emal: Catalyst Optimizer, Tungsten Engine, RDD vs DataFrame və Shuffle tuning.',
    en: 'Distributed big data computing: Catalyst Optimizer, Tungsten Engine, memory management, and shuffle tuning.'
  },
  kafka: {
    az: 'Real-time axın arxitekturası: KRaft konsensusu, append-only partisiyalar, ISR replikasiyası və Consumer Groups.',
    en: 'Real-time event streaming: KRaft consensus, append-only partitions, ISR replication, and consumer group rebalancing.'
  },
  airflow: {
    az: 'İş axınlarının orkestrasiyası: DAG arxitekturası, TaskInstance həyat dövrü, sensorlar və Worker icrası.',
    en: 'Workflow orchestration: DAG lifecycle, scheduling engine, sensors, and distributed worker execution.'
  },
  devops: {
    az: 'İnfrastruktur əsasları: Docker konteynerləşdirmə, Linux kernel nüansları, Bash skriptləri və CI/CD boruları.',
    en: 'Infrastructure fundamentals: Docker containerization, Linux internals, Bash scripting, and CI/CD pipelines.'
  },
  data_architecture: {
    az: 'Müasir DWH və Lakehouse: Kimball Ulduz Sxemi, Medallion (Bronze/Silver/Gold) və Parquet/Delta saxlanması.',
    en: 'Modern DWH and Lakehouse: Kimball Star Schema, Medallion Architecture, and Parquet/Delta storage layers.'
  },
  dbt: {
    az: 'Modern Data Stack daxilində ELT transformasiyası: Jinja makroları, Data Quality test qapıları və Snapshots (SCD-2).',
    en: 'ELT transformation in the Modern Data Stack: Jinja macros, automated data quality tests, and SCD-2 snapshots.'
  }
};

export function HomeHub({ modules, moduleLessons, lastLessonId, onSelectLesson }: HomeHubProps) {
  const { language, t } = useLanguage();
  const isAz = language === 'az';

  const totalLessons = Object.values(moduleLessons).reduce((acc, curr) => acc + curr.length, 0);

  const handleStartOrResume = () => {
    if (lastLessonId) {
      onSelectLesson(lastLessonId.moduleId, lastLessonId.lessonId);
      return;
    }
    const firstMod = modules[0];
    if (firstMod) {
      const lessons = moduleLessons[firstMod.id];
      if (lessons && lessons.length > 0) {
        onSelectLesson(firstMod.id, lessons[0].id);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100/80 px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
          <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>{isAz ? 'Data Mühəndisliyi Standartı · 2026' : 'Data Engineering Standard · 2026'}</span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl md:text-5xl">
          {isAz ? 'Data Mühəndisliyi Bilik Bazası' : 'Data Engineering Knowledge Base'}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {isAz
            ? 'Bünövrə Python və SQL prinsiplərindən başlayaraq paylanmış sistemlər (Spark, Kafka), orkestrasiya (Airflow) və müasir analitik modelləşdirməyə (dbt, Lakehouse) qədər tam, sistemli və dərinləşdirilmiş mühəndislik arxivi.'
            : 'From fundamental Python & SQL internals to distributed computing (Spark, Kafka), workflow orchestration (Airflow), and modern data modeling (dbt, Lakehouse).'}
        </p>

        {/* Primary CTA & Quick Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartOrResume}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            <span>{lastLessonId ? (isAz ? 'Qaldığın Dərsi Davam Et' : 'Resume Last Lesson') : (isAz ? 'Dərslərə Başla' : 'Start Learning')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#modules-section"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 dark:hover:text-zinc-100"
          >
            <FolderTree className="h-4 w-4 text-zinc-500" />
            <span>{isAz ? 'Bütün 8 Modula Bax' : 'Explore All 8 Modules'}</span>
          </a>
        </div>
      </div>

      {/* 2. Platform Stats Bar */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">8</div>
          <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {isAz ? 'Əsas Modul' : 'Core Modules'}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalLessons || 87}</div>
          <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {isAz ? 'Dərin Nəzəri Dərs' : 'In-depth Lessons'}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">200+</div>
          <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {isAz ? 'Müsahibə Kartı' : 'Flashcards'}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-center dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">100%</div>
          <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {isAz ? 'İkidilli (AZ / EN)' : 'Bilingual (AZ / EN)'}
          </div>
        </div>
      </div>

      {/* 3. The Modern Data Stack Pipeline Overview Banner */}
      <div className="mt-14 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isAz ? 'Müasir Data Boru Kəməri (End-to-End Pipeline)' : 'Modern Data Pipeline Architecture'}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            Source ──► Ingest ──► Process ──► Store ──► Serve
          </span>
        </div>

        {/* Clean horizontal data engineering flow */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">01. Sources</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">OLTP & Logs</div>
            <div className="text-[11px] text-zinc-500">PostgreSQL, APIs</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400">02. Stream</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">Kafka</div>
            <div className="text-[11px] text-zinc-500">Topics & Offsets</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">03. Compute</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">Apache Spark</div>
            <div className="text-[11px] text-zinc-500">Distributed Engine</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">04. Lakehouse</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">DWH & Parquet</div>
            <div className="text-[11px] text-zinc-500">Bronze/Silver/Gold</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">05. Transform</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">dbt Core</div>
            <div className="text-[11px] text-zinc-500">SQL DAG & Tests</div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">06. Orchestrate</span>
            <div className="mt-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">Airflow</div>
            <div className="text-[11px] text-zinc-500">Automated DAGs</div>
          </div>
        </div>
      </div>

      {/* 4. All 8 Modules Grid */}
      <div id="modules-section" className="mt-16">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isAz ? 'Tədris Modulları' : 'Curriculum Modules'}
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {isAz ? 'Junior Data Engineer üçün tələb olunan 8 təməl sütun' : 'The 8 core pillars required for Data Engineering mastery'}
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {modules.length} {isAz ? 'Modul' : 'Modules'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((mod, idx) => {
            const Icon = MODULE_ICONS[mod.id] || Database;
            const desc = MODULE_DESCRIPTIONS[mod.id]?.[language] || '';
            const lessons = moduleLessons[mod.id] || [];

            return (
              <div
                key={mod.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/90 dark:bg-zinc-900/70 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[11px] font-bold text-zinc-400">
                          MODULE {idx < 9 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t(mod.title)}
                        </h3>
                      </div>
                    </div>

                    <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
                      {lessons.length} {isAz ? 'dərs' : 'lessons'}
                    </span>
                  </div>

                  <p className="mt-3.5 text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {desc}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/60">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {isAz ? 'Fərdi Nəzəriyyə & Kod' : 'Theory & Code Sandbox'}
                  </span>

                  <button
                    onClick={() => {
                      if (lessons.length > 0) {
                        onSelectLesson(mod.id, lessons[0].id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition"
                  >
                    <span>{isAz ? 'Dərsləri Aç' : 'Open Lessons'}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
