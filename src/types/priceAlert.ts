export type AlertCondition = 'ABOVE_OR_EQUAL' | 'BELOW_OR_EQUAL';

export interface PriceAlert {
  id: string;
  ticker: string;
  assetName: string;
  targetPrice: number;
  condition: AlertCondition;
  initialPrice: number;
  createdAt: string;
  active: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  note?: string;
  dismissed?: boolean;
}

export interface CreateAlertInput {
  ticker: string;
  assetName?: string;
  targetPrice: number;
  condition: AlertCondition;
  initialPrice: number;
  note?: string;
}

export interface UpdateAlertInput {
  targetPrice?: number;
  condition?: AlertCondition;
  note?: string;
  active?: boolean;
}
