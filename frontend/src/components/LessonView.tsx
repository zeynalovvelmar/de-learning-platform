'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { LessonDetail, LessonSummary } from '@/types';
import { CodeSandbox } from './CodeSandbox';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Copy, 
  Check, 
  Briefcase, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Terminal,
  Code
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
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInterviewAnswer, setShowInterviewAnswer] = useState(false);

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

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine sandbox type
  const isSQLModule = moduleId === 'sql';
  const isPythonModule = moduleId === 'python';
  const hasInteractiveSandbox = isSQLModule || isPythonModule || !!lesson.exercise;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>{moduleTitle}</span>
            <span>•</span>
            <span>{language === 'az' ? 'Dərs' : 'Lesson'} {lesson.order < 10 ? `0${lesson.order}` : lesson.order}</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t(lesson.title)}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {lesson.flashcards && lesson.flashcards.length > 0 && (
            <button
              onClick={onOpenFlashcards}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 transition"
            >
              <BookOpen className="h-4 w-4" />
              <span>{lesson.flashcards.length} {language === 'az' ? 'Flashcard' : 'Flashcards'}</span>
            </button>
          )}

          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              completed
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-500'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
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

      {/* Infographic / Architecture ASCII Diagram */}
      {lesson.infographic && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-900 p-4 text-zinc-100 shadow-md dark:border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5 text-xs font-mono font-semibold text-zinc-400">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>{language === 'az' ? 'Arxitektura & Axın Diaqramı' : 'Architecture & Flow Diagram'}</span>
          </div>
          <pre className="mt-3 overflow-x-auto font-mono text-[11px] sm:text-xs leading-relaxed text-cyan-200">
            {t(lesson.infographic)}
          </pre>
        </div>
      )}

      {/* Quick Summary Highlights: Real World & Common Pitfalls */}
      {(lesson.what_it_does || lesson.real_world_use || lesson.common_mistakes) && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lesson.real_world_use && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Briefcase className="h-4 w-4" />
                <span>{language === 'az' ? 'Real İstehsalat Tətbiqi' : 'Real-World Production Use'}</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {t(lesson.real_world_use)}
              </p>
            </div>
          )}

          {lesson.common_mistakes && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-950 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>{language === 'az' ? 'Tez-tez Edilən Xətalar' : 'Common Pitfalls'}</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                {t(lesson.common_mistakes)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deep-Dive Theory Explanation */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          {language === 'az' ? 'Nəzəriyyə və Əsas Prinsiplər' : 'Deep-Dive Concepts'}
        </h2>
        <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-3 whitespace-pre-wrap">
          {t(lesson.explanation)}
        </div>
      </div>

      {/* Production Code Example */}
      {lesson.code && (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-950 overflow-hidden shadow-sm dark:border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
            <span className="text-xs font-mono font-medium text-zinc-400">
              {language === 'az' ? 'İstehsalat Kodu Nümunəsi' : 'Production Code Example'}
            </span>
            <button
              onClick={() => handleCopyCode(lesson.code || '')}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? (language === 'az' ? 'Kopyalandı' : 'Copied') : (language === 'az' ? 'Kopyala' : 'Copy')}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-100">
            {lesson.code}
          </pre>
          {lesson.code_explanation && (
            <div className="border-t border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-300 whitespace-pre-wrap">
              {t(lesson.code_explanation)}
            </div>
          )}
        </div>
      )}

      {/* Visual Output Block (if provided) */}
      {lesson.visual_output && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-900/90 p-4 dark:border-zinc-800">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            {language === 'az' ? 'İcra Nəticəsi və Müqayisə' : 'Output / Benchmark Result'}
          </span>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-zinc-200 whitespace-pre-wrap">
            {lesson.visual_output}
          </pre>
        </div>
      )}

      {/* Interactive Code Sandbox / Hands-on Exercise */}
      {hasInteractiveSandbox && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            <span>{language === 'az' ? 'İnteraktiv Təcrübə (Sandbox)' : 'Interactive Code Sandbox'}</span>
          </h2>
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
        <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-5 dark:border-indigo-950 dark:from-indigo-950/20 dark:to-purple-950/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="h-4 w-4" />
            <span>{language === 'az' ? 'Müsahibə Sualı (Senior Data Engineer)' : 'Interview Question (Senior DE)'}</span>
          </div>

          <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t(lesson.interview_question.question)}
          </h3>

          <div className="mt-3">
            <button
              onClick={() => setShowInterviewAnswer(!showInterviewAnswer)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
            >
              {showInterviewAnswer
                ? (language === 'az' ? '▲ Cavabı Gizlət' : '▲ Hide Answer')
                : (language === 'az' ? '▼ İdeal Cavabı Göstər' : '▼ Show Model Answer')}
            </button>

            {showInterviewAnswer && (
              <div className="mt-3 space-y-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60">
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {t(lesson.interview_question.answer)}
                </p>

                {lesson.interview_question.interviewer_tips && (
                  <div className="rounded-xl border border-indigo-200 bg-white/70 p-3 text-xs text-indigo-950 dark:border-indigo-900 dark:bg-zinc-900 dark:text-indigo-200">
                    💡 <strong>{language === 'az' ? 'Müsahibə Məsləhəti:' : 'Interviewer Tip:'}</strong>{' '}
                    {t(lesson.interview_question.interviewer_tips)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation: Previous & Next Lesson */}
      <div className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {prevLesson ? (
          <button
            onClick={() => onSelectLesson(prevLesson.id)}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <span className="block text-[10px] text-zinc-400">{language === 'az' ? 'Əvvəlki Dərs' : 'Previous'}</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px] block">{t(prevLesson.title)}</span>
            </div>
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => onSelectLesson(nextLesson.id)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
          >
            <div className="text-right">
              <span className="block text-[10px] text-blue-200">{language === 'az' ? 'Növbəti Dərs' : 'Next'}</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px] block">{t(nextLesson.title)}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
