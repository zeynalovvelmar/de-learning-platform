export type Language = 'az' | 'en';

export interface LocalizedText {
  az: string;
  en: string;
}

export interface ModuleSummary {
  id: string;
  title: LocalizedText;
  total_lessons: number;
  levels: Record<string, number>;
}

export interface LessonSummary {
  id: string;
  order: number;
  level: 'junior' | 'mid' | 'senior' | string;
  title: LocalizedText;
  has_exercise: boolean;
  flashcard_count: number;
}

export interface Flashcard {
  front: LocalizedText;
  back: LocalizedText;
  lesson_id?: string;
  lesson_order?: number;
}

export interface Exercise {
  question: LocalizedText;
  starter_code: string;
  hint?: LocalizedText;
  solution?: string;
  order_matters?: boolean;
}

export interface InterviewQA {
  question: LocalizedText;
  answer: LocalizedText;
  interviewer_tips?: LocalizedText;
}

export interface FullInterviewQuestion {
  module_id: string;
  module_title: LocalizedText;
  lesson_id: string;
  lesson_order: number;
  lesson_title: LocalizedText;
  level: string;
  question: LocalizedText;
  answer: LocalizedText;
  interviewer_tips?: LocalizedText;
}

export interface LessonDetail {
  id: string;
  order: number;
  level: string;
  title: LocalizedText;
  infographic?: LocalizedText;
  explanation: LocalizedText;
  quick_recap?: LocalizedText;
  what_it_does?: LocalizedText;
  real_world_use?: LocalizedText;
  common_mistakes?: LocalizedText;
  code?: string;
  code_explanation?: LocalizedText;
  visual_output?: string;
  output_description?: LocalizedText;
  interview_question?: InterviewQA;
  exercise?: Exercise;
  flashcards?: Flashcard[];
}

export interface SQLExecutionResult {
  success: boolean;
  columns: string[];
  rows: any[][];
  row_count: number;
  execution_time_ms: number;
  truncated: boolean;
  error?: string;
}

export interface CheckAnswerResult {
  is_correct: boolean;
  status: string;
  details?: string;
}

export interface PythonExecutionResult {
  success: boolean;
  stdout: string;
  execution_time_ms: number;
  error?: string;
}
