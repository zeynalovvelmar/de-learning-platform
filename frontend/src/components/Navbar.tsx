'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { 
  Sun, 
  Moon, 
  Flame, 
  Award, 
  BookOpen, 
  Menu, 
  Database,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenFlashcards?: () => void;
}

export function Navbar({ onToggleSidebar, onOpenFlashcards }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { xp, streak, completedLessons } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute Rank based on XP
  const getRank = (currentXP: number) => {
    if (currentXP >= 1500) return language === 'az' ? 'Staff DE' : 'Staff DE';
    if (currentXP >= 800) return language === 'az' ? 'Senior DE' : 'Senior DE';
    if (currentXP >= 300) return language === 'az' ? 'Mid DE' : 'Mid DE';
    return language === 'az' ? 'Junior DE' : 'Junior DE';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden transition"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/25">
              <Database className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                <span className="text-base sm:text-lg">DataEng</span>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  .AZ
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block tracking-wide">
                {language === 'az' ? 'Data Mühəndisliyi Platforması' : 'Data Engineering Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Gamification & Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Master Flashcards Button */}
          {onOpenFlashcards && (
            <button
              onClick={onOpenFlashcards}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-purple-200/90 bg-purple-50/70 px-3.5 py-1.5 text-xs font-bold text-purple-700 shadow-2xs transition hover:bg-purple-100 hover:shadow-xs dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <BookOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>{language === 'az' ? 'Master Deck' : 'Master Deck'}</span>
            </button>
          )}

          {/* Gamification Stats: Streak & XP with Rank */}
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/90 bg-zinc-50/90 px-3 py-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400" title="Daily Streak">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streak} {language === 'az' ? 'gün' : 'd'}</span>
            </div>
            <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400" title="Total XP">
              <Award className="h-3.5 w-3.5 text-blue-500" />
              <span>{xp} XP</span>
              <span className="hidden sm:inline rounded bg-blue-100/70 dark:bg-blue-950 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
                {getRank(xp)}
              </span>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center rounded-xl border border-zinc-200/90 bg-zinc-100/80 p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <button
              onClick={() => setLanguage('az')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                language === 'az'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              AZ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/90 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition shadow-2xs"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
