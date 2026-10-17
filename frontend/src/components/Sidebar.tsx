'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { ModuleSummary, LessonSummary } from '@/types';
import { 
  Database, 
  Terminal, 
  Zap, 
  Layers, 
  Wind, 
  Box, 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Home,
  Clock,
  X
} from 'lucide-react';

interface SidebarProps {
  modules: ModuleSummary[];
  activeModuleId: string;
  activeLessonId: string;
  moduleLessons: Record<string, LessonSummary[]>;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onGoHome: () => void;
  isHome: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  python: Terminal,
  sql: Database,
  spark: Zap,
  kafka: Layers,
  airflow: Wind,
  devops: Box,
  data_architecture: Cpu,
  dbt: GitBranch,
};

export function Sidebar({
  modules,
  activeModuleId,
  activeLessonId,
  moduleLessons,
  onSelectLesson,
  onGoHome,
  isHome,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, completedLessons } = useProgress();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [activeModuleId]: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const isAz = language === 'az';

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.total_lessons, 0);
  const completedCount = completedLessons.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 z-40 flex w-72 flex-col border-r border-zinc-200/80 bg-zinc-50/70 dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-md transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'left-0 translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Home Link & Search Input */}
        <div className="border-b border-zinc-200/80 p-3.5 dark:border-zinc-800/80">
          {/* Quick Home / Overview Link */}
          <button
            onClick={() => {
              onGoHome();
              onCloseMobile();
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
              isHome 
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="h-4 w-4 text-zinc-500" />
              <span>{isAz ? 'İcmal & Yol Xəritəsi' : 'Overview & Roadmap'}</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">HUB</span>
          </button>

          {/* Minimalist Search Box */}
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={isAz ? 'Dərs və ya mövzu axtar...' : 'Search lessons...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200/90 bg-white py-1.5 pl-8 pr-7 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Subtle Progress Bar */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{isAz ? 'Ümumi tərəqqi' : 'Total Progress'}</span>
            <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
              {progressPct}% ({completedCount}/{totalLessons})
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
            <div 
              className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Middle: Modules and Lessons Hierarchical List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {modules.map((mod, modIdx) => {
            const Icon = MODULE_ICONS[mod.id] || Database;
            const isExpanded = expandedModules[mod.id] ?? (mod.id === activeModuleId);
            const lessons = moduleLessons[mod.id] || [];

            // Filter lessons if search query is active
            const filteredLessons = searchQuery.trim()
              ? lessons.filter((l) => 
                  t(l.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  l.id.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : lessons;

            if (searchQuery.trim() && filteredLessons.length === 0) {
              return null;
            }

            const modCompletedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;
            const isCurrentModule = !isHome && mod.id === activeModuleId;

            return (
              <div key={mod.id} className="rounded-xl overflow-hidden">
                {/* Module Header Accordion Item */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className={`flex w-full items-center justify-between px-2.5 py-2 text-left text-xs font-semibold transition ${
                    isCurrentModule
                      ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                      : 'text-zinc-700 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {modIdx < 9 ? `0${modIdx + 1}` : modIdx + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{t(mod.title)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="font-mono text-[10px] text-zinc-400">
                      {modCompletedCount > 0 ? `${modCompletedCount}/${lessons.length}` : lessons.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Sub Lessons List */}
                {isExpanded && (
                  <div className="ml-5 border-l border-zinc-200/80 dark:border-zinc-800/80 pl-2 my-1 space-y-0.5">
                    {filteredLessons.map((les) => {
                      const isActive = !isHome && mod.id === activeModuleId && les.id === activeLessonId;
                      const done = isLessonCompleted(les.id);

                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            onSelectLesson(mod.id, les.id);
                            onCloseMobile();
                          }}
                          className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            isActive
                              ? 'bg-zinc-200/90 text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-50 font-semibold shadow-2xs'
                              : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {done ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0 group-hover:bg-zinc-400" />
                            )}
                            <span className="truncate">{t(les.title)}</span>
                          </div>

                          <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-1">
                            {les.order < 10 ? `0${les.order}` : les.order}
                          </span>
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
