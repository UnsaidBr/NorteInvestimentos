import { PriceAlert, CreateAlertInput, UpdateAlertInput } from '../types/priceAlert';

export const PRICE_ALERTS_STORAGE_KEY = 'norteinvest_price_alerts_v1';
export const PRICE_ALERTS_EVENT = 'norteinvest:alerts_updated';

type AlertListener = (alerts: PriceAlert[]) => void;

class PriceAlertService {
  private storageKey: string;
  private listeners: Set<AlertListener> = new Set();
  private lastChimeTime = 0;

  constructor(storageKey: string = PRICE_ALERTS_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.setupStorageListener();
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.notifyListeners();
      }
    });

    window.addEventListener(PRICE_ALERTS_EVENT, () => {
      this.notifyListeners();
    });
  }

  private notifyListeners(): void {
    const current = this.getAll();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('[PriceAlertService] Listener error:', err);
      }
    });
  }

  private broadcastChange(alerts: PriceAlert[]): void {
    this.notifyListeners();
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent(PRICE_ALERTS_EVENT, { detail: alerts }));
      } catch {
        // Ignorar em ambientes restritos
      }
    }
  }

  public subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAll(): PriceAlert[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[PriceAlertService] Erro ao carregar alertas:', err);
      return [];
    }
  }

  public saveAll(alerts: PriceAlert[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(alerts));
      this.broadcastChange(alerts);
    } catch (err) {
      console.error('[PriceAlertService] Erro ao salvar alertas:', err);
    }
  }

  public getAlertsForTicker(ticker: string): PriceAlert[] {
    const clean = ticker.toUpperCase().trim();
    return this.getAll().filter((a) => a.ticker.toUpperCase().trim() === clean);
  }

  public createAlert(input: CreateAlertInput): PriceAlert {
    const alerts = this.getAll();
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const newAlert: PriceAlert = {
      id,
      ticker: input.ticker.toUpperCase().trim(),
      assetName: input.assetName?.trim() || input.ticker.toUpperCase().trim(),
      targetPrice: Math.max(0.01, Number(input.targetPrice)),
      condition: input.condition,
      initialPrice: Number(input.initialPrice) || 0,
      createdAt: new Date().toISOString(),
      active: true,
      isTriggered: false,
      note: input.note?.trim() || undefined,
      dismissed: false,
    };

    const updated = [newAlert, ...alerts];
    this.saveAll(updated);
    return newAlert;
  }

  public updateAlert(id: string, updates: UpdateAlertInput): void {
    const alerts = this.getAll();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) return;

    const existing = alerts[index];
    const targetChanged =
      updates.targetPrice !== undefined && updates.targetPrice !== existing.targetPrice;

    alerts[index] = {
      ...existing,
      ...updates,
      // Se o preço alvo ou condição mudar, reativa o alerta se estava disparado
      ...(targetChanged
        ? {
            isTriggered: false,
            triggeredAt: undefined,
            triggeredPrice: undefined,
            dismissed: false,
            active: true,
          }
        : {}),
    };

    this.saveAll(alerts);
  }

  public deleteAlert(id: string): void {
    const alerts = this.getAll();
    const filtered = alerts.filter((a) => a.id !== id);
    this.saveAll(filtered);
  }

  public toggleActive(id: string): void {
    const alerts = this.getAll();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) return;

    alerts[index].active = !alerts[index].active;
    this.saveAll(alerts);
  }

  public dismissTrigger(id: string): void {
    const alerts = this.getAll();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) return;

    alerts[index].dismissed = true;
    this.saveAll(alerts);
  }

  public dismissAllTriggered(): void {
    const alerts = this.getAll();
    let changed = false;
    alerts.forEach((a) => {
      if (a.isTriggered && !a.dismissed) {
        a.dismissed = true;
        changed = true;
      }
    });
    if (changed) {
      this.saveAll(alerts);
    }
  }

  public reactivateAlert(id: string, newTargetPrice?: number): void {
    const alerts = this.getAll();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) return;

    alerts[index].isTriggered = false;
    alerts[index].triggeredAt = undefined;
    alerts[index].triggeredPrice = undefined;
    alerts[index].dismissed = false;
    alerts[index].active = true;

    if (newTargetPrice && newTargetPrice > 0) {
      alerts[index].targetPrice = newTargetPrice;
    }

    this.saveAll(alerts);
  }

  public clearAll(): void {
    this.saveAll([]);
  }

  /**
   * Avalia todos os alertas ativos em relação às cotações de mercado atuais
   * Retorna os alertas recém-disparados nesta verificação
   */
  public evaluateAlerts(currentPrices: Record<string, number>): {
    newlyTriggered: PriceAlert[];
    allTriggered: PriceAlert[];
  } {
    const alerts = this.getAll();
    if (alerts.length === 0) {
      return { newlyTriggered: [], allTriggered: [] };
    }

    let hasChanges = false;
    const newlyTriggered: PriceAlert[] = [];
    const allTriggered: PriceAlert[] = [];

    alerts.forEach((alert) => {
      const cleanTicker = alert.ticker.toUpperCase().trim();
      const currentPrice = currentPrices[cleanTicker];

      if (alert.isTriggered) {
        allTriggered.push(alert);
        return;
      }

      if (!alert.active || currentPrice === undefined || currentPrice <= 0) {
        return;
      }

      let triggered = false;
      if (alert.condition === 'ABOVE_OR_EQUAL' && currentPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'BELOW_OR_EQUAL' && currentPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        alert.isTriggered = true;
        alert.triggeredAt = new Date().toISOString();
        alert.triggeredPrice = currentPrice;
        alert.dismissed = false;
        hasChanges = true;
        newlyTriggered.push(alert);
        allTriggered.push(alert);
      }
    });

    if (hasChanges) {
      this.saveAll(alerts);

      // Reproduzir som discreto e emitir notificação no primeiro disparo
      if (newlyTriggered.length > 0) {
        this.playAlertChime();
        this.sendSystemNotification(newlyTriggered);
      }
    }

    return { newlyTriggered, allTriggered };
  }

  /**
   * Toca um chime sutil com Web Audio API em frequência harmônica (Private Banking sound)
   */
  public playAlertChime(): void {
    if (typeof window === 'undefined') return;

    // Throttle de 2 segundos para não duplicar som
    const now = Date.now();
    if (now - this.lastChimeTime < 2000) return;
    this.lastChimeTime = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Acorde harmônico A5 (880Hz) com quinta E6 (1320Hz)
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          // ignore
        }
      }, 1000);
    } catch {
      // Ignorar caso navegador bloqueie Web Audio
    }
  }

  /**
   * Envia notificação do sistema operacional se o usuário tiver concedido permissão
   */
  private sendSystemNotification(triggeredList: PriceAlert[]): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      triggeredList.forEach((alert) => {
        const condLabel = alert.condition === 'ABOVE_OR_EQUAL' ? 'subiu para' : 'caiu para';
        new Notification(`Norte Invest: Alerta de ${alert.ticker}`, {
          body: `A cotação ${condLabel} R$ ${alert.triggeredPrice?.toFixed(2)} (Alvo: R$ ${alert.targetPrice.toFixed(2)})`,
          icon: '/favicon.ico',
        });
      });
    }
  }

  /**
   * Solicita permissão para notificações nativas
   */
  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }
}

export const priceAlertService = new PriceAlertService();
