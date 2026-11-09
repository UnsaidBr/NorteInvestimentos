import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, AlertCircle, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { AssetCategory, PortfolioPosition } from '../types/portfolio';
import { useMarket } from '../context/MarketContext';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';
import { formatBRL } from '../utils/formatters';
import { AssetLogo } from './AssetLogo';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: Omit<PortfolioPosition, 'id' | 'createdAt'>) => void;
  editingPosition?: PortfolioPosition | null;
}

export const AddPositionModal: React.FC<AddPositionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPosition,
}) => {
  const { marketState } = useMarket();
  const { stocks } = marketState;

  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('acao');
  const [quantity, setQuantity] = useState<number | ''>(100);
  const [averagePrice, setAveragePrice] = useState<number | ''>(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inicializar formulário se estiver editando
  useEffect(() => {
    if (editingPosition) {
      setTicker(editingPosition.ticker);
      setName(editingPosition.name);
      setCategory(editingPosition.category);
      setQuantity(editingPosition.quantity);
      setAveragePrice(editingPosition.averagePrice);
    } else {
      setTicker('');
      setName('');
      setCategory('acao');
      setQuantity(100);
      setAveragePrice('');
      setSearchQuery('');
    }
    setError(null);
  }, [editingPosition, isOpen]);

  // Sugestões de busca da B3 e FIIs
  const suggestions = useMemo(() => {
    const q = (searchQuery || ticker).trim().toLowerCase();
    if (!q) return [];

    const stockMatches = stocks
      .filter((s) => s.ticker.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q)))
      .slice(0, 4)
      .map((s) => ({
        ticker: s.ticker,
        name: s.name,
        price: s.price,
        category: 'acao' as AssetCategory,
      }));

    const fiiMatches = FII_DATASET
      .filter((f) => f.ticker.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((f) => ({
        ticker: f.ticker,
        name: f.name,
        price: f.price,
        category: 'fii' as AssetCategory,
      }));

    return [...stockMatches, ...fiiMatches];
  }, [searchQuery, ticker, stocks]);

  const handleSelectSuggestion = (item: { ticker: string; name: string; price: number; category: AssetCategory }) => {
    setTicker(item.ticker);
    setName(item.name);
    setCategory(item.category);
    setAveragePrice(item.price);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      setError('Por favor, informe o código do ativo (ex: PETR4, HGLG11).');
      return;
    }
    const qty = typeof quantity === 'number' ? quantity : parseFloat(quantity);
    const price = typeof averagePrice === 'number' ? averagePrice : parseFloat(averagePrice);

    if (isNaN(qty) || qty <= 0) {
      setError('A quantidade de cotas/ações deve ser maior que zero.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError('O preço médio de compra deve ser maior que zero.');
      return;
    }

    onSave({
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || ticker.toUpperCase().trim(),
      category,
      quantity: qty,
      averagePrice: Math.round(price * 100) / 100,
    });

    onClose();
  };

  if (!isOpen) return null;

  const totalCost = (typeof quantity === 'number' ? quantity : 0) * (typeof averagePrice === 'number' ? averagePrice : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-[18px] bg-[#141210] border border-[#d4af6a]/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#d4af6a]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#f5efe6]">
                {editingPosition ? 'Editar Posição' : 'Adicionar Ativo à Carteira'}
              </h3>
              <p className="text-xs text-[#c2b9ac]">
                Cadastre suas ações, FIIs ou renda fixa com cotações da B3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8c8273] hover:text-[#f5efe6] hover:bg-[#1c1916] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Categoria do Ativo */}
          <div>
            <label className="block text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-2">
              Classe de Ativo
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {[
                { id: 'acao', label: 'Ação B3' },
                { id: 'fii', label: 'FII' },
                { id: 'renda_fixa', label: 'Renda Fixa' },
                { id: 'cripto', label: 'Cripto' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as AssetCategory)}
                  className={`py-2 px-2 rounded-[8px] border text-center transition-all ${
                    category === c.id
                      ? 'bg-[#d4af6a]/20 border-[#d4af6a] text-[#f0d9a8] font-bold'
                      : 'bg-[#1c1916] border-[#d4af6a]/15 text-[#c2b9ac] hover:text-[#f5efe6]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticker do Ativo & Busca Rápida */}
          <div className="relative">
            <label className="block text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-1.5">
              Código / Ticker (ex: PETR4, HGLG11, SELIC)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  setSearchQuery(e.target.value);
                }}
                placeholder="Ex: PETR4, ITUB4, MXRF11..."
                className="w-full px-4 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 focus:border-[#d4af6a] text-[#f5efe6] text-sm font-mono uppercase focus:outline-none"
              />
              {ticker && (
                <div className="absolute right-3">
                  <AssetLogo ticker={ticker} size="sm" />
                </div>
              )}
            </div>

            {/* Sugestões Rápidas de Tickers */}
            {suggestions.length > 0 && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/30 shadow-xl overflow-hidden divide-y divide-[#d4af6a]/10 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-[#24201c] text-left transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AssetLogo ticker={item.ticker} size="sm" />
                      <div>
                        <div className="font-mono font-bold text-[#f5efe6]">{item.ticker}</div>
                        <div className="text-[10px] text-[#c2b9ac] truncate max-w-[180px]">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[#d4af6a] font-bold">
                      {formatBRL(item.price)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nome da Empresa / Fundo */}
          <div>
            <label className="block text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-1.5">
              Nome da Empresa ou Fundo (Opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Petrobras, Itaú, Maxi Renda..."
              className="w-full px-4 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 focus:border-[#d4af6a] text-[#f5efe6] text-sm focus:outline-none font-sans"
            />
          </div>

          {/* Quantidade e Preço Médio (Grid 2 colunas) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-1.5">
                Quantidade
              </label>
              <input
                type="number"
                min="0.0001"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="Ex: 100"
                className="w-full px-4 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 focus:border-[#d4af6a] text-[#f5efe6] text-sm font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-1.5">
                Preço Médio (R$)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="Ex: 32.50"
                className="w-full px-4 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 focus:border-[#d4af6a] text-[#f5efe6] text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Resumo Financeiro da Posição */}
          <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 flex items-center justify-between text-xs font-mono">
            <span className="text-[#c2b9ac]">Custo Total da Posição:</span>
            <span className="text-[#f0d9a8] font-bold text-sm">
              {formatBRL(totalCost)}
            </span>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 rounded-[8px] bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-xs font-semibold text-[#c2b9ac] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              {editingPosition ? 'Salvar Alterações' : 'Adicionar à Carteira'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
