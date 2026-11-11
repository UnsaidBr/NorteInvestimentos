import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseRealtimeConfigured } from '../services/supabaseClient';
import { portfolioManager } from '../services/portfolioManager';
import { PortfolioPosition, AssetCategory } from '../types/portfolio';

export type RealtimeSyncStatus = 'connected' | 'connecting' | 'disconnected' | 'local_only';

interface UseSupabasePortfolioRealtimeOptions {
  onPositionsChange?: (positions: PortfolioPosition[]) => void;
  onGoalChange?: (goalData: { goalAmount: number; manualDeposits: number; monthKey: string }) => void;
  userId?: string;
}

export function useSupabasePortfolioRealtime({
  onPositionsChange,
  onGoalChange,
  userId = 'anonymous',
}: UseSupabasePortfolioRealtimeOptions = {}) {
  const [syncStatus, setSyncStatus] = useState<RealtimeSyncStatus>(
    isSupabaseRealtimeConfigured ? 'connecting' : 'local_only'
  );
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isConfigured = isSupabaseRealtimeConfigured && !!supabase;
  const channelRef = useRef<any>(null);

  // Helper para converter registro do Supabase para PortfolioPosition
  const mapDbRecordToPosition = useCallback((record: any): PortfolioPosition => {
    return {
      id: String(record.id),
      ticker: String(record.ticker || '').toUpperCase().trim(),
      name: String(record.name || record.ticker || 'Ativo'),
      category: (record.category as AssetCategory) || 'acao',
      quantity: Number(record.quantity) || 0,
      averagePrice: Number(record.average_price ?? record.averagePrice ?? 0),
      createdAt: record.created_at
        ? new Date(record.created_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };
  }, []);

  // 1. Carregar dados iniciais do Supabase caso configurado
  const fetchInitialData = useCallback(async () => {
    if (!isConfigured || !supabase) return;

    try {
      setSyncStatus('connecting');

      // Buscar posições
      const { data: positionsData, error: positionsError } = await supabase
        .from('portfolio_positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (positionsError) {
        console.warn('[Supabase Realtime] Erro ao buscar posições iniciais:', positionsError.message);
        setSyncError(positionsError.message);
      } else if (positionsData && positionsData.length > 0) {
        const mappedPositions = positionsData.map(mapDbRecordToPosition);
        portfolioManager.saveAll(mappedPositions);
        if (onPositionsChange) onPositionsChange(mappedPositions);
        setLastSyncTime(new Date());
      }

      // Buscar metas
      const today = new Date();
      const currentMonthKey = `${today.getFullYear()}_${today.getMonth()}`;
      const { data: goalData, error: goalError } = await supabase
        .from('portfolio_goals')
        .select('*')
        .eq('month_key', currentMonthKey)
        .limit(1)
        .maybeSingle();

      if (!goalError && goalData && onGoalChange) {
        onGoalChange({
          goalAmount: Number(goalData.goal_amount) || 2500,
          manualDeposits: Number(goalData.manual_deposits) || 0,
          monthKey: goalData.month_key,
        });
      }

      setSyncStatus('connected');
      setSyncError(null);
    } catch (err: any) {
      console.warn('[Supabase Realtime] Falha na sincronização inicial:', err?.message || err);
      setSyncStatus('disconnected');
      setSyncError(err?.message || 'Falha de conexão com o banco de dados');
    }
  }, [isConfigured, mapDbRecordToPosition, onPositionsChange, onGoalChange]);

  // 2. Configurar Listener de Tempo Real (Realtime Channels)
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setSyncStatus('local_only');
      return;
    }

    // Carrega dados iniciais
    fetchInitialData();

    // Cria canal Realtime com listener para postgres_changes
    const channel = supabase
      .channel('portfolio-realtime-sync')
      // A) Escutar alterações nas posições da carteira
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_positions' },
        (payload) => {
          setLastSyncTime(new Date());

          const currentPositions = portfolioManager.getAll();

          const recordNew = payload.new as Record<string, any> | undefined;
          const recordOld = payload.old as Record<string, any> | undefined;

          if (payload.eventType === 'INSERT' && recordNew && recordNew.id) {
            const newPos = mapDbRecordToPosition(recordNew);
            const exists = currentPositions.some((p) => p.id === newPos.id);
            if (!exists) {
              const updated = [newPos, ...currentPositions];
              portfolioManager.saveAll(updated);
              if (onPositionsChange) onPositionsChange(updated);
            }
          } else if (payload.eventType === 'UPDATE' && recordNew && recordNew.id) {
            const updatedPos = mapDbRecordToPosition(recordNew);
            const updated = currentPositions.map((p) =>
              p.id === updatedPos.id ? updatedPos : p
            );
            portfolioManager.saveAll(updated);
            if (onPositionsChange) onPositionsChange(updated);
          } else if (payload.eventType === 'DELETE' && recordOld && recordOld.id) {
            const deletedId = String(recordOld.id);
            const updated = currentPositions.filter((p) => p.id !== deletedId);
            portfolioManager.saveAll(updated);
            if (onPositionsChange) onPositionsChange(updated);
          }
        }
      )
      // B) Escutar alterações nas metas financeiras
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_goals' },
        (payload) => {
          setLastSyncTime(new Date());

          const goalRecord = payload.new as Record<string, any> | undefined;
          if (goalRecord && onGoalChange) {
            onGoalChange({
              goalAmount: Number(goalRecord.goal_amount) || 2500,
              manualDeposits: Number(goalRecord.manual_deposits) || 0,
              monthKey: String(goalRecord.month_key || ''),
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('connected');
          setSyncError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setSyncStatus('disconnected');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isConfigured, fetchInitialData, mapDbRecordToPosition, onPositionsChange, onGoalChange]);

  // Função auxiliar para forçar sincronização manual
  const refreshFromDatabase = useCallback(async () => {
    if (isConfigured) {
      await fetchInitialData();
    }
  }, [isConfigured, fetchInitialData]);

  return {
    syncStatus,
    lastSyncTime,
    syncError,
    isRealtimeActive: syncStatus === 'connected',
    isLocalOnly: syncStatus === 'local_only',
    refreshFromDatabase,
  };
}

export default useSupabasePortfolioRealtime;
