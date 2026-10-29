import { 
  ModuleSummary, 
  LessonSummary, 
  LessonDetail, 
  Flashcard, 
  FullInterviewQuestion,
  SQLExecutionResult, 
  CheckAnswerResult, 
  PythonExecutionResult
} from '@/types';
import { 
  getStaticModules, 
  getStaticModuleLessons, 
  getStaticLessonDetail, 
  getStaticInterviewQuestions, 
  getStaticModuleFlashcards 
} from '@/lib/staticData';

const getApiBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://127.0.0.1:8000';
  const clean = url.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

/**
 * Silently pings backend in background to wake up free-tier cold starts.
 * Runs non-blocking with 5s timeout.
 */
export function warmupBackend(): void {
  try {
    const rootUrl = API_BASE.replace(/\/api$/, '');
    fetch(`${rootUrl}/healthz`, { method: 'GET', keepalive: true }).catch(() => {});
  } catch {
    // Ignore warmup errors
  }
}

export async function fetchModules(): Promise<ModuleSummary[]> {
  const staticMods = getStaticModules();
  if (staticMods && staticMods.length > 0) {
    return staticMods;
  }
  const res = await fetch(`${API_BASE}/modules/`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch modules');
  return res.json();
}

export async function fetchModuleLessons(moduleId: string): Promise<LessonSummary[]> {
  const staticLessons = getStaticModuleLessons(moduleId);
  if (staticLessons && staticLessons.length > 0) {
    return staticLessons;
  }
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch lessons for module ${moduleId}`);
  return res.json();
}

export async function fetchLessonDetail(moduleId: string, lessonId: string): Promise<LessonDetail> {
  const staticDetail = getStaticLessonDetail(moduleId, lessonId);
  if (staticDetail) {
    return staticDetail;
  }
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons/${lessonId}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch lesson ${lessonId}`);
  return res.json();
}

export async function fetchModuleFlashcards(moduleId: string): Promise<Flashcard[]> {
  const staticCards = getStaticModuleFlashcards(moduleId);
  if (staticCards && staticCards.length > 0) {
    return staticCards;
  }
  const res = await fetch(`${API_BASE}/modules/${moduleId}/flashcards`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch flashcards for ${moduleId}`);
  return res.json();
}

export async function fetchInterviewQuestions(): Promise<FullInterviewQuestion[]> {
  const staticQuestions = getStaticInterviewQuestions();
  if (staticQuestions && staticQuestions.length > 0) {
    return staticQuestions;
  }
  const res = await fetch(`${API_BASE}/modules/interview-questions`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch interview questions');
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
