export type PlanTier = 'free' | 'premium';

export interface PlanLimits {
  maxFilters: number;
  maxFavorites: number;
  maxCompareAssets: number;
  maxAiDaily: number;
  canExportCsv: boolean;
  canEmailAlerts: boolean;
}

export interface WaitlistEntry {
  email: string;
  featureInterest?: string;
  createdAt: string;
}

export interface PlanContextType {
  plan: PlanTier;
  isPremium: boolean;
  setPlan: (plan: PlanTier) => void;
  togglePlan: () => void;
  limits: PlanLimits;

  // AI Usage Tracking
  aiUsageToday: number;
  aiLimitToday: number;
  canUseAi: boolean;
  recordAiUsage: () => boolean;
  resetAiUsage: () => void;

  // Waitlist Modal Controls
  isWaitlistModalOpen: boolean;
  waitlistFeatureReason?: string;
  openWaitlistModal: (reason?: string) => void;
  closeWaitlistModal: () => void;
  isWaitlistSubscribed: boolean;
  joinWaitlist: (email: string, featureInterest?: string) => Promise<{ success: boolean; message: string }>;

  // Permission checkers
  canAddFavorite: (currentCount: number) => boolean;
  canAddCompareAsset: (currentCount: number) => boolean;
  canAddFilter: (currentCount: number) => boolean;
}
