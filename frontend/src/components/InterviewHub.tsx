'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { FullInterviewQuestion, ModuleSummary } from '@/types';
import { Markdown } from './Markdown';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Database, 
  Terminal, 
  Clock, 
  Zap, 
  Box, 
  GitBranch, 
  Cpu,
  BookOpen,
  Filter,
  Eye,
  EyeOff,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewHubProps {
  questions: FullInterviewQuestion[];
  modules: ModuleSummary[];
  loading?: boolean;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
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

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sql: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  python: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  spark: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  kafka: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  airflow: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  devops: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  data_architecture: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  dbt: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export function InterviewHub({
  questions,
  modules,
  loading = false,
  onSelectLesson,
}: InterviewHubProps) {
  const { language, t } = useLanguage();
  const isAz = language === 'az';

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Module counts map
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: questions.length };
    questions.forEach((q) => {
      counts[q.module_id] = (counts[q.module_id] || 0) + 1;
    });
    return counts;
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Module filter
      if (selectedModule !== 'all' && q.module_id !== selectedModule) {
        return false;
      }
      // 2. Level filter
      if (selectedLevel !== 'all' && q.level.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const qAz = (q.question.az || '').toLowerCase();
        const qEn = (q.question.en || '').toLowerCase();
        const aAz = (q.answer.az || '').toLowerCase();
        const aEn = (q.answer.en || '').toLowerCase();
        const tipAz = (q.interviewer_tips?.az || '').toLowerCase();
        const tipEn = (q.interviewer_tips?.en || '').toLowerCase();
        const lessonTitle = (q.lesson_title.az || '' + q.lesson_title.en || '').toLowerCase();

        return (
          qAz.includes(query) ||
          qEn.includes(query) ||
          aAz.includes(query) ||
          aEn.includes(query) ||
          tipAz.includes(query) ||
          tipEn.includes(query) ||
          lessonTitle.includes(query)
        );
      }
      return true;
    });
  }, [questions, selectedModule, selectedLevel, searchQuery]);

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => {
      next[`${q.module_id}:${q.lesson_id}`] = true;
    });
    setExpandedCards(next);
  };

  const handleCollapseAll = () => {
    setExpandedCards({});
  };

  const allExpanded = filteredQuestions.length > 0 && filteredQuestions.every(
    (q) => expandedCards[`${q.module_id}:${q.lesson_id}`]
  );

  return (
    <div className="flex w-full justify-center">
      <main className="w-full max-w-[1040px] px-4 sm:px-8 py-8 flex flex-col gap-8 font-sans">
        
        {/* 1. Header Hero Card */}
        <div className="rounded-2xl border border-line bg-surface-low p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

          <div className="relative space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{isAz ? 'Müsahibə Hazırlıq Mərkəzi' : 'Technical Interview Hub'}</span>
              </span>

              <span className="font-mono text-xs text-muted">
                {questions.length} {isAz ? 'Real Müsahibə Sualı' : 'Real Interview Questions'} • FAANG & Enterprise
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
              {isAz 
                ? 'Data Engineering Texniki Müsahibə Sualları' 
                : 'Data Engineering Technical Interview Questions'}
            </h1>

            <p className="text-sm sm:text-base text-ink-2 max-w-3xl leading-relaxed">
              {isAz
                ? 'Bütün 8 modul üzrə senior səviyyəli data mühəndisi müsahibələrində ən çox verilən 87 sual, dərin konseptual cavablar və müsahibəçilərin axtardığı əsas açar məqamlar.'
                : '87 curated, deep technical interview questions across all 8 core modules, complete with authoritative answers and senior interviewer insider tips.'}
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="relative pt-3 border-t border-line/60 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-surface p-2.5 rounded-xl border border-line">
              <div className="text-[10px] text-muted uppercase tracking-wider">{isAz ? 'Cəmi Sual' : 'Total Questions'}</div>
              <div className="text-base font-bold text-ink mt-0.5">{questions.length}</div>
            </div>
            <div className="bg-surface p-2.5 rounded-xl border border-line">
              <div className="text-[10px] text-muted uppercase tracking-wider">{isAz ? 'Texnoloji Modul' : 'Tech Modules'}</div>
              <div className="text-base font-bold text-primary mt-0.5">8 Modul</div>
            </div>
            <div className="bg-surface p-2.5 rounded-xl border border-line">
              <div className="text-[10px] text-muted uppercase tracking-wider">{isAz ? 'Sınaq Rejimi' : 'Recall Mode'}</div>
              <div className="text-base font-bold text-secondary mt-0.5">{isAz ? 'Aktiv Özünü Sına' : 'Active Recall'}</div>
            </div>
            <div className="bg-surface p-2.5 rounded-xl border border-line">
              <div className="text-[10px] text-muted uppercase tracking-wider">{isAz ? 'İzah Dərinliyi' : 'Depth'}</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">Senior / Staff</div>
            </div>
          </div>
        </div>

        {/* 2. Filter Bar & Search Controls */}
        <div className="space-y-4">
          {/* Module Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedModule('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shrink-0 cursor-pointer border',
                selectedModule === 'all'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-line text-muted hover:text-ink hover:border-outline'
              )}
            >
              {isAz ? 'Hamısı' : 'All'} ({moduleCounts['all'] || 0})
            </button>

            {modules.map((m) => {
              const isSelected = selectedModule === m.id;
              const count = moduleCounts[m.id] || 0;
              const Icon = MODULE_ICONS[m.id] || Database;
              const color = MODULE_COLORS[m.id] || { bg: 'bg-surface', text: 'text-ink', border: 'border-line' };

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModule(m.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shrink-0 cursor-pointer border',
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface border-line text-muted hover:text-ink hover:border-outline'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : color.text)} />
                  <span>{t(m.title)}</span>
                  <span className={cn('text-[10px] px-1 py-0.2 rounded', isSelected ? 'bg-white/20' : 'bg-surface-2')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAz ? 'Suallarda və ya açar sözlərdə axtar (məs: shuffle, ACID, CDC)...' : 'Search questions, keywords (e.g. shuffle, ACID, CDC)...'}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-line bg-surface text-xs font-sans text-ink placeholder-muted focus:border-primary focus:outline-none transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-2 text-muted hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Expand / Collapse All & Level Filter */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              {/* Level Dropdown / Pills */}
              <div className="inline-flex p-0.5 rounded-lg border border-line bg-surface text-[11px] font-mono">
                {['all', 'junior', 'middle', 'senior'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition capitalize cursor-pointer',
                      selectedLevel === lvl
                        ? 'bg-surface-2 text-ink font-bold shadow-2xs'
                        : 'text-muted hover:text-ink'
                    )}
                  >
                    {lvl === 'all' ? (isAz ? 'Bütün' : 'All') : lvl}
                  </button>
                ))}
              </div>

              {/* Expand / Collapse All Toggle */}
              <button
                type="button"
                onClick={allExpanded ? handleCollapseAll : handleExpandAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-surface-2 text-xs font-mono font-medium text-ink-2 transition cursor-pointer shadow-2xs"
              >
                {allExpanded ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-muted" />
                    <span>{isAz ? 'Hamısını Bağla' : 'Collapse All'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>{isAz ? 'Hamısını Aç' : 'Expand All'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Questions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted font-mono text-xs gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{isAz ? 'Müsahibə sualları yüklənir...' : 'Loading interview questions...'}</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface-low p-12 text-center space-y-3">
            <HelpCircle className="h-8 w-8 text-muted mx-auto" />
            <h3 className="font-bold text-ink text-base">
              {isAz ? 'Axtarışa uyğun sual tapılmadı' : 'No matching questions found'}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {isAz ? 'Axtarış sözünü dəyişin və ya modul filtrini sıfırlayın.' : 'Try adjusting your search terms or filter selection.'}
            </p>
            <button
              onClick={() => {
                setSelectedModule('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-line bg-surface text-xs font-mono text-primary font-bold hover:bg-surface-2 transition cursor-pointer"
            >
              {isAz ? 'Filtrləri Sıfırla' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
              <span>
                {filteredQuestions.length} {isAz ? 'sual göstərilir' : 'questions found'}
              </span>
              <span>
                {isAz ? 'Özünüzü sınamaq üçün sualın cavabını açın' : 'Click to reveal answers & test yourself'}
              </span>
            </div>

            {filteredQuestions.map((q, idx) => {
              const cardKey = `${q.module_id}:${q.lesson_id}`;
              const isExpanded = !!expandedCards[cardKey];
              const Icon = MODULE_ICONS[q.module_id] || Database;
              const color = MODULE_COLORS[q.module_id] || { bg: 'bg-surface', text: 'text-ink', border: 'border-line' };

              return (
                <div
                  key={cardKey}
                  className={cn(
                    'rounded-2xl border transition-all duration-200 bg-surface-low overflow-hidden shadow-2xs',
                    isExpanded ? 'border-primary/40 shadow-xs' : 'border-line hover:border-outline'
                  )}
                >
                  {/* Question Card Header (Click to toggle) */}
                  <div
                    onClick={() => toggleCard(cardKey)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col gap-3 select-none"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      {/* Left: Module & Lesson Badges */}
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border', color.bg, color.text, color.border)}>
                          <Icon className="h-3 w-3" />
                          <span>{t(q.module_title)}</span>
                        </span>

                        <span className="text-muted text-[11px]">
                          {isAz ? 'Dərs' : 'Lesson'} {String(q.lesson_order).padStart(2, '0')}: {t(q.lesson_title)}
                        </span>
                      </div>

                      {/* Right: Level & Expand Arrow */}
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                          q.level === 'senior' 
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : q.level === 'middle'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        )}>
                          {q.level}
                        </span>

                        <span className="p-1 rounded-md text-muted hover:text-ink">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface border border-line text-primary font-mono text-xs font-bold">
                        Q
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-ink leading-snug">
                        {t(q.question)}
                      </h2>
                    </div>

                    {/* Action Hint / Link to Lesson */}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-muted">
                      <span className="inline-flex items-center gap-1 text-primary hover:underline">
                        {isExpanded ? (isAz ? 'Cavabı gizlət' : 'Hide answer') : (isAz ? 'Cavabı göstər (Özünü sına)' : 'Reveal answer')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLesson(q.module_id, q.lesson_id);
                        }}
                        className="inline-flex items-center gap-1 text-muted hover:text-ink transition cursor-pointer"
                        title={isAz ? 'Bu dərsin arxitektura sxeminə və koduna bax' : 'Open lesson and architecture diagram'}
                      >
                        <span>{isAz ? 'Dərsin Arxitekturasına Bax' : 'View Lesson Architecture'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Answer Drawer */}
                  {isExpanded && (
                    <div className="border-t border-line/80 bg-surface/50 p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
                      
                      {/* Authoritative Technical Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                          <span>{isAz ? 'DƏRİN TEXNİKİ İZAH VƏ CAVAB' : 'AUTHORITATIVE TECHNICAL ANSWER'}</span>
                        </div>
                        <div className="text-xs sm:text-[13px] leading-relaxed text-ink-2 font-sans space-y-3 bg-surface-lowest p-4 rounded-xl border border-line">
                          <Markdown source={t(q.answer)} idScope={`iq-ans-${cardKey}-`} />
                        </div>
                      </div>

                      {/* Senior Interviewer Tips Box */}
                      {q.interviewer_tips && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                          <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            <span>{isAz ? 'SENIOR MÜSAHİBƏÇİ İPUCU' : 'SENIOR INTERVIEWER TIP'}</span>
                          </div>
                          <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                            {t(q.interviewer_tips)}
                          </p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectLesson(q.module_id, q.lesson_id)}
                          className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <span>{isAz ? 'Dərsi & Sxemi Tam Oxu' : 'Study Full Lesson & Diagram'}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
