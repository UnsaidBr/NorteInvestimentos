import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { PortfolioPosition } from '../types/portfolio';
import { PriceAlert, AlertCondition } from '../types/priceAlert';
import { formatBRL } from '../utils/formatters';
import { AssetLogo } from './AssetLogo';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: PortfolioPosition[];
  currentPrices: Record<string, number>;
  preselectedTicker?: string;
  alerts: PriceAlert[];
  onCreateAlert: (data: {
    ticker: string;
    assetName: string;
    targetPrice: number;
    condition: AlertCondition;
    initialPrice: number;
    note?: string;
  }) => void;
  onDeleteAlert: (id: string) => void;
  onToggleActive: (id: string) => void;
  onReactivateAlert: (id: string, newTargetPrice?: number) => void;
  onDismissTrigger: (id: string) => void;
  onPlayTestChime: () => void;
  onRequestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  positions,
  currentPrices,
  preselectedTicker,
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleActive,
  onReactivateAlert,
  onDismissTrigger,
  onPlayTestChime,
  onRequestNotificationPermission,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE_OR_EQUAL');
  const [note, setNote] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  // Sincroniza ticker pré-selecionado quando modal abre
  useEffect(() => {
    if (isOpen) {
      if (preselectedTicker) {
        setSelectedTicker(preselectedTicker.toUpperCase());
      } else if (positions.length > 0 && !selectedTicker) {
        setSelectedTicker(positions[0].ticker.toUpperCase());
      }
      setFeedbackMsg(null);
    }
  }, [isOpen, preselectedTicker, positions]);

  // Encontra posição selecionada e cotação atual
  const selectedPosition = useMemo(() => {
    return positions.find((p) => p.ticker.toUpperCase() === selectedTicker.toUpperCase());
  }, [positions, selectedTicker]);

  const currentPrice = useMemo(() => {
    if (!selectedTicker) return 0;
    const price = currentPrices[selectedTicker.toUpperCase()];
    if (price && price > 0) return price;
    return selectedPosition?.averagePrice || 0;
  }, [currentPrices, selectedTicker, selectedPosition]);

  // Preenche preço alvo sugerido caso o campo esteja vazio
  useEffect(() => {
    if (currentPrice > 0 && !targetPriceInput) {
      const defaultTarget = (currentPrice * 1.05).toFixed(2);
      setTargetPriceInput(defaultTarget);
      setCondition('ABOVE_OR_EQUAL');
    }
  }, [currentPrice, selectedTicker]);

  // Alertas do ativo selecionado vs todos
  const selectedTickerAlerts = useMemo(() => {
    if (!selectedTicker) return [];
    return alerts.filter((a) => a.ticker.toUpperCase() === selectedTicker.toUpperCase());
  }, [alerts, selectedTicker]);

  // Cálculo de distância percentual para o alvo
  const targetPriceNum = parseFloat(targetPriceInput.replace(',', '.')) || 0;
  const priceDiffBrl = targetPriceNum - currentPrice;
  const priceDiffPercent = currentPrice > 0 ? (priceDiffBrl / currentPrice) * 100 : 0;

  // Atalhos percentuais rápidos (+3%, +5%, +10%, -3%, -5%, -10%)
  const handleQuickPercent = (percent: number) => {
    if (currentPrice <= 0) return;
    const calculated = currentPrice * (1 + percent / 100);
    setTargetPriceInput(calculated.toFixed(2));
    if (percent >= 0) {
      setCondition('ABOVE_OR_EQUAL');
    } else {
      setCondition('BELOW_OR_EQUAL');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicker || targetPriceNum <= 0) {
      setFeedbackMsg('Por favor, defina um preço alvo válido.');
      return;
    }

    onCreateAlert({
      ticker: selectedTicker,
      assetName: selectedPosition?.name || selectedTicker,
      targetPrice: targetPriceNum,
      condition,
      initialPrice: currentPrice,
      note: note.trim() || undefined,
    });

    setFeedbackMsg(`Alerta configurado para ${selectedTicker} em ${formatBRL(targetPriceNum)}!`);
    setNote('');
    setTimeout(() => {
      setActiveTab('list');
      setFeedbackMsg(null);
    }, 800);
  };

  const handleRequestPermission = async () => {
    const res = await onRequestNotificationPermission();
    if (res === 'granted') {
      setNotificationStatus('Notificações no navegador ativadas com sucesso!');
    } else {
      setNotificationStatus('Permissão não concedida. Os alertas soarão e aparecerão na aplicação.');
    }
    setTimeout(() => setNotificationStatus(''), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-5 bg-gradient-to-r from-[#1c1916] to-[#141210] border-b border-[#d4af6a]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#d4af6a]/10 border border-[#d4af6a]/30 text-[#d4af6a]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f5efe6]">
                Alertas de Preço de Ativos
              </h3>
              <p className="text-xs font-mono text-[#8c8273]">
                Acompanhe os preços que você definiu, sem recomendação de investimento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPlayTestChime}
              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#d4af6a] transition-colors cursor-pointer"
              title="Testar sinal sonoro de alerta"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navegação entre Abas */}
        <div className="flex border-b border-[#d4af6a]/15 bg-[#0b0a09]/50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#d4af6a] text-[#f0d9a8]'
                : 'border-transparent text-[#8c8273] hover:text-[#c2b9ac]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configurar Novo Alerta</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#d4af6a] text-[#f0d9a8]'
                : 'border-transparent text-[#8c8273] hover:text-[#c2b9ac]'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Meus Alertas ({alerts.length})</span>
            {alerts.some((a) => a.isTriggered && !a.dismissed) && (
              <span className="w-2 h-2 rounded-full bg-[#3ddc97] animate-ping" />
            )}
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {feedbackMsg && (
            <div className="mb-4 p-3 rounded-[8px] bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-xs font-mono text-[#3ddc97] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {notificationStatus && (
            <div className="mb-4 p-3 rounded-[8px] bg-[#d4af6a]/10 border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{notificationStatus}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Seleção do Ativo */}
              <div>
                <label className="block text-xs font-mono text-[#8c8273] uppercase mb-1.5">
                  Ativo da Carteira
                </label>
                {positions.length === 0 ? (
                  <div className="p-3 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/15 text-xs font-mono text-[#8c8273]">
                    Nenhum ativo cadastrado na carteira. Adicione um ativo primeiro para definir alertas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={selectedTicker}
                      onChange={(e) => {
                        setSelectedTicker(e.target.value);
                        setTargetPriceInput('');
                      }}
                      className="w-full px-3 py-2.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-[#f5efe6] text-sm font-mono focus:border-[#d4af6a] focus:outline-none cursor-pointer"
                    >
                      {positions.map((p) => (
                        <option key={p.id} value={p.ticker.toUpperCase()}>
                          {p.ticker} - {p.name}
                        </option>
                      ))}
                    </select>

                    {/* Resumo da Cotação Atual */}
                    <div className="p-2.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedTicker && (
                          <AssetLogo
                            ticker={selectedTicker}
                            name={selectedPosition?.name || selectedTicker}
                            size="sm"
                          />
                        )}
                        <div>
                          <span className="text-[10px] font-mono text-[#8c8273] block">
                            Cotação Atual
                          </span>
                          <span className="font-mono font-bold text-sm text-[#f5efe6] tabular-nums">
                            {formatBRL(currentPrice)}
                          </span>
                        </div>
                      </div>
                      {selectedPosition && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#8c8273] block">
                            Preço Médio
                          </span>
                          <span className="font-mono text-xs text-[#c2b9ac] tabular-nums">
                            {formatBRL(selectedPosition.averagePrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Condição do Alerta */}
              <div>
                <label className="block text-xs font-mono text-[#8c8273] uppercase mb-1.5">
                  Condição de Disparo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCondition('ABOVE_OR_EQUAL')}
                    className={`p-3 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      condition === 'ABOVE_OR_EQUAL'
                        ? 'bg-[#d4af6a]/15 border-[#d4af6a] text-[#f5efe6]'
                        : 'bg-[#1c1916] border-[#d4af6a]/15 text-[#8c8273] hover:text-[#c2b9ac]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-[6px] ${condition === 'ABOVE_OR_EQUAL' ? 'bg-[#3ddc97]/20 text-[#3ddc97]' : 'bg-[#0b0a09] text-[#8c8273]'}`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-[#f0d9a8]">
                        Subir para ≥ Preço Alvo
                      </div>
                      <div className="text-[11px] text-[#8c8273] mt-0.5">
                        Avisar quando o preço subir até o valor que você escolheu
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('BELOW_OR_EQUAL')}
                    className={`p-3 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      condition === 'BELOW_OR_EQUAL'
                        ? 'bg-[#d4af6a]/15 border-[#d4af6a] text-[#f5efe6]'
                        : 'bg-[#1c1916] border-[#d4af6a]/15 text-[#8c8273] hover:text-[#c2b9ac]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-[6px] ${condition === 'BELOW_OR_EQUAL' ? 'bg-[#ff5c6c]/20 text-[#ff5c6c]' : 'bg-[#0b0a09] text-[#8c8273]'}`}>
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-[#f0d9a8]">
                        Cair para ≤ Preço Alvo
                      </div>
                      <div className="text-[11px] text-[#8c8273] mt-0.5">
                        Avisar quando o preço cair até o valor que você escolheu
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Preço Alvo e Atalhos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#8c8273] uppercase">
                    Preço Alvo (R$)
                  </label>
                  {currentPrice > 0 && targetPriceNum > 0 && (
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${
                        priceDiffPercent >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                      }`}
                    >
                      {priceDiffPercent >= 0 ? '+' : ''}
                      {priceDiffPercent.toFixed(2)}% ({priceDiffBrl >= 0 ? '+' : ''}
                      {formatBRL(priceDiffBrl)})
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#8c8273]">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={targetPriceInput}
                    onChange={(e) => setTargetPriceInput(e.target.value)}
                    placeholder="0,00"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/25 text-[#f5efe6] font-mono text-base font-bold focus:border-[#d4af6a] focus:outline-none"
                  />
                </div>

                {/* Botões Rápidos de Variação */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] font-mono text-[#8c8273] mr-1">
                    Atalhos rápidos:
                  </span>
                  {[3, 5, 10, 15].map((pct) => (
                    <button
                      key={`plus-${pct}`}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="px-2 py-1 rounded-[6px] bg-[#1c1916] hover:bg-[#3ddc97]/20 border border-[#3ddc97]/30 text-[11px] font-mono text-[#3ddc97] transition-colors cursor-pointer"
                    >
                      +{pct}%
                    </button>
                  ))}
                  {[-3, -5, -10, -15].map((pct) => (
                    <button
                      key={`minus-${pct}`}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="px-2 py-1 rounded-[6px] bg-[#1c1916] hover:bg-[#ff5c6c]/20 border border-[#ff5c6c]/30 text-[11px] font-mono text-[#ff5c6c] transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Nota / Motivo (Opcional) */}
              <div>
                <label className="block text-xs font-mono text-[#8c8273] uppercase mb-1.5">
                  Nota / Estratégia (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Lembrar de revisar minha carteira quando chegar nesse preço"
                  className="w-full px-3 py-2 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-[#f5efe6] text-xs font-sans focus:border-[#d4af6a] focus:outline-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#d4af6a]/15">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="text-[11px] font-mono text-[#8c8273] hover:text-[#f0d9a8] underline cursor-pointer"
                >
                  Ativar notificações nativas no navegador
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] text-xs font-mono transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={positions.length === 0}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    Salvar Alerta
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Lista de Alertas Ativos e Disparados */
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#8c8273]">
                    <Bell className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="font-serif font-bold text-base text-[#f5efe6]">
                    Nenhum alerta cadastrado
                  </div>
                  <p className="text-xs font-mono text-[#8c8273] max-w-sm mx-auto">
                    Crie um alerta para ser avisado quando um ativo atingir sua meta de preço.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#d4af6a] text-[#0b0a09] text-xs font-bold hover:bg-[#e2c17e] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Primeiro Alerta</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alerts.map((alert) => {
                    const isAbove = alert.condition === 'ABOVE_OR_EQUAL';
                    const livePrice = currentPrices[alert.ticker.toUpperCase()] || alert.initialPrice;
                    const diffToLive = livePrice - alert.targetPrice;
                    const diffPct = livePrice > 0 ? (diffToLive / livePrice) * 100 : 0;

                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-[10px] border transition-all ${
                          alert.isTriggered
                            ? 'bg-gradient-to-r from-[#1c160c] to-[#14120a] border-[#d4af6a]/50 shadow-[0_2px_12px_rgba(212,175,106,0.1)]'
                            : alert.active
                            ? 'bg-[#1c1916] border-[#d4af6a]/20 hover:border-[#d4af6a]/40'
                            : 'bg-[#141210]/60 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Info do Ativo + Alvo */}
                          <div className="flex items-start gap-3">
                            <AssetLogo ticker={alert.ticker} name={alert.assetName} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-[#f0d9a8]">
                                  {alert.ticker}
                                </span>
                                {alert.isTriggered ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ddc97]/20 text-[#3ddc97] border border-[#3ddc97]/40">
                                    <CheckCircle2 className="w-3 h-3" />
                                    ALVO ATINGIDO
                                  </span>
                                ) : alert.active ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/25">
                                    <Clock className="w-3 h-3 text-[#d4af6a]" />
                                    Monitorando
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#8c8273]">
                                    Pausado
                                  </span>
                                )}
                              </div>

                              <div className="text-xs font-mono text-[#c2b9ac] mt-1 flex flex-wrap items-center gap-2">
                                <span>
                                  Alvo: <strong className="text-[#f5efe6]">{isAbove ? '≥' : '≤'} {formatBRL(alert.targetPrice)}</strong>
                                </span>
                                <span className="text-[#8c8273]">·</span>
                                <span>
                                  Cotação Atual: <strong className="text-[#f5efe6]">{formatBRL(livePrice)}</strong>
                                </span>
                              </div>

                              {alert.note && (
                                <div className="text-[11px] text-[#8c8273] font-sans mt-1 italic">
                                  "{alert.note}"
                                </div>
                              )}

                              {alert.isTriggered && alert.triggeredAt && (
                                <div className="text-[10px] font-mono text-[#d4af6a] mt-1">
                                  Disparado em {new Date(alert.triggeredAt).toLocaleString('pt-BR')} por {formatBRL(alert.triggeredPrice || livePrice)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ações por Alerta */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {alert.isTriggered ? (
                              <button
                                onClick={() => onReactivateAlert(alert.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#141210] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
                                title="Reativar monitoramento com nova medição"
                              >
                                <RotateCcw className="w-3 h-3 text-[#d4af6a]" />
                                <span>Reativar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleActive(alert.id)}
                                className="p-1.5 rounded-[6px] bg-[#141210] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer"
                                title={alert.active ? 'Pausar alerta' : 'Ativar alerta'}
                              >
                                {alert.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#3ddc97]" />}
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteAlert(alert.id)}
                              className="p-1.5 rounded-[6px] bg-[#141210] hover:bg-red-950/40 text-[#8c8273] hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir alerta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
