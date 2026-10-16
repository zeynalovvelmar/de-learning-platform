'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { Exercise, SQLExecutionResult, PythonExecutionResult } from '@/types';
import { executeSQL, checkSQLAnswer, executePython, checkPythonAnswer } from '@/lib/api';
import confetti from 'canvas-confetti';
import { 
  Play, 
  CheckCircle, 
  HelpCircle, 
  Eye, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Terminal,
  Database
} from 'lucide-react';

interface CodeSandboxProps {
  moduleId: string;
  lessonId: string;
  exercise?: Exercise;
  defaultCode?: string;
  sandboxType: 'sql' | 'python';
}

export function CodeSandbox({
  moduleId,
  lessonId,
  exercise,
  defaultCode,
  sandboxType,
}: CodeSandboxProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { addXP, toggleLessonCompleted, isLessonCompleted } = useProgress();

  const initialCode = exercise?.starter_code || defaultCode || (sandboxType === 'sql' ? 'SELECT * FROM users LIMIT 10;' : 'print("Salam, Data Engineering!")');
  const [code, setCode] = useState<string>(initialCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [sqlResult, setSqlResult] = useState<SQLExecutionResult | null>(null);
  const [pythonResult, setPythonResult] = useState<PythonExecutionResult | null>(null);
  const [checkStatus, setCheckStatus] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setCheckStatus(null);
    try {
      if (sandboxType === 'sql') {
        const res = await executeSQL(code);
        setSqlResult(res);
      } else {
        const res = await executePython(code);
        setPythonResult(res);
      }
    } catch (err: any) {
      if (sandboxType === 'sql') {
        setSqlResult({
          success: false,
          columns: [],
          rows: [],
          row_count: 0,
          execution_time_ms: 0,
          truncated: false,
          error: err.message || 'Execution error',
        });
      } else {
        setPythonResult({
          success: false,
          stdout: '',
          execution_time_ms: 0,
          error: err.message || 'Execution error',
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleCheckSolution = async () => {
    if (!exercise) return;
    setIsChecking(true);
    try {
      let result;
      if (sandboxType === 'sql') {
        result = await checkSQLAnswer(lessonId, code);
      } else {
        result = await checkPythonAnswer(lessonId, code);
      }

      if (result.is_correct) {
        setCheckStatus({
          isCorrect: true,
          message: language === 'az' ? 'Əla! Tapşırığı düzgün həll etdiniz! (+100 XP)' : 'Awesome! Correct solution! (+100 XP)',
        });
        // Fire confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        addXP(100);
        if (!isLessonCompleted(lessonId)) {
          toggleLessonCompleted(lessonId);
        }
      } else {
        setCheckStatus({
          isCorrect: false,
          message: result.details || (language === 'az' ? 'Nəticə uyğun gəlmir, kodu yenidən yoxlayın.' : 'Result does not match expected output.'),
        });
      }
    } catch (err: any) {
      setCheckStatus({
        isCorrect: false,
        message: err.message || 'Yoxlama zamanı xəta baş verdi',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setSqlResult(null);
    setPythonResult(null);
    setCheckStatus(null);
    setShowHint(false);
    setShowSolution(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex items-center gap-2">
          {sandboxType === 'sql' ? (
            <Database className="h-4 w-4 text-blue-500" />
          ) : (
            <Terminal className="h-4 w-4 text-emerald-500" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
            {sandboxType === 'sql' ? 'SQL Sandbox (DuckDB)' : 'Python Sandbox (Safe Execution)'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            title="Sıfırla"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'az' ? 'Sıfırla' : 'Reset'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunning ? (language === 'az' ? 'İcra olunur...' : 'Running...') : (language === 'az' ? 'Kodu İcra Et' : 'Run Code')}</span>
          </button>

          {exercise && (
            <button
              onClick={handleCheckSolution}
              disabled={isChecking}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{isChecking ? (language === 'az' ? 'Yoxlanılır...' : 'Checking...') : (language === 'az' ? 'Həlli Yoxla' : 'Check Solution')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Exercise Question Prompt (if applicable) */}
      {exercise && (
        <div className="border-b border-zinc-200 bg-blue-50/50 p-4 dark:border-zinc-800 dark:bg-blue-950/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {language === 'az' ? 'Praktiki Tapşırıq:' : 'Hands-on Exercise:'}
              </span>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t(exercise.question)}
              </p>
            </div>

            {/* Hint & Solution Toggles */}
            <div className="flex shrink-0 items-center gap-2">
              {exercise.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/50 transition"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showHint ? (language === 'az' ? 'Gizlət' : 'Hide') : (language === 'az' ? 'İpucu' : 'Hint')}</span>
                </button>
              )}
              {exercise.solution && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-950/50 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showSolution ? (language === 'az' ? 'Gizlət' : 'Hide') : (language === 'az' ? 'Həll' : 'Solution')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Hint Card */}
          {showHint && exercise.hint && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              💡 <strong>{language === 'az' ? 'İpucu:' : 'Hint:'}</strong> {t(exercise.hint)}
            </div>
          )}

          {/* Solution Card */}
          {showSolution && exercise.solution && (
            <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-2.5 text-xs font-mono text-purple-950 dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-200">
              🔑 <strong>{language === 'az' ? 'Düzgün Cavab:' : 'Official Solution:'}</strong>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{exercise.solution}</pre>
            </div>
          )}

          {/* Check Status Feedback Box */}
          {checkStatus && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold ${
                checkStatus.isCorrect
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {checkStatus.isCorrect ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{checkStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="h-60 sm:h-72 w-full border-b border-zinc-200 dark:border-zinc-800">
        <Editor
          height="100%"
          language={sandboxType === 'sql' ? 'sql' : 'python'}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: 'monospace',
          }}
        />
      </div>

      {/* Results / Output Console */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {language === 'az' ? 'Çıxış Paneli (Console)' : 'Output Console'}
          </span>
          {(sqlResult || pythonResult) && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>
                {((sqlResult?.execution_time_ms || pythonResult?.execution_time_ms || 0)).toFixed(1)} ms
              </span>
            </div>
          )}
        </div>

        {/* SQL Table Output */}
        {sandboxType === 'sql' && sqlResult && (
          <div>
            {sqlResult.error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-mono text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                ⚠️ {sqlResult.error}
              </div>
            ) : sqlResult.columns.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <tr>
                      {sqlResult.columns.map((col, idx) => (
                        <th key={idx} className="px-3 py-2 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white font-mono dark:divide-zinc-800 dark:bg-zinc-950">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {val === null ? <span className="italic text-zinc-400">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-zinc-50 px-3 py-1.5 text-[11px] text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  {sqlResult.row_count} {language === 'az' ? 'sətir tapıldı' : 'rows returned'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                {language === 'az' ? 'Sorğu heç bir sətir qaytarmadı.' : 'Query returned 0 rows.'}
              </p>
            )}
          </div>
        )}

        {/* Python Output */}
        {sandboxType === 'python' && pythonResult && (
          <div>
            {pythonResult.error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-mono text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                ⚠️ {pythonResult.error}
              </div>
            ) : (
              <pre className="rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap">
                {pythonResult.stdout || (language === 'az' ? '(Boş nəticə)' : '(No stdout)')}
              </pre>
            )}
          </div>
        )}

        {!sqlResult && !pythonResult && (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            {language === 'az' ? 'Nəticəni görmək üçün "Kodu İcra Et" düyməsini sıxın' : 'Click "Run Code" to view results'}
          </div>
        )}
      </div>
    </div>
  );
}
