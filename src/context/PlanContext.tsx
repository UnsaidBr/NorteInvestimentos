import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PlanTier, PlanLimits, PlanContextType } from '../types/plan';

const STORAGE_KEY_PLAN = 'norteinvest_user_plan';
const STORAGE_KEY_WAITLIST = 'norteinvest_waitlist_emails';
const STORAGE_KEY_AI_PREFIX = 'norteinvest_ai_usage_';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Plan state (default: 'free')
  const [plan, setPlanState] = useState<PlanTier>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLAN);
      if (stored === 'premium' || stored === 'free') {
        return stored;
      }
      return 'free';
    } catch {
      return 'free';
    }
  });

  const isPremium = plan === 'premium';

  // AI Usage tracking per day
  const todayKey = useMemo(() => `${STORAGE_KEY_AI_PREFIX}${getTodayString()}`, []);
  const [aiUsageToday, setAiUsageToday] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(todayKey);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Waitlist Modal state
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistFeatureReason, setWaitlistFeatureReason] = useState<string | undefined>(undefined);
  const [isWaitlistSubscribed, setIsWaitlistSubscribed] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('norteinvest_has_joined_waitlist'));
    } catch {
      return false;
    }
  });

  const setPlan = useCallback((newPlan: PlanTier) => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAN, newPlan);
    } catch (err) {
      console.warn('Erro ao salvar plano no localStorage:', err);
    }
    setPlanState(newPlan);
  }, []);

  const togglePlan = useCallback(() => {
    setPlan(plan === 'premium' ? 'free' : 'premium');
  }, [plan, setPlan]);

  // Limits based on plan
  const limits: PlanLimits = useMemo(() => {
    if (isPremium) {
      return {
        maxFilters: Infinity,
        maxFavorites: Infinity,
        maxCompareAssets: 4,
        maxAiDaily: Infinity,
        canExportCsv: true,
        canEmailAlerts: true,
      };
    }
    return {
      maxFilters: 3,
      maxFavorites: 5,
      maxCompareAssets: 2,
      maxAiDaily: 3,
      canExportCsv: false,
      canEmailAlerts: false,
    };
  }, [isPremium]);

  const aiLimitToday = limits.maxAiDaily;
  const canUseAi = isPremium || aiUsageToday < aiLimitToday;

  const recordAiUsage = useCallback((): boolean => {
    if (isPremium) return true;

    try {
      const next = aiUsageToday + 1;
      localStorage.setItem(todayKey, String(next));
      setAiUsageToday(next);
      return true;
    } catch {
      return true;
    }
  }, [isPremium, aiUsageToday, todayKey]);

  const resetAiUsage = useCallback(() => {
    try {
      localStorage.removeItem(todayKey);
      setAiUsageToday(0);
    } catch (err) {
      console.warn('Erro ao resetar contador de IA:', err);
    }
  }, [todayKey]);

  const openWaitlistModal = useCallback((reason?: string) => {
    setWaitlistFeatureReason(reason);
    setIsWaitlistModalOpen(true);
  }, []);

  const closeWaitlistModal = useCallback(() => {
    setIsWaitlistModalOpen(false);
    setWaitlistFeatureReason(undefined);
  }, []);

  const joinWaitlist = useCallback(
    async (email: string, featureInterest?: string): Promise<{ success: boolean; message: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, message: 'Por favor, informe um endereço de e-mail válido.' };
      }

      try {
        // 1. Save locally
        const existingRaw = localStorage.getItem(STORAGE_KEY_WAITLIST);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const entry = {
          email: cleanEmail,
          featureInterest: featureInterest || waitlistFeatureReason || 'Geral',
          createdAt: new Date().toISOString(),
        };

        // 1. Envia ao servidor PRIMEIRO. Só confirma se o servidor realmente gravou.
        let serverOk = false;
        let serverMsg = '';
        try {
          const res = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          });
          const data = await res.json().catch(() => null);
          serverOk = res.ok && !!data?.success;
          serverMsg = (data && data.error) || '';
        } catch {
          serverOk = false;
        }

        if (!serverOk) {
          return {
            success: false,
            message: serverMsg || 'Não foi possível registrar seu e-mail agora. Ele NÃO foi salvo. Tente novamente em instantes.',
          };
        }

        // 2. Servidor confirmou: guarda cópia local só para lembrar que o usuário já entrou
        const filtered = existingList.filter((item: any) => item.email !== cleanEmail);
        filtered.push(entry);
        localStorage.setItem(STORAGE_KEY_WAITLIST, JSON.stringify(filtered));
        localStorage.setItem('norteinvest_has_joined_waitlist', 'true');
        setIsWaitlistSubscribed(true);

        return {
          success: true,
          message: 'Você entrou na lista de espera prioritária! Avisaremos assim que os convites forem liberados.',
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Erro ao registrar e-mail na lista de espera.',
        };
      }
    },
    [waitlistFeatureReason]
  );

  const canAddFavorite = useCallback(
    (currentCount: number): boolean => {
      if (isPremium) return true;
      return currentCount < limits.maxFavorites;
    },
    [isPremium, limits.maxFavorites]
  );

  const canAddCompareAsset = useCallback(
    (currentCount: number): boolean => {
      if (isPremium) return currentCount < 4;
      return currentCount < limits.maxCompareAssets;
    },
    [isPremium, limits.maxCompareAssets]
  );

  const canAddFilter = useCallback(
    (currentCount: number): boolean => {
      if (isPremium) return true;
      return currentCount < limits.maxFilters;
    },
    [isPremium, limits.maxFilters]
  );

  const value = useMemo<PlanContextType>(
    () => ({
      plan,
      isPremium,
      setPlan,
      togglePlan,
      limits,
      aiUsageToday,
      aiLimitToday,
      canUseAi,
      recordAiUsage,
      resetAiUsage,
      isWaitlistModalOpen,
      waitlistFeatureReason,
      openWaitlistModal,
      closeWaitlistModal,
      isWaitlistSubscribed,
      joinWaitlist,
      canAddFavorite,
      canAddCompareAsset,
      canAddFilter,
    }),
    [
      plan,
      isPremium,
      setPlan,
      togglePlan,
      limits,
      aiUsageToday,
      aiLimitToday,
      canUseAi,
      recordAiUsage,
      resetAiUsage,
      isWaitlistModalOpen,
      waitlistFeatureReason,
      openWaitlistModal,
      closeWaitlistModal,
      isWaitlistSubscribed,
      joinWaitlist,
      canAddFavorite,
      canAddCompareAsset,
      canAddFilter,
    ]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export function usePlan(): PlanContextType {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan deve ser utilizado dentro de um <PlanProvider>');
  }
  return context;
}
