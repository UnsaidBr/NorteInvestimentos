import { useState, useEffect, useCallback } from 'react';

const PROGRESS_STORAGE_KEY = 'norteinvest_completed_lessons_v1';

export function useLessonProgress(totalLessonsCount: number = 6) {
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleLessonCompleted = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      let updated: string[];
      if (prev.includes(lessonId)) {
        updated = prev.filter((id) => id !== lessonId);
      } else {
        updated = [...prev, lessonId];
      }
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao salvar progresso de aulas:', err);
      }
      return updated;
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessons.includes(lessonId),
    [completedLessons]
  );

  const resetProgress = useCallback(() => {
    setCompletedLessons([]);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round((completedLessons.length / Math.max(1, totalLessonsCount)) * 100)
  );

  return {
    completedLessons,
    isLessonCompleted,
    toggleLessonCompleted,
    resetProgress,
    completedCount: completedLessons.length,
    progressPercent,
  };
}
