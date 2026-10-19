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
  Clock, 
  Box, 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Home,
  Sliders,
  Keyboard,
  BookOpen,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onOpenSandbox?: () => void;
  isInterviews?: boolean;
  onOpenInterviews?: () => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  sql: Database,
  python: Terminal,
  data_architecture: Cpu,
  kafka: Layers,
  spark: Zap,
  airflow: Clock,
  dbt: GitBranch,
  devops: Box,
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
  onOpenSandbox,
  isInterviews,
  onOpenInterviews,
}: SidebarProps) {
  const { language, t } = useLanguage();
  const { isLessonCompleted, completedLessons } = useProgress();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [activeModuleId]: true,
  });

  const isAz = language === 'az';

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.total_lessons, 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={cn(
          'fixed top-14 bottom-0 z-40 flex w-[272px] shrink-0 flex-col justify-between border-r border-line bg-surface-low transition-transform duration-200 ease-in-out lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0',
          isOpenMobile ? 'left-0 translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {/* Rail Header */}
          <div className="flex items-start space-x-3 px-2 pb-3 border-b border-line">
            <div className="p-2 rounded-lg bg-surface border border-line text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-ink tracking-tight font-sans">
                {isAz ? 'Data Mühəndisliyi' : 'Data Engineering Curriculum'}
              </h2>
              <p className="font-mono text-[10px] text-muted mt-0.5">
                {totalLessons || 87} {isAz ? 'Dərs' : 'Lessons'} • v2.4 LTS
              </p>
            </div>
          </div>

          {/* Quick Home / Roadmap Action */}
          <button
            onClick={() => {
              onGoHome();
              onCloseMobile();
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-lg transition',
              isHome && !isInterviews
                ? 'bg-surface text-primary border border-line shadow-2xs font-semibold' 
                : 'text-muted hover:text-ink hover:bg-surface-2'
            )}
          >
            <Home className="h-4 w-4 shrink-0 text-primary" />
            <span>{isAz ? 'İcmal & Yol Xəritəsi' : 'Roadmap Overview Hub'}</span>
          </button>

          {/* Quick Technical Interview Questions Hub */}
          {onOpenInterviews && (
            <button
              onClick={() => {
                onOpenInterviews();
                onCloseMobile();
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition',
                isInterviews
                  ? 'bg-surface text-primary border border-line shadow-2xs font-semibold' 
                  : 'text-muted hover:text-ink hover:bg-surface-2'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <HelpCircle className={cn('h-4 w-4 shrink-0', isInterviews ? 'text-primary' : 'text-amber-500')} />
                <span className="truncate">{isAz ? 'Müsahibə Sualları' : 'Interview Hub'}</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                87
              </span>
            </button>
          )}

          {/* Core Tracks Navigation */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 font-mono text-[10px] font-bold text-outline uppercase tracking-wider">
              {isAz ? 'ƏSAS İSTİQAMƏTLƏR' : 'CORE TRACKS'}
            </div>

            {modules.map((mod, trackIdx) => {
              const Icon = MODULE_ICONS[mod.id] || Database;
              const isExpanded = !!expandedModules[mod.id];
              const isActiveMod = !isHome && activeModuleId === mod.id;
              const lessons = moduleLessons[mod.id] || [];

              return (
                <div key={mod.id} className="space-y-0.5">
                  {/* Module Track Header */}
                  <div
                    onClick={() => toggleModule(mod.id)}
                    className={cn(
                      'group flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer transition select-none',
                      isActiveMod 
                        ? 'bg-surface text-primary border-l-2 border-primary font-medium' 
                        : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('h-4 w-4 shrink-0', isActiveMod ? 'text-primary' : 'text-muted')} />
                      <span className="truncate font-sans font-medium text-xs">
                        {t(mod.title)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-muted">
                        {mod.total_lessons}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Lessons Tree if expanded */}
                  {isExpanded && (
                    <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-line/50 ml-3.5 my-1 text-xs font-sans">
                      {lessons.length === 0 ? (
                        <div className="px-2 py-1 text-[11px] text-muted font-mono">
                          {isAz ? 'Yüklənir…' : 'Loading…'}
                        </div>
                      ) : (
                        lessons.map((les, lIdx) => {
                          const isActiveLesson = !isHome && activeLessonId === les.id;
                          const completed = isLessonCompleted(les.id);

                          return (
                            <button
                              key={les.id}
                              onClick={() => {
                                onSelectLesson(mod.id, les.id);
                                onCloseMobile();
                              }}
                              className={cn(
                                'w-full text-left flex items-center justify-between px-2 py-1.5 rounded transition text-[12px] truncate',
                                isActiveLesson
                                  ? 'bg-surface text-primary font-semibold border-l-2 border-primary -ml-[17px] pl-[15px] rounded-r'
                                  : 'text-muted hover:text-ink hover:bg-surface-2'
                              )}
                              title={t(les.title)}
                            >
                              <span className="truncate">
                                <span className="font-mono text-[10px] opacity-70 mr-1.5">
                                  {String(lIdx + 1).padStart(2, '0')}
                                </span>
                                {t(les.title)}
                              </span>
                              {completed && (
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-secondary ml-1" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sandbox Action Button */}
          <div className="pt-2 px-1">
            <button
              onClick={onOpenSandbox}
              className="w-full py-2 px-3 rounded-lg bg-surface border border-line hover:border-primary text-ink text-xs font-semibold flex items-center justify-center gap-2 transition group cursor-pointer shadow-2xs"
            >
              <PlayCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span>{isAz ? 'Sandbox-ı Aç' : 'Open Sandbox Runner'}</span>
            </button>
          </div>
        </div>

        {/* Rail Footer */}
        <div className="p-3 border-t border-line space-y-1 font-sans text-xs text-muted">
          <div className="flex items-center gap-2 px-2 py-1 text-[11px] hover:text-ink cursor-pointer transition">
            <Sliders className="h-3.5 w-3.5" />
            <span>{isAz ? 'Sistem Parametrləri' : 'Documentation Settings'}</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] hover:text-ink cursor-pointer transition">
            <div className="flex items-center gap-2">
              <Keyboard className="h-3.5 w-3.5" />
              <span>{isAz ? 'Qısayollar' : 'Keyboard Shortcuts'}</span>
            </div>
            <kbd className="font-mono text-[9px] bg-surface-2 px-1.5 py-0.5 rounded border border-line text-muted">?</kbd>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 text-[11px] hover:text-ink cursor-pointer transition">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{isAz ? 'API və Mənbələr' : 'API Reference'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
