'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProgressContextType {
  completedLessons: Set<string>;
  toggleLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  xp: number;
  addXP: (amount: number) => void;
  streak: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [xp, setXP] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);

  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('de_completed_lessons');
      if (savedCompleted) {
        setCompletedLessons(new Set(JSON.parse(savedCompleted)));
      }
      const savedXP = localStorage.getItem('de_xp');
      if (savedXP) {
        setXP(parseInt(savedXP, 10) || 0);
      }
      const savedStreak = localStorage.getItem('de_streak');
      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10) || 1);
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
  }, []);

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
        // Award XP for completing lesson
        addXP(50);
      }
      localStorage.setItem('de_completed_lessons', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return completedLessons.has(lessonId);
  };

  const addXP = (amount: number) => {
    setXP(prev => {
      const next = prev + amount;
      localStorage.setItem('de_xp', next.toString());
      return next;
    });
  };

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        toggleLessonCompleted,
        isLessonCompleted,
        xp,
        addXP,
        streak
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
