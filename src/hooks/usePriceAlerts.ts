import { useState, useEffect, useCallback, useMemo } from 'react';
import { PriceAlert, CreateAlertInput, UpdateAlertInput } from '../types/priceAlert';
import { priceAlertService } from '../services/priceAlertService';

export function usePriceAlerts(currentPrices: Record<string, number> = {}) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => priceAlertService.getAll());

  // Assinar atualizações do serviço (multi-aba e eventos locais)
  useEffect(() => {
    const unsubscribe = priceAlertService.subscribe((updatedAlerts) => {
      setAlerts(updatedAlerts);
    });
    return unsubscribe;
  }, []);

  // Avaliar alertas continuamente quando as cotações de mercado atualizarem
  useEffect(() => {
    if (Object.keys(currentPrices).length === 0) return;
    priceAlertService.evaluateAlerts(currentPrices);
  }, [currentPrices]);

  // Alertas ativos em monitoramento
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.active && !a.isTriggered);
  }, [alerts]);

  // Alertas que atingiram o alvo e ainda não foram dispensados
  const triggeredAlerts = useMemo(() => {
    return alerts.filter((a) => a.isTriggered && !a.dismissed);
  }, [alerts]);

  // Histórico de todos os alertas disparados
  const allTriggeredAlerts = useMemo(() => {
    return alerts.filter((a) => a.isTriggered);
  }, [alerts]);

  const createAlert = useCallback((input: CreateAlertInput) => {
    return priceAlertService.createAlert(input);
  }, []);

  const updateAlert = useCallback((id: string, updates: UpdateAlertInput) => {
    priceAlertService.updateAlert(id, updates);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    priceAlertService.deleteAlert(id);
  }, []);

  const toggleActive = useCallback((id: string) => {
    priceAlertService.toggleActive(id);
  }, []);

  const dismissTrigger = useCallback((id: string) => {
    priceAlertService.dismissTrigger(id);
  }, []);

  const dismissAllTriggered = useCallback(() => {
    priceAlertService.dismissAllTriggered();
  }, []);

  const reactivateAlert = useCallback((id: string, newTargetPrice?: number) => {
    priceAlertService.reactivateAlert(id, newTargetPrice);
  }, []);

  const playTestChime = useCallback(() => {
    priceAlertService.playAlertChime();
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    return await priceAlertService.requestNotificationPermission();
  }, []);

  const getAlertsForTicker = useCallback(
    (ticker: string) => {
      const clean = ticker.toUpperCase().trim();
      return alerts.filter((a) => a.ticker.toUpperCase().trim() === clean);
    },
    [alerts]
  );

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    allTriggeredAlerts,
    hasTriggeredAlerts: triggeredAlerts.length > 0,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleActive,
    dismissTrigger,
    dismissAllTriggered,
    reactivateAlert,
    playTestChime,
    requestNotificationPermission,
    getAlertsForTicker,
  };
}
