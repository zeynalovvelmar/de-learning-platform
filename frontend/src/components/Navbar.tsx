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
  Terminal,
  Play,
  Layers,
  Sparkles,
  Bookmark,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onGoHome: () => void;
  isHome: boolean;
  isInterviews?: boolean;
  onOpenInterviews?: () => void;
  activeModuleTitle?: string;
  activeLessonTitle?: string;
  onOpenSearch?: () => void;
  onOpenSandbox?: () => void;
  onOpenFlashcards?: () => void;
}

export function Navbar({ 
  onToggleSidebar, 
  onGoHome, 
  isHome, 
  isInterviews,
  onOpenInterviews,
  activeModuleTitle, 
  activeLessonTitle,
  onOpenSearch,
  onOpenSandbox,
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
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-[1720px] mx-auto">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink lg:hidden transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo - clicking navigates to Home Hub */}
          <button
            onClick={onGoHome}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            title={isAz ? 'Giriş İcmal Səhifəsinə Qayıt' : 'Back to Architecture Hub'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container/20 border border-primary/30 text-primary transition-transform group-hover:scale-105">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[15px] tracking-tight text-ink font-sans">DataForge</span>
              <span className="text-[14px] text-muted font-medium">Docs</span>
            </div>
          </button>

          {/* Breadcrumb path */}
          <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-line text-xs font-mono text-muted">
            {isInterviews ? (
              <>
                <span className="text-ink-2 font-medium">{isAz ? 'Karyera' : 'Career'}</span>
                <span className="text-outline/60">&gt;</span>
                <span className="text-primary font-semibold">{isAz ? 'Texniki Müsahibə Sualları' : 'Technical Interview Hub'}</span>
              </>
            ) : isHome ? (
              <>
                <span className="text-ink-2 font-medium">{isAz ? 'Kurrikulum' : 'Curriculum'}</span>
                <span className="text-outline/60">&gt;</span>
                <span className="text-primary font-semibold">{isAz ? 'Arxitektura Xəritəsi' : 'Architecture Roadmap'}</span>
              </>
            ) : (
              <>
                <span className="text-ink-2 font-medium truncate max-w-[150px]">{activeModuleTitle}</span>
                {activeLessonTitle && (
                  <>
                    <span className="text-outline/60">&gt;</span>
                    <span className="text-primary font-semibold truncate max-w-[220px]">{activeLessonTitle}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: Search pill */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-line bg-surface-lowest hover:border-outline text-muted text-xs transition"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>{isAz ? '87 dərs, sxem və mövzular üzrə axtar…' : 'Search 87 lessons, schemas, topics…'}</span>
            </span>
            <kbd className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded border border-line text-muted">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Section Tabs, Language, Theme, Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Section links */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-muted mr-1">
            <button 
              onClick={onGoHome}
              className={cn(
                'transition hover:text-ink',
                isHome && !isInterviews ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-muted'
              )}
            >
              {isAz ? 'Modullar' : 'Modules'}
            </button>
            <button 
              onClick={onOpenInterviews}
              className={cn(
                'transition hover:text-ink flex items-center gap-1.5',
                isInterviews ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-muted'
              )}
            >
              <span>{isAz ? 'Müsahibə' : 'Interviews'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold border border-amber-500/20">
                87
              </span>
            </button>
            <button 
              onClick={onOpenSandbox}
              className="hover:text-ink transition"
            >
              Sandbox
            </button>
            <button 
              onClick={onGoHome}
              className="hover:text-ink transition"
            >
              {isAz ? 'Arxitektura' : 'Architecture'}
            </button>
          </nav>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isAz ? 'en' : 'az')}
            className="px-2 py-1 rounded border border-line bg-surface-low text-ink font-mono text-[11px] font-bold hover:bg-surface-2 transition"
            title={isAz ? 'Switch to English' : 'Azərbaycan dilinə keç'}
          >
            {isAz ? 'AZ' : 'EN'}
          </button>

          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-line bg-surface-low text-muted hover:text-ink hover:bg-surface-2 transition"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
            </button>
          )}

          {/* Interactive Terminal / Sandbox Icon */}
          <button
            onClick={onOpenSandbox}
            className="hidden sm:flex p-1.5 rounded-lg border border-line bg-surface-low text-muted hover:text-ink hover:bg-surface-2 transition"
            title={isAz ? 'İnteraktiv Kod Terminalı' : 'Interactive Terminal'}
          >
            <Terminal className="h-4 w-4" />
          </button>

          <div className="hidden sm:block h-4 w-px bg-line" />

          {/* Primary Action Button: Run Query / Open Sandbox */}
          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-zinc-950 font-bold text-xs shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">{isAz ? 'Sorğunu İcra Et' : 'Run Query'}</span>
            <span className="sm:hidden">{isAz ? 'İcra' : 'Run'}</span>
          </button>

          {/* Personal Study Avatar / Badge */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-high font-mono text-[10px] font-extrabold text-primary">
            DE
          </div>
        </div>
      </div>
    </header>
  );
}
