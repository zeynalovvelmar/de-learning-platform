'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { useProgress } from '@/context/progress-context';
import { Flashcard } from '@/types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Check, 
  Sparkles, 
  BookOpen,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  title?: string;
}

export function FlashcardModal({ isOpen, onClose, cards, title }: FlashcardModalProps) {
  const { language, t } = useLanguage();
  const { addXP } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
  }, [isOpen, cards]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, cards.length]);

  if (!isOpen || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkKnown = () => {
    if (!knownCards.has(currentIndex)) {
      setKnownCards((prev) => new Set(prev).add(currentIndex));
      addXP(10);
      if (knownCards.size + 1 === cards.length) {
        confetti({ particleCount: 70, spread: 60 });
      }
    }
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {title || (language === 'az' ? 'Yaddaş Kartları (Flashcards)' : 'Flashcards Deck')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar & count */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {language === 'az' ? 'Kart' : 'Card'} {currentIndex + 1} / {cards.length}
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {knownCards.size} {language === 'az' ? 'öyrənildi' : 'mastered'}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* Flip Card Canvas */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`group mt-6 min-h-[220px] sm:min-h-[260px] cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 flex flex-col justify-between select-none ${
            isFlipped
              ? 'border-purple-500/50 bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:border-purple-600/50 dark:from-purple-950/20 dark:to-indigo-950/10 shadow-lg shadow-purple-500/5'
              : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className={isFlipped ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 dark:text-zinc-500'}>
                {isFlipped ? (language === 'az' ? 'İzah / Cavab' : 'Explanation / Answer') : (language === 'az' ? 'Sual' : 'Question')}
              </span>
              <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                <RotateCw className="h-3.5 w-3.5" />
                <span>{language === 'az' ? 'Çevir (Boşluq)' : 'Flip (Space)'}</span>
              </div>
            </div>

            <div className="mt-4 text-base sm:text-lg font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
              {isFlipped ? t(currentCard.back) : t(currentCard.front)}
            </div>
          </div>

          <div className="text-right text-[11px] text-zinc-400">
            {language === 'az' ? 'Kartın arxasını görmək üçün klikləyin' : 'Click to flip card'}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleMarkKnown}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
          >
            <Check className="h-4 w-4" />
            <span>{language === 'az' ? 'Bilirəm (+10 XP)' : 'Mastered (+10 XP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
