'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';
import { 
  Sun, 
  Moon, 
  Menu, 
  Database,
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
}

export function Navbar({ 
  onToggleSidebar, 
  onGoHome, 
  isHome, 
  isInterviews,
  onOpenInterviews,
  activeModuleTitle, 
  activeLessonTitle,
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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onGoHome();
            }}
            className="group flex items-center gap-2.5 text-left focus:outline-none select-none cursor-pointer"
            title={isAz ? 'Giriş İcmal Səhifəsinə Qayıt' : 'Back to Architecture Hub'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container/20 border border-primary/30 text-primary transition-transform group-hover:scale-105">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[15px] tracking-tight text-ink font-sans">DataForge</span>
              <span className="text-[14px] text-muted font-medium">Docs</span>
            </div>
          </a>

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

        {/* Right: Section Tabs, Language, Theme, Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Main Navigation tabs */}
          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-muted">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onGoHome();
              }}
              className={cn(
                'px-2.5 py-1 rounded-md transition hover:text-ink cursor-pointer select-none',
                isHome && !isInterviews ? 'bg-surface text-primary font-bold border border-line shadow-2xs' : 'text-muted hover:bg-surface-2'
              )}
            >
              {isAz ? 'Modullar & Sxemlər' : 'Curriculum & Maps'}
            </a>
            <a 
              href="/interviews"
              onClick={(e) => {
                e.preventDefault();
                onOpenInterviews?.();
              }}
              className={cn(
                'px-2.5 py-1 rounded-md transition hover:text-ink flex items-center gap-1.5 cursor-pointer select-none',
                isInterviews ? 'bg-surface text-primary font-bold border border-line shadow-2xs' : 'text-muted hover:bg-surface-2'
              )}
            >
              <span>{isAz ? 'Müsahibə Mərkəzi' : 'Interview Hub'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold border border-amber-500/20">
                87
              </span>
            </a>
          </nav>

          <div className="h-4 w-px bg-line" />

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isAz ? 'en' : 'az')}
            className="px-2 py-1 rounded border border-line bg-surface-low text-ink font-mono text-[11px] font-bold hover:bg-surface-2 transition cursor-pointer"
            title={isAz ? 'Switch to English' : 'Azərbaycan dilinə keç'}
          >
            {isAz ? 'AZ' : 'EN'}
          </button>

          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-line bg-surface-low text-muted hover:text-ink hover:bg-surface-2 transition cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
            </button>
          )}

          {/* Personal Study Avatar / Badge */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-high font-mono text-[10px] font-extrabold text-primary">
            DE
          </div>
        </div>
      </div>
    </header>
  );
}
