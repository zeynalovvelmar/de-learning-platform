'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LocalizedText } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text?: LocalizedText | Record<string, string> | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('az');

  useEffect(() => {
    const saved = localStorage.getItem('de_platform_lang') as Language;
    if (saved === 'az' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('de_platform_lang', lang);
  };

  const t = (text?: LocalizedText | Record<string, string> | null): string => {
    if (!text) return '';
    return text[language] || text.en || text.az || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
