import { PortfolioPosition, AssetCategory } from '../types/portfolio';
import { INITIAL_DEMO_PORTFOLIO } from './portfolioService';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';
import { FII_DATASET } from '../data/fiiData';

export const PORTFOLIO_STORAGE_KEY = 'norteinvest_portfolio_v1';
export const PORTFOLIO_EVENT_NAME = 'norteinvest:portfolio_updated';

export interface AssetInput {
  ticker: string;
  quantity: number;
  avgPrice?: number;
  averagePrice?: number;
  name?: string;
  category?: AssetCategory;
  id?: string;
  createdAt?: string;
}

export interface UpdateAssetInput {
  ticker?: string;
  quantity?: number;
  avgPrice?: number;
  averagePrice?: number;
  name?: string;
  category?: AssetCategory;
}

export interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}

type PortfolioListener = (positions: PortfolioPosition[]) => void;

/**
 * Service to manage CRUD operations for user assets (ticker, quantity, avgPrice)
 * using browser localStorage as the primary persistence layer.
 */
export class PortfolioManager {
  private storageKey: string;
  private listeners: Set<PortfolioListener> = new Set();

  constructor(storageKey: string = PORTFOLIO_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.setupStorageEventListener();
  }

  /**
   * Listen to cross-tab storage events and custom internal events
   */
  private setupStorageEventListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.notifyListeners();
      }
    });

    window.addEventListener(PORTFOLIO_EVENT_NAME, () => {
      this.notifyListeners();
    });
  }

  private notifyListeners(): void {
    const current = this.getAll();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (e) {
        console.error('[PortfolioManager] Listener execution error:', e);
      }
    });
  }

  private broadcastChange(positions: PortfolioPosition[]): void {
    this.notifyListeners();
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(PORTFOLIO_EVENT_NAME, { detail: positions })
        );
      } catch {
        // Ignorar se CustomEvent não estiver disponível
      }
    }
  }

  /**
   * Resolve appropriate asset category if none was provided
   */
  public inferCategory(ticker: string): AssetCategory {
    const cleanTicker = ticker.toUpperCase().trim();
    if (FII_DATASET.some((f) => f.ticker.toUpperCase() === cleanTicker) || cleanTicker.endsWith('11')) {
      return 'fii';
    }
    if (['BTC', 'ETH', 'SOL', 'USDT'].includes(cleanTicker) || cleanTicker.includes('CRIPTO')) {
      return 'cripto';
    }
    if (['TESOURO', 'SELIC', 'CDB', 'LCI', 'LCA', 'IPCA', 'CDI'].some((k) => cleanTicker.includes(k))) {
      return 'renda_fixa';
    }
    return 'acao';
  }

  /**
   * Resolve asset friendly name from known market datasets
   */
  public resolveAssetName(ticker: string, fallbackName?: string): string {
    if (fallbackName && fallbackName.trim().length > 0) {
      return fallbackName.trim();
    }
    const cleanTicker = ticker.toUpperCase().trim();

    const fii = FII_DATASET.find((f) => f.ticker.toUpperCase() === cleanTicker);
    if (fii) return fii.name;

    const fund = BASE_FUNDAMENTAL_STOCKS.find((s) => s.ticker.toUpperCase() === cleanTicker);
    if (fund) return fund.name;

    return cleanTicker;
  }

  // ==========================================
  // READ (R)
  // ==========================================

  /**
   * Retrieves all portfolio positions from localStorage.
   * If empty or first visit, seeds with the initial demo portfolio.
   */
  public getAll(): PortfolioPosition[] {
    if (typeof window === 'undefined') {
      return INITIAL_DEMO_PORTFOLIO;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            id: item.id || `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            ticker: (item.ticker || '').toUpperCase().trim(),
            name: item.name || item.ticker || 'Ativo',
            category: item.category || this.inferCategory(item.ticker || ''),
            quantity: Number(item.quantity) || 0,
            averagePrice: Number(item.averagePrice ?? item.avgPrice ?? 0),
            createdAt: item.createdAt || new Date().toISOString().split('T')[0],
          }));
        }
      }
    } catch (e) {
      console.warn('[PortfolioManager] Error reading from localStorage:', e);
    }

    return INITIAL_DEMO_PORTFOLIO;
  }

  /**
   * Alias for getAll()
   */
  public getPositions(): PortfolioPosition[] {
    return this.getAll();
  }

  /**
   * Find a position by its unique ID
   */
  public getById(id: string): PortfolioPosition | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  /**
   * Find a position by ticker symbol
   */
  public getByTicker(ticker: string): PortfolioPosition | undefined {
    const clean = ticker.toUpperCase().trim();
    return this.getAll().find((p) => p.ticker.toUpperCase() === clean);
  }

  /**
   * Filter positions by asset category
   */
  public getByCategory(category: AssetCategory): PortfolioPosition[] {
    return this.getAll().filter((p) => p.category === category);
  }

  /**
   * Compute total invested capital based on acquisition cost
   */
  public getTotalInvested(): number {
    return this.getAll().reduce((acc, pos) => acc + pos.quantity * pos.averagePrice, 0);
  }

  /**
   * Total count of active positions
   */
  public count(): number {
    return this.getAll().length;
  }

  // ==========================================
  // CREATE (C)
  // ==========================================

  /**
   * Add a new asset or merge with existing position using weighted average buy price.
   * Handles user asset properties: ticker, quantity, avgPrice (or averagePrice).
   */
  public addAsset(input: AssetInput, mergeIfExists: boolean = true): PortfolioPosition {
    const cleanTicker = (input.ticker || '').toUpperCase().trim();
    if (!cleanTicker) {
      throw new Error('Ticker é obrigatório para registrar o ativo');
    }

    const quantity = Number(input.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Quantidade deve ser um número maior que zero');
    }

    // Handles both avgPrice and averagePrice alias
    const rawPrice = input.avgPrice !== undefined ? input.avgPrice : input.averagePrice;
    const avgPrice = Number(rawPrice);
    if (isNaN(avgPrice) || avgPrice < 0) {
      throw new Error('Preço médio (avgPrice) deve ser um valor numérico válido maior ou igual a zero');
    }

    const category = input.category || this.inferCategory(cleanTicker);
    const name = this.resolveAssetName(cleanTicker, input.name);
    const createdAt = input.createdAt || new Date().toISOString().split('T')[0];

    const currentPositions = this.getAll();

    if (mergeIfExists) {
      const existingIndex = currentPositions.findIndex(
        (p) => p.ticker.toUpperCase() === cleanTicker && p.category === category
      );

      if (existingIndex >= 0) {
        const existing = currentPositions[existingIndex];
        const oldTotalCost = existing.quantity * existing.averagePrice;
        const newAdditionCost = quantity * avgPrice;
        const combinedQuantity = existing.quantity + quantity;
        const weightedAvgPrice =
          combinedQuantity > 0 ? (oldTotalCost + newAdditionCost) / combinedQuantity : avgPrice;

        const updatedPosition: PortfolioPosition = {
          ...existing,
          name: name || existing.name,
          quantity: combinedQuantity,
          averagePrice: Math.round(weightedAvgPrice * 100) / 100,
        };

        const updatedList = [...currentPositions];
        updatedList[existingIndex] = updatedPosition;
        this.saveAll(updatedList);
        return updatedPosition;
      }
    }

    // Se não existir ou mergeIfExists for falso, cria um novo item
    const newPosition: PortfolioPosition = {
      id: input.id || `pos-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ticker: cleanTicker,
      name,
      category,
      quantity,
      averagePrice: Math.round(avgPrice * 100) / 100,
      createdAt,
    };

    const nextPositions = [newPosition, ...currentPositions];
    this.saveAll(nextPositions);
    return newPosition;
  }

  /**
   * Alias for addAsset to support standard nomenclature
   */
  public addPosition(input: AssetInput): PortfolioPosition {
    return this.addAsset(input);
  }

  /**
   * Alias for addAsset
   */
  public create(input: AssetInput): PortfolioPosition {
    return this.addAsset(input);
  }

  // ==========================================
  // UPDATE (U)
  // ==========================================

  /**
   * Updates an existing position by its ID.
   * Supports ticker, quantity, avgPrice / averagePrice, category and name.
   */
  public updatePosition(id: string, updates: UpdateAssetInput): PortfolioPosition | null {
    const currentPositions = this.getAll();
    const index = currentPositions.findIndex((p) => p.id === id);

    if (index === -1) {
      console.warn(`[PortfolioManager] Position with ID "${id}" not found.`);
      return null;
    }

    const current = currentPositions[index];
    const newTicker = updates.ticker !== undefined ? updates.ticker.toUpperCase().trim() : current.ticker;
    const newQuantity = updates.quantity !== undefined ? Number(updates.quantity) : current.quantity;

    let newAvgPrice = current.averagePrice;
    if (updates.avgPrice !== undefined) {
      newAvgPrice = Number(updates.avgPrice);
    } else if (updates.averagePrice !== undefined) {
      newAvgPrice = Number(updates.averagePrice);
    }

    const newCategory = updates.category !== undefined ? updates.category : current.category;
    const newName = updates.name !== undefined ? updates.name : (newTicker !== current.ticker ? this.resolveAssetName(newTicker) : current.name);

    const updatedItem: PortfolioPosition = {
      ...current,
      ticker: newTicker,
      name: newName,
      category: newCategory,
      quantity: Math.max(0, newQuantity),
      averagePrice: Math.max(0, Math.round(newAvgPrice * 100) / 100),
    };

    const updatedList = [...currentPositions];
    updatedList[index] = updatedItem;
    this.saveAll(updatedList);

    return updatedItem;
  }

  /**
   * Alias for updatePosition
   */
  public update(id: string, updates: UpdateAssetInput): PortfolioPosition | null {
    return this.updatePosition(id, updates);
  }

  // ==========================================
  // DELETE (D)
  // ==========================================

  /**
   * Deletes a position by ID.
   * Returns true if deleted, false if not found.
   */
  public deletePosition(id: string): boolean {
    const currentPositions = this.getAll();
    const filtered = currentPositions.filter((p) => p.id !== id);

    if (filtered.length === currentPositions.length) {
      return false;
    }

    this.saveAll(filtered);
    return true;
  }

  /**
   * Alias for deletePosition
   */
  public delete(id: string): boolean {
    return this.deletePosition(id);
  }

  /**
   * Deletes all positions matching a ticker symbol
   */
  public deleteByTicker(ticker: string): boolean {
    const cleanTicker = ticker.toUpperCase().trim();
    const currentPositions = this.getAll();
    const filtered = currentPositions.filter((p) => p.ticker.toUpperCase() !== cleanTicker);

    if (filtered.length === currentPositions.length) {
      return false;
    }

    this.saveAll(filtered);
    return true;
  }

  /**
   * Completely clears all user assets from the portfolio.
   */
  public clear(): void {
    this.saveAll([]);
  }

  /**
   * Resets portfolio to the default diversified B3 demo portfolio.
   */
  public resetToDemo(): PortfolioPosition[] {
    this.saveAll(INITIAL_DEMO_PORTFOLIO);
    return INITIAL_DEMO_PORTFOLIO;
  }

  // ==========================================
  // PERSISTENCE & UTILITIES
  // ==========================================

  /**
   * Saves positions array to localStorage and broadcasts the update.
   */
  public saveAll(positions: PortfolioPosition[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(positions));
      this.broadcastChange(positions);
    } catch (e) {
      console.error('[PortfolioManager] Failed to persist positions to localStorage:', e);
    }
  }

  /**
   * Exports the entire portfolio as a formatted JSON string.
   */
  public exportToJson(): string {
    const positions = this.getAll();
    return JSON.stringify(positions, null, 2);
  }

  /**
   * Exports positions as a formatted CSV string with UTF-8 BOM and semicolon separator for Excel/Google Sheets compatibility.
   */
  public exportToCsv(customPositions?: PortfolioPosition[]): string {
    const positions = customPositions || this.getAll();
    const headers = [
      'Ticker',
      'Nome',
      'Categoria',
      'Quantidade',
      'Preço Médio (R$)',
      'Total Investido (R$)',
      'Data de Cadastro',
    ];

    const categoryLabels: Record<AssetCategory, string> = {
      acao: 'Ações B3',
      fii: 'Fundos Imobiliários (FII)',
      renda_fixa: 'Renda Fixa / CDI',
      cripto: 'Criptomoedas',
    };

    const rows = positions.map((p) => {
      const totalCost = (p.quantity * p.averagePrice).toFixed(2);
      const catLabel = categoryLabels[p.category] || p.category;
      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      return [
        escape(p.ticker),
        escape(p.name),
        escape(catLabel),
        p.quantity,
        p.averagePrice.toFixed(2),
        totalCost,
        escape(p.createdAt || ''),
      ].join(';');
    });

    return '\uFEFF' + [headers.map((h) => `"${h}"`).join(';'), ...rows].join('\r\n');
  }

  /**
   * Imports positions from a JSON string with format validation.
   */
  public importFromJson(jsonString: string): ImportResult {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'O conteúdo fornecido não é uma lista válida de posições.' };
      }

      const validated: PortfolioPosition[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item || !item.ticker) {
          continue;
        }

        const ticker = String(item.ticker).toUpperCase().trim();
        const quantity = Number(item.quantity) || 0;
        const averagePrice = Number(item.averagePrice ?? item.avgPrice ?? 0);
        const category = item.category || this.inferCategory(ticker);
        const name = this.resolveAssetName(ticker, item.name);

        validated.push({
          id: item.id || `pos-${Date.now()}-${i}`,
          ticker,
          name,
          category,
          quantity,
          averagePrice,
          createdAt: item.createdAt || new Date().toISOString().split('T')[0],
        });
      }

      if (validated.length === 0) {
        return { success: false, count: 0, error: 'Nenhum ativo válido encontrado no arquivo JSON.' };
      }

      this.saveAll(validated);
      return { success: true, count: validated.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Formato JSON inválido.' };
    }
  }

  /**
   * Subscribe to state changes in the portfolio.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: PortfolioListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Singleton default instance for the application
export const portfolioManager = new PortfolioManager();
export default portfolioManager;
