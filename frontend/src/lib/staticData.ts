import rawData from '@/data/staticData.json';
import { 
  ModuleSummary, 
  LessonSummary, 
  LessonDetail, 
  Flashcard, 
  FullInterviewQuestion 
} from '@/types';

interface StaticDataBundle {
  modules: ModuleSummary[];
  moduleLessons: Record<string, LessonSummary[]>;
  interviewQuestions: FullInterviewQuestion[];
  flashcards: Record<string, Flashcard[]>;
  lessons: Record<string, LessonDetail>;
}

export const staticData = rawData as unknown as StaticDataBundle;

export function getStaticModules(): ModuleSummary[] {
  return staticData.modules || [];
}

export function getStaticModuleLessons(moduleId: string): LessonSummary[] {
  return staticData.moduleLessons[moduleId] || [];
}

export function getStaticAllModuleLessons(): Record<string, LessonSummary[]> {
  return staticData.moduleLessons || {};
}

export function getStaticLessonDetail(moduleId: string, lessonId: string): LessonDetail | null {
  const key = `${moduleId}/${lessonId}`;
  return staticData.lessons[key] || null;
}

export function getStaticInterviewQuestions(): FullInterviewQuestion[] {
  return staticData.interviewQuestions || [];
}

export function getStaticModuleFlashcards(moduleId: string): Flashcard[] {
  return staticData.flashcards[moduleId] || [];
}
