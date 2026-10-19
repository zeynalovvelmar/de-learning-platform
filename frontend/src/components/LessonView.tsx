'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { LessonDetail } from '@/types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Check,
  Maximize2,
  FileCode,
  Terminal,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { Markdown } from './Markdown';
import { CodeBlock } from './CodeBlock';
import { CodeSandbox } from './CodeSandbox';
import { AsciiDiagram } from './AsciiDiagram';
import { AnimatedInfographic, hasAnimatedInfographic } from './viz/registry';
import { TableOfContents } from './TableOfContents';
import { CodeLang } from '@/lib/highlight';
import { cn } from '@/lib/utils';

interface LessonViewProps {
  lesson: LessonDetail;
  moduleId: string;
  moduleTitle: string;
  onOpenFlashcards: () => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  prevLessonTitle?: string;
  nextLessonTitle?: string;
}

function estimateReadMinutes(...texts: (string | undefined)[]): number {
  const combined = texts.filter(Boolean).join(' ');
  const words = combined.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 150));
}

function detectLanguage(code: string, moduleId: string): CodeLang {
  if (moduleId === 'sql') return 'sql';
  if (moduleId === 'python') return 'python';
  if (moduleId === 'devops') {
    if (code.includes('FROM ') || code.includes('RUN ') || code.includes('COPY ')) return 'dockerfile';
    if (code.includes('services:') || code.includes('version:')) return 'yaml';
    return 'bash';
  }
  if (moduleId === 'dbt') {
    if (code.includes('version:') || code.includes('models:')) return 'yaml';
    return 'sql';
  }
  if (moduleId === 'airflow' || moduleId === 'spark') return 'python';
  if (moduleId === 'kafka') {
    if (code.includes('kafka-') || code.includes('bin/')) return 'bash';
    return 'python';
  }
  return 'python';
}

