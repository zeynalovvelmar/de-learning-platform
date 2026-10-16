'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { ModuleSummary, LessonSummary } from '@/types';
import { 
  Database, 
  Code2, 
  Zap, 
  Radio, 
  Wind, 
  Server, 
  Layers, 
  Box, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Code,
  X
} from 'lucide-react';

interface SidebarProps {
  modules: ModuleSummary[];
  activeModuleId: string;
  activeLessonId: string;
  moduleLessons: Record<string, LessonSummary[]>;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  python: <Code2 className="h-4 w-4 text-emerald-500" />,
  sql: <Database className="h-4 w-4 text-blue-500" />,
  spark: <Zap className="h-4 w-4 text-amber-500" />,
  kafka: <Radio className="h-4 w-4 text-purple-500" />,
  airflow: <Wind className="h-4 w-4 text-teal-500" />,
  devops: <Server className="h-4 w-4 text-rose-500" />,
  data_architecture: <Layers className="h-4 w-4 text-cyan-500" />,
  dbt: <Box className="h-4 w-4 text-orange-500" />,
};

export function Sidebar({
  modules,
  activeModuleId,
  activeLessonId,
  moduleLessons,
  onSelectLesson,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, completedLessons } = useProgress();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [activeModuleId]: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const totalPlatformLessons = modules.reduce((acc, m) => acc + m.total_lessons, 0);
  const completionPercentage = totalPlatformLessons > 0 
    ? Math.round((completedLessons.size / totalPlatformLessons) * 100) 
    : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 z-40 flex w-80 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'left-0 translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Progress and Search */}
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {language === 'az' ? 'Ümumi Tərəqqi' : 'Overall Progress'}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {completionPercentage}% ({completedLessons.size}/{totalPlatformLessons})
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Search box */}
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={language === 'az' ? 'Dərslərdə axtarış...' : 'Search lessons...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {modules.map((mod) => {
            const isExpanded = expandedModules[mod.id] || searchQuery.length > 0;
            const lessons = moduleLessons[mod.id] || [];
            
            // Filter lessons by search query if present
            const filteredLessons = searchQuery.trim() === ''
              ? lessons
              : lessons.filter((l) => {
                  const title = t(l.title).toLowerCase();
                  return title.includes(searchQuery.toLowerCase());
                });

            // If searching and no match, skip module
            if (searchQuery.trim() !== '' && filteredLessons.length === 0) {
              return null;
            }

            const moduleCompletedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;

            return (
              <div key={mod.id} className="rounded-xl overflow-hidden mb-1">
                {/* Module Header Button */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded-lg transition ${
                    activeModuleId === mod.id
                      ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
                      : 'text-zinc-700 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="p-1 rounded-md bg-white shadow-xs dark:bg-zinc-900">
                      {MODULE_ICONS[mod.id] || <Box className="h-4 w-4" />}
                    </span>
                    <span className="truncate">{t(mod.title)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      {moduleCompletedCount}/{mod.total_lessons}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="mt-1 ml-4 pl-2 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 py-1">
                    {filteredLessons.map((lesson) => {
                      const isActive = activeLessonId === lesson.id;
                      const completed = isLessonCompleted(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            onSelectLesson(mod.id, lesson.id);
                            onCloseMobile();
                          }}
                          className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            isActive
                              ? 'bg-blue-600 font-medium text-white shadow-xs'
                              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {completed ? (
                              <CheckCircle2
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  isActive ? 'text-white' : 'text-emerald-500'
                                }`}
                              />
                            ) : (
                              <Circle
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  isActive ? 'text-white/60' : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            )}
                            <span className="text-[11px] font-mono opacity-60">
                              {lesson.order < 10 ? `0${lesson.order}` : lesson.order}
                            </span>
                            <span className="truncate">{t(lesson.title)}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {lesson.has_exercise && (
                              <span title="Interactive Code Exercise">
                                <Code
                                  className={`h-3 w-3 ${
                                    isActive ? 'text-white/80' : 'text-amber-500/80'
                                  }`}
                                />
                              </span>
                            )}
                            <span
                              className={`rounded px-1 py-0.2 text-[9px] font-semibold uppercase ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : lesson.level === 'junior'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : lesson.level === 'mid'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                              }`}
                            >
                              {lesson.level}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
