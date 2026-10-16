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
  Languages, 
  Menu, 
  X,
  Database,
  ExternalLink
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <span>DataEng</span>
                <span className="rounded bg-blue-100 px-1 py-0.2 text-[10px] font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  .AZ
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                {language === 'az' ? 'Mühəndislik Platforması' : 'Engineering Academy'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Gamification & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Master Flashcards Button */}
          {onOpenFlashcards && (
            <button
              onClick={onOpenFlashcards}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{language === 'az' ? 'Flashcard Kartları' : 'Flashcards'}</span>
            </button>
          )}

          {/* Gamification Stats: Streak & XP */}
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400" title="Daily Streak">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{streak} {language === 'az' ? 'gün' : 'd'}</span>
            </div>
            <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400" title="Total XP">
              <Award className="h-4 w-4 text-blue-500" />
              <span>{xp} XP</span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setLanguage('az')}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                language === 'az'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              AZ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                language === 'en'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
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
