'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { 
  fetchModules, 
  fetchModuleLessons, 
  fetchLessonDetail, 
  fetchModuleFlashcards,
  fetchInterviewQuestions
} from '@/lib/api';
import { ModuleSummary, LessonSummary, LessonDetail, Flashcard, FullInterviewQuestion } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LessonView } from '@/components/LessonView';
import { HomeHub } from '@/components/HomeHub';
import { InterviewHub } from '@/components/InterviewHub';
import { FlashcardModal } from '@/components/FlashcardModal';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const { language, t } = useLanguage();

  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<string, LessonSummary[]>>({});
  
  // Navigation states
  const [isHome, setIsHome] = useState<boolean>(true);
  const [isInterviews, setIsInterviews] = useState<boolean>(false);
  const [activeModuleId, setActiveModuleId] = useState<string>('data_architecture');
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [lastLesson, setLastLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  // Interview Hub state
  const [interviewQuestions, setInterviewQuestions] = useState<FullInterviewQuestion[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState<boolean>(false);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [lessonLoading, setLessonLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Flashcards modal
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState<boolean>(false);
  const [modalCards, setModalCards] = useState<Flashcard[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');

  // 1. Initial Load: Fetch all modules and their lessons
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        setError(null);
        const mods = await fetchModules();
        setModules(mods);

        // Fetch lessons for all modules in parallel
        const lessonsMap: Record<string, LessonSummary[]> = {};
        await Promise.all(
          mods.map(async (m) => {
            const lessons = await fetchModuleLessons(m.id);
            lessonsMap[m.id] = lessons;
          })
        );
        setModuleLessons(lessonsMap);

        // Read last visited lesson from localStorage if available
        try {
          const saved = localStorage.getItem('dataeng_last_lesson');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.moduleId && parsed.lessonId) {
              setLastLesson(parsed);
            }
          }
        } catch {
          // Ignore
        }
      } catch (err: any) {
        console.error('Failed to load initial data', err);
        setError(err.message || 'Serverə qoşularkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // 2. Select Lesson handler
  const handleSelectLesson = async (moduleId: string, lessonId: string) => {
    setIsHome(false);
    setIsInterviews(false);
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setLessonLoading(true);

    try {
      // Save last visited lesson
      try {
        localStorage.setItem('dataeng_last_lesson', JSON.stringify({ moduleId, lessonId }));
        setLastLesson({ moduleId, lessonId });
      } catch {
        // Ignore
      }

      const detail = await fetchLessonDetail(moduleId, lessonId);
      setLessonDetail(detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to load lesson detail', err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleGoHome = () => {
    setIsInterviews(false);
    setIsHome(true);
  };

  const handleOpenInterviews = async () => {
    setIsHome(false);
    setIsInterviews(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (interviewQuestions.length === 0) {
      try {
        setInterviewsLoading(true);
        const data = await fetchInterviewQuestions();
        setInterviewQuestions(data);
      } catch (err) {
        console.error('Failed to load interview questions', err);
      } finally {
        setInterviewsLoading(false);
      }
    }
  };

  // Expose helpers for automated testing / live auditing
  useEffect(() => {
    (window as any).__selectLesson = handleSelectLesson;
    (window as any).__openInterviews = handleOpenInterviews;
  }, [modules, activeModuleId, activeLessonId, lessonDetail, interviewQuestions]);

  const handleOpenLessonFlashcards = () => {
    if (lessonDetail?.flashcards && lessonDetail.flashcards.length > 0) {
      setModalCards(lessonDetail.flashcards);
      setModalTitle(`${t(lessonDetail.title)} - ${language === 'az' ? 'Flashcard-lar' : 'Flashcards'}`);
      setIsFlashcardModalOpen(true);
    }
  };

  const handleOpenModuleFlashcards = async () => {
    try {
      const cards = await fetchModuleFlashcards(activeModuleId);
      if (cards && cards.length > 0) {
        const mod = modules.find((m) => m.id === activeModuleId);
        setModalCards(cards);
        setModalTitle(`${mod ? t(mod.title) : ''} - Master Deck (${cards.length} ${language === 'az' ? 'kart' : 'cards'})`);
        setIsFlashcardModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch module flashcards', err);
    }
  };

  const currentModule = modules.find((m) => m.id === activeModuleId);
  const currentModuleLessons = moduleLessons[activeModuleId] || [];

  // Compute Prev and Next lessons
  const currentLessonIndex = currentModuleLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = currentLessonIndex > 0 ? currentModuleLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < currentModuleLessons.length - 1 
    ? currentModuleLessons[currentLessonIndex + 1] 
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onGoHome={handleGoHome}
        isHome={isHome}
        isInterviews={isInterviews}
        onOpenInterviews={handleOpenInterviews}
        activeModuleTitle={currentModule ? t(currentModule.title) : undefined}
        activeLessonTitle={lessonDetail ? t(lessonDetail.title) : undefined}
        onOpenFlashcards={handleOpenModuleFlashcards}
      />

      {/* Main Learning Workspace */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          modules={modules}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          moduleLessons={moduleLessons}
          onSelectLesson={(modId, lesId) => handleSelectLesson(modId, lesId)}
          onGoHome={handleGoHome}
          isHome={isHome}
          isInterviews={isInterviews}
          onOpenInterviews={handleOpenInterviews}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium">
                {language === 'az' ? 'Məlumatlar yüklənir...' : 'Loading learning platform...'}
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-xl p-8 mt-12 text-center rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20">
              <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
              <h2 className="text-base font-bold text-rose-800 dark:text-rose-300">
                {language === 'az' ? 'Serverə Qoşulma Xətası' : 'Backend Connection Error'}
              </h2>
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </p>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                FastAPI backend-in <code>http://127.0.0.1:8000</code> ünvanında işlədiyindən əmin olun.
              </p>
            </div>
          ) : isInterviews ? (
            <InterviewHub
              questions={interviewQuestions}
              modules={modules}
              loading={interviewsLoading}
              onSelectLesson={(modId, lesId) => handleSelectLesson(modId, lesId)}
            />
          ) : isHome ? (
            /* Dedicated Professional Entry / Overview Landing Page */
            <HomeHub
              modules={modules}
              moduleLessons={moduleLessons}
              lastLessonId={lastLesson}
              onSelectLesson={(modId, lesId) => handleSelectLesson(modId, lesId)}
            />
          ) : lessonLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium">
                {language === 'az' ? 'Dərs yüklənir...' : 'Loading lesson...'}
              </p>
            </div>
          ) : lessonDetail && currentModule ? (
            <LessonView
              moduleId={activeModuleId}
              moduleTitle={t(currentModule.title)}
              lesson={lessonDetail}
              onOpenFlashcards={handleOpenLessonFlashcards}
              onPrevLesson={prevLesson ? () => handleSelectLesson(activeModuleId, prevLesson.id) : undefined}
              onNextLesson={nextLesson ? () => handleSelectLesson(activeModuleId, nextLesson.id) : undefined}
              prevLessonTitle={prevLesson ? t(prevLesson.title) : undefined}
              nextLessonTitle={nextLesson ? t(nextLesson.title) : undefined}
            />
          ) : (
            <div className="p-8 text-center text-zinc-500">
              {language === 'az' ? 'Dərs tapılmadı.' : 'No lesson selected.'}
            </div>
          )}
        </main>
      </div>

      {/* Interactive Flashcard Modal */}
      <FlashcardModal
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        cards={modalCards}
        title={modalTitle}
      />
    </div>
  );
}
