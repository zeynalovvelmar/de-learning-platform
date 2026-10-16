import { 
  ModuleSummary, 
  LessonSummary, 
  LessonDetail, 
  Flashcard, 
  SQLExecutionResult, 
  CheckAnswerResult, 
  PythonExecutionResult,
  Language
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchModules(): Promise<ModuleSummary[]> {
  const res = await fetch(`${API_BASE}/modules/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch modules');
  return res.json();
}

export async function fetchModuleLessons(moduleId: string): Promise<LessonSummary[]> {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch lessons for module ${moduleId}`);
  return res.json();
}

export async function fetchLessonDetail(moduleId: string, lessonId: string): Promise<LessonDetail> {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons/${lessonId}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch lesson ${lessonId}`);
  return res.json();
}

export async function fetchModuleFlashcards(moduleId: string): Promise<Flashcard[]> {
  const res = await fetch(`${API_BASE}/modules/${moduleId}/flashcards`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch flashcards for ${moduleId}`);
  return res.json();
}

export async function executeSQL(query: string, maxRows: number = 200): Promise<SQLExecutionResult> {
  const res = await fetch(`${API_BASE}/execute/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, max_rows: maxRows })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'SQL Execution failed' }));
    throw new Error(err.detail || 'SQL Execution failed');
  }
  return res.json();
}

export async function checkSQLAnswer(lessonId: string, userQuery: string): Promise<CheckAnswerResult> {
  const res = await fetch(`${API_BASE}/execute/sql/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lesson_id: lessonId, user_query: userQuery })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Check failed' }));
    throw new Error(err.detail || 'Check failed');
  }
  return res.json();
}

export async function executePython(code: string): Promise<PythonExecutionResult> {
  const res = await fetch(`${API_BASE}/execute/python`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Python Execution failed' }));
    throw new Error(err.detail || 'Python Execution failed');
  }
  return res.json();
}

export async function checkPythonAnswer(lessonId: string, userCode: string): Promise<CheckAnswerResult> {
  const res = await fetch(`${API_BASE}/execute/python/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lesson_id: lessonId, user_code: userCode })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Check failed' }));
    throw new Error(err.detail || 'Check failed');
  }
  return res.json();
}

export async function fetchI18n(lang: Language): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/i18n/${lang}`);
  if (!res.ok) return {};
  return res.json();
}
