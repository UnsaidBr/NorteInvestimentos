import { useState, useEffect, useCallback } from 'react';
import { usePlan } from '../context/PlanContext';

const STORAGE_KEY = 'norteinvest_favorites';
const EVENT_NAME = 'norteinvest-favorites-change';

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((s) => String(s).toUpperCase().trim()) : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(tickers: string[]): void {
  try {
    const clean = Array.from(new Set(tickers.map((s) => s.toUpperCase().trim())));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clean }));
  } catch (err) {
    console.warn('Erro ao salvar favoritos no localStorage:', err);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites());
  const { isPremium, limits, openWaitlistModal, canAddFavorite } = usePlan();

  useEffect(() => {
    const handleUpdate = () => {
      setFavorites(getStoredFavorites());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isFavorite = useCallback(
    (ticker: string) => {
      if (!ticker) return false;
      return favorites.includes(ticker.toUpperCase().trim());
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (ticker: string): boolean => {
      if (!ticker) return false;
      const normalized = ticker.toUpperCase().trim();
      const current = getStoredFavorites();
      const exists = current.includes(normalized);

      if (!exists && !canAddFavorite(current.length)) {
        openWaitlistModal(
          `Você atingiu o limite de ${limits.maxFavorites} favoritos no plano Gratuito. Desbloqueie favoritos ilimitados no Premium!`
        );
        return false;
      }

      let next: string[];
      if (exists) {
        next = current.filter((t) => t !== normalized);
      } else {
        next = [...current, normalized];
      }

      saveStoredFavorites(next);
      setFavorites(next);
      return !exists;
    },
    [canAddFavorite, limits.maxFavorites, openWaitlistModal]
  );

  const addFavorite = useCallback(
    (ticker: string): boolean => {
      if (!ticker) return false;
      const normalized = ticker.toUpperCase().trim();
      const current = getStoredFavorites();
      if (!current.includes(normalized)) {
        if (!canAddFavorite(current.length)) {
          openWaitlistModal(
            `Você atingiu o limite de ${limits.maxFavorites} favoritos no plano Gratuito. Desbloqueie favoritos ilimitados no Premium!`
          );
          return false;
        }
        const next = [...current, normalized];
        saveStoredFavorites(next);
        setFavorites(next);
        return true;
      }
      return true;
    },
    [canAddFavorite, limits.maxFavorites, openWaitlistModal]
  );

  const removeFavorite = useCallback((ticker: string) => {
    if (!ticker) return;
    const normalized = ticker.toUpperCase().trim();
    const current = getStoredFavorites();
    const next = current.filter((t) => t !== normalized);
    saveStoredFavorites(next);
    setFavorites(next);
  }, []);

  const clearFavorites = useCallback(() => {
    saveStoredFavorites([]);
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.length,
    isPremium,
    maxFavorites: limits.maxFavorites,
  };
}

