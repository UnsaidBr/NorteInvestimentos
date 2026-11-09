import { useState, useEffect, useCallback } from 'react';
import { PortfolioPosition } from '../types/portfolio';
import { portfolioManager, AssetInput, UpdateAssetInput } from '../services/portfolioManager';

export function usePortfolio() {
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    return portfolioManager.getAll();
  });

  // Subscribe to changes in portfolioManager (supports multi-tab and internal updates)
  useEffect(() => {
    const unsubscribe = portfolioManager.subscribe((updatedPositions) => {
      setPositions(updatedPositions);
    });
    return unsubscribe;
  }, []);

  const addPosition = useCallback((newPos: AssetInput | Omit<PortfolioPosition, 'id' | 'createdAt'>) => {
    portfolioManager.addPosition(newPos);
  }, []);

  const updatePosition = useCallback((id: string, updates: UpdateAssetInput | Partial<PortfolioPosition>) => {
    portfolioManager.updatePosition(id, updates);
  }, []);

  const deletePosition = useCallback((id: string) => {
    portfolioManager.deletePosition(id);
  }, []);

  const resetToDemo = useCallback(() => {
    portfolioManager.resetToDemo();
  }, []);

  const clearAll = useCallback(() => {
    portfolioManager.clear();
  }, []);

  const exportBackup = useCallback(() => {
    const jsonStr = portfolioManager.exportToJson();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `norteinvest-carteira-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, []);

  const exportCsv = useCallback(() => {
    const csvContent = portfolioManager.exportToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `norteinvest-carteira-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importBackup = useCallback((jsonString: string): boolean => {
    const result = portfolioManager.importFromJson(jsonString);
    return result.success;
  }, []);

  return {
    positions,
    addPosition,
    updatePosition,
    deletePosition,
    resetToDemo,
    clearAll,
    exportBackup,
    exportCsv,
    importBackup,
    manager: portfolioManager,
  };
}
