'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { AlignLeft, Copy, Check, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  label: { az: string; en: string };
}

interface TableOfContentsProps {
  items: TocItem[];
  progressPercent?: number;
}

export function TableOfContents({ items, progressPercent = 65 }: TableOfContentsProps) {
  const { language } = useLanguage();
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const isAz = language === 'az';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const elem = document.getElementById(item.id);
        if (elem && elem.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveId(id);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-[240px] shrink-0 py-8 pl-6 pr-2 text-xs font-sans">
      <div className="sticky top-20 space-y-6">
        {/* Progress bar */}
        <div className="space-y-1.5 pb-4 border-b border-line">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted">
            <span>{isAz ? 'Tərəqqi' : 'Progress'}</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <div className="w-full bg-surface-2 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ON THIS PAGE Header & Navigation */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-outline">
            <AlignLeft className="h-3.5 w-3.5" />
            <span>{isAz ? 'BU SƏHİFƏDƏ' : 'ON THIS PAGE'}</span>
          </div>

          <ul className="space-y-1 border-l border-line">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const text = item.label[language] || item.label.en;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      '-ml-px block w-full truncate border-l-2 py-1 pl-3 text-left transition text-xs cursor-pointer',
                      isActive
                        ? 'border-primary font-semibold text-primary bg-primary/5 rounded-r'
                        : 'border-transparent text-muted hover:border-outline hover:text-ink'
                    )}
                  >
                    {text}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Share / Action Buttons */}
        <div className="pt-4 border-t border-line space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary font-bold">{isAz ? 'Kopyalandı!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted" />
                <span>{isAz ? 'Linki Kopyala' : 'Copy Page Link'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quiet Reference Tag */}
        <div className="text-[10px] font-mono text-muted/70 leading-relaxed pt-2">
          Published under MIT by DataForge Docs Engineering Core.
        </div>
      </div>
    </nav>
  );
}
