'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { LessonDetail } from '@/types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  Briefcase, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Save,
  FileText
} from 'lucide-react';
import { Markdown } from './Markdown';
import { CodeBlock } from './CodeBlock';
import { CodeSandbox } from './CodeSandbox';
import { AsciiDiagram } from './AsciiDiagram';
import { AnimatedInfographic, hasAnimatedInfographic } from './viz/registry';
import { TableOfContents } from './TableOfContents';
import { CodeLang } from '@/lib/highlight';

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

// Estimate read time based on word count
function estimateReadMinutes(...texts: (string | undefined)[]): number {
  const combined = texts.filter(Boolean).join(' ');
  const words = combined.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 150));
}

// Language detector for code block
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
  if (moduleId === 'airflow') return 'python';
  if (moduleId === 'spark') return 'python';
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

  // Personal notes state per lesson (stored in localStorage)
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dataeng_note_${lesson.id}`);
      setNoteText(saved || '');
    } catch {
      // Ignore storage errors
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

  const handleToggleComplete = () => {
    toggleLessonCompleted(lesson.id);
  };

  const isSQLModule = moduleId === 'sql';
  const isPythonModule = moduleId === 'python';
  const hasInteractiveSandbox = isSQLModule || isPythonModule || !!lesson.exercise;

  const readMinutes = useMemo(
    () => estimateReadMinutes(t(lesson.explanation), t(lesson.code_explanation), lesson.code || ''),
    [lesson, t]
  );

  const hasViz = hasAnimatedInfographic(moduleId, lesson.id);
  const codeLang = detectLanguage(lesson.code || '', moduleId);

  // Build Table of Contents items
  const tocItems = useMemo(() => {
    const items = [
      { id: 'sec-header', label: { az: 'Dərs Başlığı', en: 'Lesson Title' } },
    ];
    if (lesson.quick_recap) {
      items.push({ id: 'sec-tldr', label: { az: 'Qısa Xülasə (TL;DR)', en: 'Executive Summary' } });
    }
    if (hasViz || lesson.infographic) {
      items.push({ id: 'sec-diagram', label: { az: 'Arxitektura Sxemi', en: 'Architecture Diagram' } });
    }
    if (lesson.explanation) {
      items.push({ id: 'sec-theory', label: { az: 'Əsas Nəzəriyyə', en: 'Core Theory' } });
    }
    if (lesson.code) {
      items.push({ id: 'sec-code', label: { az: 'Kod & Nümunə', en: 'Code & Example' } });
    }
    if (lesson.real_world_use || lesson.common_mistakes) {
      items.push({ id: 'sec-realworld', label: { az: 'Mühəndis Qaydaları', en: 'Best Practices' } });
    }
    items.push({ id: 'sec-notes', label: { az: 'Mənim Qeydlərim', en: 'My Personal Notes' } });
    return items;
  }, [lesson, hasViz]);

  return (
    <div className="flex w-full justify-center">
      {/* Central Reading Column (constrained to optimal 740px measure) */}
      <div className="w-full max-w-[740px] px-4 py-8 sm:px-6 lg:px-8">
        {/* 1. Header & Breadcrumb */}
        <div id="sec-header" className="border-b border-zinc-200/90 pb-5 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{moduleTitle}</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-mono text-zinc-500">
                {isAz ? 'Dərs' : 'Lesson'} {lesson.order < 10 ? `0${lesson.order}` : lesson.order}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="inline-flex items-center gap-1 font-normal text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                {readMinutes} {isAz ? 'dəq oxu' : 'min read'}
              </span>
            </div>

            {/* Read status button */}
            <button
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                completed
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isAz ? 'Oxundu' : 'Marked as Read'}</span>
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{isAz ? 'Oxunub kimi qeyd et' : 'Mark as Read'}</span>
                </>
              )}
            </button>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {t(lesson.title)}
          </h1>
        </div>

        {/* 2. Executive Summary TL;DR (Quiet, high-contrast callout) */}
        {lesson.quick_recap && (
          <div id="sec-tldr" className="mt-6 rounded-xl border-l-4 border-blue-600 bg-zinc-50 p-4.5 dark:bg-zinc-900/60 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-blue-100 p-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {isAz ? 'Qısa Xülasə (TL;DR)' : 'Key Takeaway (TL;DR)'}
                </span>
                <div className="mt-1">
                  <Markdown source={t(lesson.quick_recap)} idScope="recap-" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Infographic / Architecture Diagram */}
        <div id="sec-diagram" className="mt-8">
          {hasViz ? (
            <div className="space-y-3">
              <AnimatedInfographic moduleId={moduleId} lessonId={lesson.id} />
              {lesson.infographic && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRawAscii((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-mono transition"
                  >
                    <FileText className="h-3.5 w-3.5" />
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
        </div>

        {/* 4. Core Theory & Real-Life Analogy */}
        {lesson.explanation && (
          <div id="sec-theory" className="mt-10 border-t border-zinc-200/80 pt-8 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {isAz ? 'Əsas Nəzəriyyə və İşləmə Prinsipi' : 'Core Theory & Mechanics'}
            </h2>
            <div className="mt-4">
              <Markdown 
                source={t(lesson.explanation)} 
                idScope="expl-" 
                className="text-[15px] sm:text-[16px] leading-[1.75] text-zinc-700 dark:text-zinc-300"
              />
            </div>
          </div>
        )}

        {/* 5. Code & Production Implementation */}
        {lesson.code && (
          <div id="sec-code" className="mt-10 border-t border-zinc-200/80 pt-8 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {isAz ? 'İstehsalat Kodu və Tətbiqi' : 'Production Implementation'}
            </h2>

            {lesson.code_explanation && (
              <div className="mt-3">
                <Markdown 
                  source={t(lesson.code_explanation)} 
                  idScope="code-expl-" 
                  className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
                />
              </div>
            )}

            <div className="mt-4">
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
            </div>
          </div>
        )}

        {/* 6. Production Tips & Pitfalls */}
        {(lesson.real_world_use || lesson.common_mistakes) && (
          <div id="sec-realworld" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-zinc-200/80 pt-8 dark:border-zinc-800">
            {lesson.real_world_use && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  <Briefcase className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  <span>{isAz ? 'İstehsalat Təcrübəsi' : 'Production Pattern'}</span>
                </div>
                <div className="mt-2.5">
                  <Markdown source={t(lesson.real_world_use)} idScope="rw-" className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed" />
                </div>
              </div>
            )}

            {lesson.common_mistakes && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{isAz ? 'Tez-tez Edilən Xətalar' : 'Common Pitfalls'}</span>
                </div>
                <div className="mt-2.5">
                  <Markdown source={t(lesson.common_mistakes)} idScope="cm-" className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Personal Notes Scratchpad */}
        <div id="sec-notes" className="mt-12 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              <Edit3 className="h-4 w-4 text-zinc-500" />
              <span>{isAz ? 'Mənim Dərs Qeydlərim (Konspekt)' : 'My Lesson Notes'}</span>
            </div>
            {noteSaved && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                {isAz ? 'Yadda saxlanıldı!' : 'Saved!'}
              </span>
            )}
          </div>

          <p className="mt-2.5 text-xs text-zinc-500">
            {isAz 
              ? 'Öz sözlərinizlə dərsin ən vacib məqamlarını buraya qeyd edin. Qeydlər yalnız sizin brauzerinizdə yadda saxlanılır.'
              : 'Write personal insights in your own words. Persisted automatically in your local browser.'}
          </p>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={isAz ? 'Məs: Spark-da shuffle partition sayını tənzimləmək üçün spark.sql.shuffle.partitions parametrinə baxmalıyam...' : 'Take notes here...'}
            rows={4}
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:placeholder-zinc-600 transition"
          />

          <div className="mt-2.5 flex justify-end">
            <button
              onClick={handleSaveNote}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <Save className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isAz ? 'Qeydi Yadda Saxla' : 'Save Note'}</span>
            </button>
          </div>
        </div>

        {/* 8. Bottom Prev / Next Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-200/90 pt-6 dark:border-zinc-800">
          {onPrevLesson && prevLessonTitle ? (
            <button
              onClick={onPrevLesson}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-left text-xs text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <ArrowLeft className="h-4 w-4 text-zinc-400" />
              <div className="min-w-0">
                <span className="block text-[10px] text-zinc-400 font-mono uppercase">{isAz ? 'Əvvəlki Dərs' : 'Previous'}</span>
                <span className="font-semibold truncate max-w-[160px] block">{prevLessonTitle}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {onNextLesson && nextLessonTitle && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-right text-xs text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="min-w-0">
                <span className="block text-[10px] text-zinc-400 font-mono uppercase">{isAz ? 'Növbəti Dərs' : 'Next'}</span>
                <span className="font-semibold truncate max-w-[160px] block text-blue-600 dark:text-blue-400">{nextLessonTitle}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Table of Contents */}
      <TableOfContents items={tocItems} />
    </div>
  );
}