export function LessonView({
  lesson,
  moduleId,
  moduleTitle,
  onOpenFlashcards,
  onPrevLesson,
  onNextLesson,
  prevLessonTitle,
  nextLessonTitle
}: LessonViewProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, toggleLessonCompleted } = useProgress();
  const isAz = language === 'az';

  const completed = isLessonCompleted(lesson.id);
  const [showRawAscii, setShowRawAscii] = useState(false);
  const [diagramTab, setDiagramTab] = useState<'blueprint' | 'interactive'>('blueprint');

  // Personal notes state per lesson (stored in localStorage)
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dataeng_note_${lesson.id}`);
      setNoteText(saved || '');
    } catch {
      // Ignore
    }
  }, [lesson.id]);

  const handleSaveNote = () => {
    try {
      localStorage.setItem(`dataeng_note_${lesson.id}`, noteText);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleExportNote = () => {
    const blob = new Blob([noteText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_${lesson.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isSQLModule = moduleId === 'sql';
  const isPythonModule = moduleId === 'python';
  const hasInteractiveSandbox = isSQLModule || isPythonModule || !!lesson.exercise;

  const readMinutes = useMemo(
    () => estimateReadMinutes(t(lesson.explanation), t(lesson.code_explanation), lesson.code || ''),
    [lesson, t]
  );

  const hasViz = hasAnimatedInfographic(moduleId, lesson.id);
  const isMedallionLesson = moduleId === 'data_architecture' && lesson.id === '08-medallion-architecture-layers';
  const codeLang = detectLanguage(lesson.code || '', moduleId);

  // Build Table of Contents items
  const tocItems = useMemo(() => {
    const items = [
      { id: 'sec-header', label: { az: 'Dərs Başlığı', en: 'Lesson Title' } },
    ];
    if (lesson.quick_recap) {
      items.push({ id: 'sec-tldr', label: { az: 'Arxitektura TL;DR', en: 'Architecture TL;DR' } });
    }
    if (hasViz || isMedallionLesson || lesson.infographic) {
      items.push({ id: 'sec-diagram', label: { az: 'Arxitektura Sxemi', en: 'Architecture Blueprint' } });
    }
    if (lesson.explanation) {
      items.push({ id: 'sec-theory', label: { az: 'Əsas Nəzəriyyə', en: 'Core Theory & Mechanics' } });
    }
    if (lesson.code) {
      items.push({ id: 'sec-code', label: { az: 'İnteraktiv Sandbox & Kod', en: 'Interactive Code Sandbox' } });
    }
    if (lesson.real_world_use || lesson.common_mistakes) {
      items.push({ id: 'sec-rules', label: { az: 'İstehsalat Qaydaları', en: 'Production Rules & Gotchas' } });
    }
    items.push({ id: 'sec-notes', label: { az: 'Tələbə Konspekti', en: 'Technical Scratchpad' } });
    return items;
  }, [lesson, hasViz, isMedallionLesson]);

  return (
    <div className="flex w-full justify-center">
      {/* Central Reading Column (constrained to 780px, max 65-75 chars per line) */}
      <main className="w-full max-w-[800px] px-4 sm:px-8 lg:px-12 py-8 flex flex-col gap-8 font-sans">
        
        {/* 1. Header & Breadcrumb Bar */}
        <div id="sec-header" className="space-y-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted">
              <span className="font-semibold text-ink">{moduleTitle}</span>
              <span>/</span>
              <span className="text-primary font-bold">
                {isAz ? 'Dərs' : 'Lesson'} {String(lesson.order).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] bg-secondary/15 text-secondary border border-secondary/30 font-bold">
                Verified v2.4
              </span>
              <span className="text-muted text-[11px] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{readMinutes} {isAz ? 'dəq oxu' : 'min read'}</span>
              </span>
              <button
                onClick={() => toggleLessonCompleted(lesson.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition cursor-pointer',
                  completed 
                    ? 'border-secondary bg-secondary/15 text-secondary' 
                    : 'border-line bg-surface-low text-muted hover:text-ink'
                )}
              >
                {completed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                    <span>{isAz ? 'Oxundu' : 'Completed'}</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    <span>{isAz ? 'Oxundu kimi qeyd et' : 'Mark as Read'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink leading-tight">
            {t(lesson.title)}
          </h1>
        </div>

        {/* 2. Architecture TL;DR & Design Invariants Card */}
        {lesson.quick_recap && (
          <section id="sec-tldr" className="rounded-xl bg-surface-low border border-line p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{isAz ? 'ARXİTEKTURA TL;DR & DİZAYN QAYDALARI' : 'ARCHITECTURE TL;DR & DESIGN INVARIANTS'}</span>
              </div>
              <span className="font-mono text-[10px] text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line">
                SPEC-{String(lesson.order).padStart(4, '0')}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              <Markdown source={t(lesson.quick_recap)} idScope="tldr-" />
            </div>

            {/* Performance Trade-Offs Specs Bar */}
            <div className="pt-3 border-t border-line/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center font-mono text-[11px]">
              <div className="bg-surface p-2 rounded-lg border border-line">
                <div className="text-muted text-[10px] uppercase">Gecikmə (Latency)</div>
                <div className="text-ink font-semibold mt-0.5">Sub-second / Stream</div>
              </div>
              <div className="bg-surface p-2 rounded-lg border border-line">
                <div className="text-muted text-[10px] uppercase">Saxlanc Formatı</div>
                <div className="text-ink font-semibold mt-0.5">Parquet + Snappy</div>
              </div>
              <div className="bg-surface p-2 rounded-lg border border-line">
                <div className="text-muted text-[10px] uppercase">Read SLA</div>
                <div className="text-secondary font-bold mt-0.5">&lt; 150ms p95</div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Embedded Architecture Blueprint Frame */}
        <section id="sec-diagram" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
            <span className="font-mono text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{isAz ? 'Lakehouse Arxitektura Sxemi' : 'Architecture Blueprint'}</span>
            </span>

            {/* View tabs if Medallion or has both */}
            {isMedallionLesson && (
              <div className="inline-flex p-0.5 bg-surface-2 border border-line rounded-lg text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setDiagramTab('blueprint')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition cursor-pointer',
                    diagramTab === 'blueprint' 
                      ? 'bg-surface text-ink font-bold shadow-2xs' 
                      : 'text-muted hover:text-ink'
                  )}
                >
                  Blueprint View
                </button>
                <button
                  type="button"
                  onClick={() => setDiagramTab('interactive')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition cursor-pointer',
                    diagramTab === 'interactive' 
                      ? 'bg-surface text-ink font-bold shadow-2xs' 
                      : 'text-muted hover:text-ink'
                  )}
                >
                  Interactive Tiers
                </button>
              </div>
            )}
          </div>

          {/* Diagram Container */}
          {isMedallionLesson && diagramTab === 'blueprint' ? (
            <div className="rounded-xl border border-line bg-surface-lowest overflow-hidden shadow-xs">
              <div className="w-full flex items-center justify-center p-3 sm:p-4 bg-[#090a0f]">
                <Image
                  src="/stitch/medallion_architecture.png"
                  alt="Medallion Storage Architecture Data Lakehouse Pattern"
                  width={1024}
                  height={560}
                  className="w-full h-auto object-contain rounded-lg max-h-[460px]"
                  priority
                />
              </div>
              <div className="px-4 py-2.5 bg-surface-low border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                  <span>ByteByteGo & AWS Reference Pattern: Delta Lake transactional layers with Spark / dbt.</span>
                </div>
              </div>
            </div>
          ) : hasViz ? (
            <div className="space-y-3">
              <AnimatedInfographic moduleId={moduleId} lessonId={lesson.id} />
              {lesson.infographic && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRawAscii((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-mono transition"
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>
                      {showRawAscii
                        ? (isAz ? 'ASCII Diaqramı Gizlət' : 'Hide ASCII Blueprint')
                        : (isAz ? 'ASCII Sxeminə Bax' : 'View ASCII Blueprint')}
                    </span>
                  </button>
                </div>
              )}
              {showRawAscii && lesson.infographic && (
                <AsciiDiagram
                  diagramText={t(lesson.infographic)}
                  title={isAz ? 'ARXİTEKTURA SXEMİ (ASCII)' : 'ARCHITECTURE DIAGRAM (ASCII)'}
                />
              )}
            </div>
          ) : lesson.infographic ? (
            <AsciiDiagram
              diagramText={t(lesson.infographic)}
              title={isAz ? 'ARXİTEKTURA SXEMİ' : 'ARCHITECTURE DIAGRAM'}
            />
          ) : null}
        </section>

        {/* 4. Core Theory & Mechanics */}
        {lesson.explanation && (
          <article id="sec-theory" className="space-y-4 border-t border-line pt-6">
            <h2 className="text-xl font-bold text-ink tracking-tight font-sans">
              {isAz ? 'Əsas Nəzəriyyə və İşləmə Mexanizmi' : 'Core Theory & Mechanics'}
            </h2>
            <div className="text-sm sm:text-[15px] leading-[1.75] text-ink-2 font-sans space-y-4">
              <Markdown source={t(lesson.explanation)} idScope="expl-" />
            </div>
          </article>
        )}

        {/* 5. Production Rule Callout (Amber) */}
        {lesson.real_world_use && (
          <div id="sec-rules" className="rounded-xl p-4 bg-tertiary/10 border border-tertiary/30 border-l-[3.5px] border-l-tertiary text-xs sm:text-sm space-y-1.5">
            <div className="flex items-center gap-2 font-bold font-mono text-tertiary">
              <Briefcase className="h-4 w-4" />
              <span>{isAz ? 'İSTEHSALAT TƏCRÜBƏSİ & QAYDA' : 'PRODUCTION RULE & BEST PRACTICE'}</span>
            </div>
            <div className="text-ink-2 leading-relaxed">
              <Markdown source={t(lesson.real_world_use)} idScope="rw-" />
            </div>
          </div>
        )}

        {/* 6. Gotcha / Pitfall Callout (Indigo) */}
        {lesson.common_mistakes && (
          <div className="rounded-xl p-4 bg-primary/10 border border-primary/30 border-l-[3.5px] border-l-primary text-xs sm:text-sm space-y-1.5">
            <div className="flex items-center gap-2 font-bold font-mono text-primary">
              <AlertTriangle className="h-4 w-4" />
              <span>{isAz ? 'DİQQƏT: TEZ-TEZ EDİLƏN XƏTALAR (GOTCHA)' : 'GOTCHA: COMMON MISTAKES'}</span>
            </div>
            <div className="text-ink-2 leading-relaxed">
              <Markdown source={t(lesson.common_mistakes)} idScope="cm-" />
            </div>
          </div>
        )}

        {/* 7. Interactive Kernel Sandbox (Monaco Look from Stitch) */}
        {lesson.code && (
          <section id="sec-code" className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-mono text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>{isAz ? 'İnteraktiv Kod Mühiti & İcra' : 'Interactive Code Sandbox'}</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                <span>Kernel:</span>
                <span className="text-primary font-bold">
                  {isSQLModule ? 'SQLite WASM' : isPythonModule ? 'Pyodide Python' : 'Native DE Engine'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
              </div>
            </div>

            {hasInteractiveSandbox ? (
              <CodeSandbox
                moduleId={moduleId}
                lessonId={lesson.id}
                exercise={lesson.exercise}
                defaultCode={lesson.code}
                sandboxType={isSQLModule ? 'sql' : 'python'}
              />
            ) : (
              <CodeBlock 
                code={lesson.code} 
                lang={codeLang} 
                title={isAz ? 'İstehsalat Kodu' : 'Production Code'}
              />
            )}

            {lesson.code_explanation && (
              <div className="text-xs text-muted leading-relaxed font-sans mt-2">
                <Markdown source={t(lesson.code_explanation)} idScope="code-expl-" />
              </div>
            )}
          </section>
        )}

        {/* 8. Student Technical Scratchpad (Personal Notes) */}
        <section id="sec-notes" className="rounded-xl border border-line bg-surface-low p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-line">
            <div className="flex items-center gap-2 font-sans font-bold text-xs text-ink">
              <FileCode className="h-4 w-4 text-primary" />
              <span>{isAz ? 'Tələbə Mühəndislik Konspekti (Fərdi Qeydlər)' : 'Student Technical Scratchpad'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-muted">
              {noteSaved ? (
                <span className="flex items-center gap-1 text-secondary font-bold">
                  <Check className="h-3.5 w-3.5" />
                  <span>{isAz ? 'Yadda saxlanıldı!' : 'Auto-saved locally'}</span>
                </span>
              ) : (
                <span className="text-[11px] text-muted">
                  {isAz ? 'Lokal saxlanılır' : 'Auto-saved locally'}
                </span>
              )}
              <button
                onClick={handleExportNote}
                className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                title="Download notes as markdown"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-muted">
            {isAz 
              ? 'Dərsin ən mühüm arxitektura qeydlərini öz sözlərinizlə yazın. Brauzerinizdə qalıcı olaraq saxlanılır.' 
              : 'Write down key technical takeaways in your own words. Persisted automatically in your browser.'}
          </p>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={isAz ? 'Məs: Bronze qatında həmişə append-only işlənməlidir, heç bir sütun silinməməlidir...' : 'Take notes here...'}
            rows={4}
            className="w-full rounded-lg border border-line bg-surface-lowest p-3 font-mono text-xs text-ink placeholder-muted focus:border-primary focus:outline-none transition leading-relaxed"
          />

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveNote}
              className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Save className="h-3.5 w-3.5 text-muted" />
              <span>{isAz ? 'Qeydi Yadda Saxla' : 'Save Note'}</span>
            </button>
          </div>
        </section>

        {/* 9. Bottom Prev / Next Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-line pt-6">
          {onPrevLesson && prevLessonTitle ? (
            <button
              onClick={onPrevLesson}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-low px-4 py-2.5 text-left text-xs text-ink hover:border-outline hover:bg-surface transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4 text-muted" />
              <div className="min-w-0">
                <span className="block text-[10px] text-muted font-mono uppercase">{isAz ? 'Əvvəlki Dərs' : 'Previous'}</span>
                <span className="font-semibold truncate max-w-[170px] block">{prevLessonTitle}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {onNextLesson && nextLessonTitle && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-surface-low px-4 py-2.5 text-right text-xs text-ink hover:border-primary hover:bg-surface transition cursor-pointer shadow-2xs"
            >
              <div className="min-w-0">
                <span className="block text-[10px] text-muted font-mono uppercase">{isAz ? 'Növbəti Dərs' : 'Next'}</span>
                <span className="font-semibold truncate max-w-[170px] block text-primary">{nextLessonTitle}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      </main>

      {/* Right Sticky Table of Contents */}
      <TableOfContents items={tocItems} progressPercent={completed ? 100 : 65} />
    </div>
  );
}
