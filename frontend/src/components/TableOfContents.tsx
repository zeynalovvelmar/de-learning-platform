'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { AlignLeft } from 'lucide-react';

interface TocItem {
  id: string;
  label: { az: string; en: string };
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const { language } = useLanguage();
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');
  const isAz = language === 'az';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
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

  if (!items || items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0 py-8 pl-6 pr-2 text-xs">
      <div className="sticky top-20">
        <div className="flex items-center gap-1.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <AlignLeft className="h-3 w-3" />
          <span>{isAz ? 'Bu Səhifədə' : 'On This Page'}</span>
        </div>

        <ul className="mt-2 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const text = item.label[language] || item.label.en;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`-ml-px block w-full truncate border-l-2 py-1 pl-3 text-left transition ${
                    isActive
                      ? 'border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
