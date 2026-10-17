'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';
import { 
  Sun, 
  Moon, 
  Menu, 
  Database,
  Search,
  Home,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onGoHome: () => void;
  isHome: boolean;
  activeModuleTitle?: string;
  activeLessonTitle?: string;
  onOpenSearch?: () => void;
  onOpenFlashcards?: () => void;
}

export function Navbar({ 
  onToggleSidebar, 
  onGoHome, 
  isHome, 
  activeModuleTitle, 
  activeLessonTitle,
  onOpenSearch,
  onOpenFlashcards
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAz = language === 'az';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo - clicking navigates to Home Hub */}
          <button
            onClick={onGoHome}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            title={isAz ? 'Ana Səhifəyə Qayıt' : 'Back to Home'}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900 transition-transform group-hover:scale-105">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                <span className="text-sm font-extrabold tracking-tight">DataEng</span>
                <span className="rounded bg-zinc-100 px-1 py-0.2 font-mono text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  HUB
                </span>
              </div>
            </div>
          </button>

          {/* Breadcrumb indicator in header if reading a lesson */}
          {!isHome && activeModuleTitle && (
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
              <span className="text-zinc-400">/</span>
              <span className="font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-[140px]">
                {activeModuleTitle}
              </span>
              {activeLessonTitle && (
                <>
                  <span className="text-zinc-400">/</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                    {activeLessonTitle}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Search, Home, Language, Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Home navigation button if currently inside a lesson */}
          {!isHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
              title={isAz ? 'Giriş İcmalına Qayıt' : 'Back to Overview'}
            >
              <Home className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">{isAz ? 'İcmal' : 'Overview'}</span>
            </button>
          )}

          {/* Flashcards Modal trigger if inside lesson with cards */}
          {onOpenFlashcards && !isHome && (
            <button
              onClick={onOpenFlashcards}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isAz ? 'Kartlar' : 'Cards'}</span>
            </button>
          )}

          {/* Language Toggle: AZ / EN */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setLanguage('az')}
              className={`rounded-md px-2 py-0.5 text-xs font-bold transition ${
                isAz
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              AZ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-md px-2 py-0.5 text-xs font-bold transition ${
                !isAz
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? (isAz ? 'İşıqlı rejim' : 'Light Mode') : (isAz ? 'Qaranlıq rejim' : 'Dark Mode')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
