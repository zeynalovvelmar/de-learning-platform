'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { Exercise, SQLExecutionResult, PythonExecutionResult } from '@/types';
import { executeSQL, checkSQLAnswer, executePython, checkPythonAnswer } from '@/lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';
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
  Database,
  Sparkles,
  Command,
  ChevronDown,
  ChevronUp
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

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, sandboxType]);

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
    <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      {/* Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/90 bg-zinc-50/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="ml-2 flex items-center gap-2">
            {sandboxType === 'sql' ? (
              <Database className="h-4 w-4 text-blue-500" />
            ) : (
              <Terminal className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
              {sandboxType === 'sql' ? 'DuckDB Engine (In-Memory OLAP)' : 'Python 3.12 Runtime'}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <Command className="h-3 w-3" />
            <span>Enter</span>
          </span>

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
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunning ? (language === 'az' ? 'İcra olunur...' : 'Running...') : (language === 'az' ? 'Kodu İcra Et' : 'Run Code')}</span>
          </button>

          {exercise && (
            <button
              onClick={handleCheckSolution}
              disabled={isChecking}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{isChecking ? (language === 'az' ? 'Yoxlanılır...' : 'Checking...') : (language === 'az' ? 'Həlli Yoxla (+100 XP)' : 'Check Solution (+100 XP)')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Exercise Question Prompt (if applicable) */}
      {exercise && (
        <div className="border-b border-zinc-200/90 bg-blue-50/60 p-4 dark:border-zinc-800 dark:bg-blue-950/25">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                {language === 'az' ? 'Praktiki Tapşırıq:' : 'Hands-on Challenge:'}
              </span>
              <div className="mt-1">
                <MarkdownRenderer content={t(exercise.question)} className="text-sm font-medium" />
              </div>
            </div>

            {/* Hint & Solution Toggles */}
            <div className="flex shrink-0 items-center gap-2">
              {exercise.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300 transition shadow-2xs"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showHint ? (language === 'az' ? 'Gizlət' : 'Hide') : (language === 'az' ? 'İpucu' : 'Hint')}</span>
                </button>
              )}
              {exercise.solution && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1 rounded-lg border border-purple-200/80 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300 transition shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showSolution ? (language === 'az' ? 'Gizlət' : 'Hide') : (language === 'az' ? 'Model Həll' : 'Official Solution')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Hint Card */}
          {showHint && exercise.hint && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 animate-in fade-in duration-150">
              <span className="font-bold">💡 {language === 'az' ? 'İpucu:' : 'Hint:'}</span>
              <div className="mt-1">
                <MarkdownRenderer content={t(exercise.hint)} />
              </div>
            </div>
          )}

          {/* Solution Card */}
          {showSolution && exercise.solution && (
            <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/90 p-3 text-xs text-purple-950 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-200 animate-in fade-in duration-150">
              <span className="font-bold">🔑 {language === 'az' ? 'Rəsmi Həll:' : 'Official Model Solution:'}</span>
              <div className="mt-1">
                <MarkdownRenderer content={`\`\`\`${sandboxType}\n${exercise.solution}\n\`\`\``} />
              </div>
            </div>
          )}

          {/* Check Status Feedback Box */}
          {checkStatus && (
            <div
              className={`mt-3 flex items-center gap-2.5 rounded-xl p-3 text-xs font-semibold shadow-xs ${
                checkStatus.isCorrect
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {checkStatus.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{checkStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="h-64 sm:h-72 w-full border-b border-zinc-200 dark:border-zinc-800">
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
            fontFamily: 'var(--font-geist-mono), JetBrains Mono, monospace',
            roundedSelection: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Results / Output Console */}
      <div className="p-4 bg-zinc-50/70 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {language === 'az' ? 'Çıxış Paneli (Console)' : 'Output Console'}
          </span>
          {(sqlResult || pythonResult) && (
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-200/80 px-2.5 py-0.5 text-[11px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Clock className="h-3 w-3 text-blue-500" />
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-mono text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                ⚠️ {sqlResult.error}
              </div>
            ) : sqlResult.columns.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-100 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    <tr>
                      <th className="w-10 px-3 py-2 text-zinc-400 text-center font-mono">#</th>
                      {sqlResult.columns.map((col, idx) => (
                        <th key={idx} className="px-3.5 py-2 font-bold tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white font-mono dark:divide-zinc-800/80 dark:bg-zinc-950">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                        <td className="px-3 py-1.5 text-zinc-400 text-center text-[11px] select-none">
                          {rIdx + 1}
                        </td>
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-1.5 text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {val === null ? <span className="italic text-zinc-400">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3.5 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <span>{sqlResult.row_count} {language === 'az' ? 'sətir qaytarıldı' : 'rows returned'}</span>
                  {sqlResult.truncated && (
                    <span className="text-amber-500 font-medium">
                      {language === 'az' ? '(İlk 200 sətir göstərilir)' : '(Truncated to 200 rows)'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic p-3 text-center">
                {language === 'az' ? 'Sorğu heç bir sətir qaytarmadı.' : 'Query returned 0 rows.'}
              </p>
            )}
          </div>
        )}

        {/* Python Output */}
        {sandboxType === 'python' && pythonResult && (
          <div>
            {pythonResult.error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-mono text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                ⚠️ {pythonResult.error}
              </div>
            ) : (
              <pre className="rounded-xl border border-zinc-200 bg-zinc-950 p-3.5 font-mono text-xs text-emerald-400 dark:border-zinc-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {pythonResult.stdout || (language === 'az' ? '(Boş nəticə)' : '(No stdout)')}
              </pre>
            )}
          </div>
        )}

        {!sqlResult && !pythonResult && (
          <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            <span>{language === 'az' ? 'Nəticəni görmək üçün "Kodu İcra Et" düyməsini sıxın' : 'Click "Run Code" to view results'}</span>
            <span className="text-[10px] text-zinc-500">(və ya Ctrl + Enter)</span>
          </div>
        )}
      </div>
    </div>
  );
}
