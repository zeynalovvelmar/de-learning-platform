'use client';

import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { LessonDetail, LessonSummary } from '@/types';
import { CodeSandbox } from './CodeSandbox';
import { Markdown } from './Markdown';
import { CodeBlock } from './CodeBlock';
import { AsciiDiagram } from './AsciiDiagram';
import { hasAnimatedInfographic, AnimatedInfographic } from './viz/registry';
import { detectLanguage } from '@/lib/highlight';
import { estimateReadMinutes } from '@/lib/markdown';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Briefcase, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Terminal,
  Code,
  BookCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonViewProps {
  moduleId: string;
  moduleTitle: string;
  lesson: LessonDetail;
  lessonsList: LessonSummary[];
  onSelectLesson: (lessonId: string) => void;
  onOpenFlashcards: () => void;
}

export function LessonView({
  moduleId,
  moduleTitle,
  lesson,
  lessonsList,
  onSelectLesson,
  onOpenFlashcards,
}: LessonViewProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, toggleLessonCompleted } = useProgress();
  const [showInterviewAnswer, setShowInterviewAnswer] = useState(false);
  const [showRawAscii, setShowRawAscii] = useState(false);

  const completed = isLessonCompleted(lesson.id);

  // Find previous and next lessons
  const currentIndex = lessonsList.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessonsList[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsList.length - 1 ? lessonsList[currentIndex + 1] : null;

  const handleToggleComplete = () => {
    if (!completed) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    toggleLessonCompleted(lesson.id);
  };

  // Determine sandbox type
  const isSQLModule = moduleId === 'sql';
  const isPythonModule = moduleId === 'python';
  const hasInteractiveSandbox = isSQLModule || isPythonModule || !!lesson.exercise;

  // Level badge styling
  const levelText = (lesson.level || 'junior').toLowerCase();
  const levelBadge = () => {
    if (levelText.includes('senior') || levelText.includes('advanced')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
          Senior DE
        </span>
      );
    }
    if (levelText.includes('mid') || levelText.includes('intermediate')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          Mid DE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
        Junior DE
      </span>
    );
  };

  // Estimated read time
  const readMinutes = useMemo(
    () => estimateReadMinutes(t(lesson.explanation), t(lesson.code_explanation), lesson.code || ''),
    [lesson, t]
  );

  // Check if lesson has a custom interactive animated infographic
  const hasViz = hasAnimatedInfographic(moduleId, lesson.id);
  const codeLang = detectLanguage(lesson.code || '', moduleId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-accent">{moduleTitle}</span>
            <span className="text-muted">•</span>
            <span className="text-ink-2">
              {language === 'az' ? 'Dərs' : 'Lesson'} {lesson.order < 10 ? `0${lesson.order}` : lesson.order}
            </span>
            <span>{levelBadge()}</span>
            <span className="text-muted">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
              <Clock className="h-3.5 w-3.5" />
              {readMinutes} {language === 'az' ? 'dəq oxu' : 'min read'}
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            {t(lesson.title)}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {lesson.flashcards && lesson.flashcards.length > 0 && (
            <button
              onClick={onOpenFlashcards}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/80 px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-xs transition hover:bg-purple-100 hover:shadow-sm dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <BookOpen className="h-4 w-4" />
              <span>{lesson.flashcards.length} {language === 'az' ? 'Flashcard' : 'Cards'}</span>
            </button>
          )}

          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition ${
              completed
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === 'az' ? 'Tamamlandı' : 'Completed'}</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                <span>{language === 'az' ? 'Tamamla (+50 XP)' : 'Mark Done (+50 XP)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Recap TL;DR Executive Banner */}
      {lesson.quick_recap && (
        <div className="mt-6 relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-cyan-50/60 p-4.5 shadow-xs dark:border-indigo-900/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-cyan-950/20">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                {language === 'az' ? 'Qısa İcmal (TL;DR)' : 'Executive Summary (TL;DR)'}
              </span>
              <div className="mt-1">
                <Markdown source={t(lesson.quick_recap)} idScope="recap-" className="text-xs sm:text-sm text-ink-2 font-medium" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Infographics: Interactive Animated Visual OR Polished ASCII Architecture Diagram */}
      {hasViz ? (
        <div className="mt-6 space-y-3">
          <AnimatedInfographic moduleId={moduleId} lessonId={lesson.id} />
          {lesson.infographic && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRawAscii((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent font-mono transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>
                  {showRawAscii
                    ? (language === 'az' ? 'ASCII Diaqramı Gizlət' : 'Hide ASCII Blueprint')
                    : (language === 'az' ? 'ASCII Diaqrama Bax' : 'View ASCII Blueprint')}
                </span>
              </button>
            </div>
          )}
          {showRawAscii && lesson.infographic && (
            <AsciiDiagram
              diagramText={t(lesson.infographic)}
              title={language === 'az' ? 'ARXİTEKTURA & AXIN DİAQRAMI (RAW BLUEPRINT)' : 'ARCHITECTURE & FLOW DIAGRAM (RAW BLUEPRINT)'}
            />
          )}
        </div>
      ) : lesson.infographic ? (
        <AsciiDiagram
          diagramText={t(lesson.infographic)}
          title={language === 'az' ? 'ARXİTEKTURA & AXIN DİAQRAMI' : 'ARCHITECTURE & FLOW DIAGRAM'}
        />
      ) : null}

      {/* Quick Highlights: Real World & Common Pitfalls */}
      {(lesson.real_world_use || lesson.common_mistakes || lesson.what_it_does) && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lesson.real_world_use && (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4.5 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Briefcase className="h-4 w-4" />
                <span>{language === 'az' ? 'Real İstehsalat Tətbiqi' : 'Real-World Production Use'}</span>
              </div>
              <div className="mt-2 text-xs sm:text-sm">
                <Markdown source={t(lesson.real_world_use)} idScope="rw-" />
              </div>
            </div>
          )}

          {lesson.common_mistakes && (
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4.5 dark:border-rose-950/60 dark:bg-rose-950/20 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{language === 'az' ? 'Tez-tez Edilən Xətalar (Tələlər)' : 'Common Pitfalls & Traps'}</span>
              </div>
              <div className="mt-2 text-xs sm:text-sm">
                <Markdown source={t(lesson.common_mistakes)} idScope="pit-" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deep-Dive Theory Explanation (Rendered via Markdown with Section Badges & Syntax Highlighting) */}
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-line pb-3.5">
          <BookCheck className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold text-ink">
            {language === 'az' ? 'Dərin Nəzəriyyə və Əsas Prinsiplər' : 'Deep-Dive Concepts & Principles'}
          </h2>
        </div>
        <div className="mt-4">
          <Markdown source={t(lesson.explanation)} lead idScope="expl-" />
        </div>
      </div>

      {/* Production Code Example (Syntax-Highlighted with Dual Themes, Copy & Line Wrap) */}
      {lesson.code && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
              {language === 'az' ? 'İstehsalat Kodu Nümunəsi' : 'Production Code Example'}
            </h3>
          </div>

          <CodeBlock
            code={lesson.code}
            lang={codeLang}
            title={`${moduleId}/${lesson.id}`}
            lineNumbers
          />

          {lesson.code_explanation && (
            <div className="mt-3 rounded-xl border border-line bg-surface-2/60 p-4 text-xs text-ink-2">
              <Markdown source={t(lesson.code_explanation)} idScope="codeexp-" />
            </div>
          )}
        </div>
      )}

      {/* Visual Output Block (if provided) */}
      {lesson.visual_output && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4.5 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>{language === 'az' ? 'İcra Nəticəsi və Müqayisə (Output)' : 'Output / Benchmark Result'}</span>
          </div>
          <pre className="mt-3 overflow-x-auto font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {lesson.visual_output}
          </pre>
        </div>
      )}

      {/* Interactive Code Sandbox / Hands-on Exercise */}
      {hasInteractiveSandbox && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white shadow-sm shadow-accent/20">
              <Code className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-ink">
              {language === 'az' ? 'İnteraktiv Təcrübə (Sandbox)' : 'Interactive Code Sandbox'}
            </h2>
          </div>
          <CodeSandbox
            moduleId={moduleId}
            lessonId={lesson.id}
            exercise={lesson.exercise}
            defaultCode={lesson.code}
            sandboxType={isSQLModule ? 'sql' : 'python'}
          />
        </div>
      )}

      {/* Senior DE Interview Q&A */}
      {lesson.interview_question && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-5 shadow-xs dark:border-indigo-950 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="h-4 w-4" />
              <span>{language === 'az' ? 'Müsahibə Sualı (Senior Data Engineer)' : 'Interview Question (Senior DE)'}</span>
            </div>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              FAANG / Tier-1
            </span>
          </div>

          <div className="mt-3 text-base font-bold text-ink">
            <Markdown source={t(lesson.interview_question.question)} idScope="iq-" />
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowInterviewAnswer(!showInterviewAnswer)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-xs hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-zinc-800 dark:text-indigo-300 dark:hover:bg-zinc-700 transition"
            >
              {showInterviewAnswer ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>{language === 'az' ? 'Cavabı Gizlət' : 'Hide Answer'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>{language === 'az' ? 'İdeal Cavabı Göstər' : 'Show Model Answer'}</span>
                </>
              )}
            </button>

            {showInterviewAnswer && (
              <div className="mt-4 space-y-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60">
                <div className="text-xs sm:text-sm leading-relaxed text-ink-2">
                  <Markdown source={t(lesson.interview_question.answer)} idScope="ia-" />
                </div>

                {lesson.interview_question.interviewer_tips && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-950 dark:border-indigo-900/80 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <span className="font-bold">
                      💡 {language === 'az' ? 'Müsahibəçi Qiymətləndirmə Meyarı:' : 'Interviewer Evaluation Rubric:'}
                    </span>{' '}
                    <div className="mt-1">
                      <Markdown source={t(lesson.interview_question.interviewer_tips)} idScope="itips-" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation: Previous & Next Lesson */}
      <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
        {prevLesson ? (
          <button
            onClick={() => onSelectLesson(prevLesson.id)}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink-2 shadow-xs hover:bg-surface-2 transition"
          >
            <ChevronLeft className="h-4 w-4 text-muted" />
            <div className="text-left">
              <span className="block text-[10px] font-medium text-muted uppercase tracking-wider">
                {language === 'az' ? 'Əvvəlki Dərs' : 'Previous'}
              </span>
              <span className="truncate max-w-[140px] sm:max-w-[220px] block font-bold text-ink">
                {t(prevLesson.title)}
              </span>
            </div>
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => onSelectLesson(nextLesson.id)}
            className="flex items-center gap-2.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-accent/20 hover:opacity-90 transition"
          >
            <div className="text-right">
              <span className="block text-[10px] font-medium text-white/80 uppercase tracking-wider">
                {language === 'az' ? 'Növbəti Dərs' : 'Next'}
              </span>
              <span className="truncate max-w-[140px] sm:max-w-[220px] block font-bold text-white">
                {t(nextLesson.title)}
              </span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
