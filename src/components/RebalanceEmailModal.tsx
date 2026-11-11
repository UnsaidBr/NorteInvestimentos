import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { RebalanceSimulationResult } from '../types/portfolio';
import { formatBRL } from '../utils/formatters';
import { supabase, isSupabaseRealtimeConfigured } from '../services/supabaseClient';

interface RebalanceEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: RebalanceSimulationResult;
}

export const RebalanceEmailModal: React.FC<RebalanceEmailModalProps> = ({
  isOpen,
  onClose,
  simulation,
}) => {
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carregar e-mail previamente salvo no navegador
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('norteinvest_user_email') || '';
      if (savedEmail) {
        setEmail(savedEmail);
      }
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim().toLowerCase();
    // Salvar e-mail para conveniência do usuário em futuros envios
    localStorage.setItem('norteinvest_user_email', emailTrimmed);

    const payload = {
      email: emailTrimmed,
      totalCurrentValue: simulation.totalCurrentValue,
      contributionAmount: simulation.contributionAmount,
      totalProjectedValue: simulation.totalProjectedValue,
      classes: simulation.classes.map((c) => ({
        category: c.category,
        label: c.label,
        currentPercent: c.currentPercent,
        targetPercent: c.targetPercent,
        suggestedContribution: c.suggestedContribution,
        projectedPercent: c.projectedPercent,
        projectedValue: c.projectedValue,
      })),
      notes: notes.trim(),
    };

    try {
      // 1. Tentar inserção direta no cliente Supabase se as credenciais estiverem disponíveis no frontend
      if (isSupabaseRealtimeConfigured && supabase) {
        try {
          await supabase.from('rebalance_notifications').insert({
            email: emailTrimmed,
            total_current_value: simulation.totalCurrentValue,
            contribution_amount: simulation.contributionAmount,
            total_projected_value: simulation.totalProjectedValue,
            rebalance_summary: payload,
            status: 'sent',
            created_at: new Date().toISOString(),
          });
        } catch (clientErr) {
          console.warn('[Supabase Client] Falha silenciosa no envio direto:', clientErr);
        }
      }

      // 2. Chamar endpoint da API do servidor
      const response = await fetch('/api/portfolio/rebalance-email-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || 'Resumo do rebalanceamento enviado com sucesso!');
        setTimeout(() => {
          // Mantém aberta para leitura e depois fecha
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Não foi possível enviar a notificação no momento. Tente novamente.');
      }
    } catch (err: any) {
      console.error('[Rebalance Notification] Erro de envio:', err);
      setErrorMessage('Erro de conexão ao processar notificação via Supabase. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-5 bg-gradient-to-r from-[#1c1916] to-[#141210] border-b border-[#d4af6a]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#d4af6a]/15 border border-[#d4af6a]/30 text-[#f0d9a8]">
              <Mail className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#f5efe6]">
                Enviar Resumo do Rebalanceamento
              </h3>
              <p className="text-xs text-[#8c8273]">
                Receba a recomendação de aportes por e-mail integrada ao Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Card Resumo dos Dados que serão enviados */}
          <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/20 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#d4af6a]/15">
              <span className="text-[#8c8273] uppercase tracking-wider">Resumo do Plano</span>
              <span className="text-[#3ddc97] font-bold">
                Aporte: +{formatBRL(simulation.contributionAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-[8px] bg-[#141210]">
                <span className="text-[10px] text-[#8c8273] block">Patrimônio Atual</span>
                <span className="font-bold text-[#f5efe6] tabular-nums">
                  {formatBRL(simulation.totalCurrentValue)}
                </span>
              </div>
              <div className="p-2 rounded-[8px] bg-[#141210]">
                <span className="text-[10px] text-[#8c8273] block">Patrimônio Projetado</span>
                <span className="font-bold text-[#f0d9a8] tabular-nums">
                  {formatBRL(simulation.totalProjectedValue)}
                </span>
              </div>
            </div>

            {/* Lista dos Aportes Recomendados */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-[#8c8273] block uppercase">
                Distribuição Sugerida por Classe:
              </span>
              <div className="space-y-1 text-xs">
                {simulation.classes.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-1.5 rounded-[6px] bg-[#141210] border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[#f5efe6] font-medium">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-[#8c8273] text-[11px]">
                        Meta: {c.targetPercent}%
                      </span>
                      <span className={`font-bold ${c.suggestedContribution > 0 ? 'text-[#3ddc97]' : 'text-[#8c8273]'}`}>
                        {c.suggestedContribution > 0 ? `+${formatBRL(c.suggestedContribution)}` : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mensagens de Feedback */}
          {successMessage && (
            <div className="p-3.5 rounded-[10px] bg-[#3ddc97]/15 border border-[#3ddc97]/30 text-xs text-[#3ddc97] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{successMessage}</p>
                <p className="text-[11px] text-[#3ddc97]/80 mt-1">
                  Os dados foram persistidos na tabela <code className="bg-black/30 px-1 py-0.5 rounded">rebalance_notifications</code> no Supabase.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-[10px] bg-[#ff5c6c]/15 border border-[#ff5c6c]/30 text-xs text-[#ff5c6c] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Envio */}
          {!successMessage ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-[#8c8273] mb-1.5">
                  Seu E-mail para Envio
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8c8273]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/30 text-[#f5efe6] text-xs font-mono focus:border-[#d4af6a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#8c8273] mb-1.5">
                  Anotações ou Lembrete Pessoal (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Aportar no 5º dia útil após o salário; foco em FIIs..."
                  className="w-full px-3 py-2 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-[#f5efe6] text-xs font-sans focus:border-[#d4af6a] focus:outline-none"
                />
              </div>

              {/* Status da Integração com Supabase */}
              <div className="p-3 rounded-[8px] bg-[#1c1916]/60 border border-[#d4af6a]/15 flex items-center justify-between text-[11px] text-[#8c8273]">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#3ddc97]" />
                  <span>Integração Supabase:</span>
                </div>
                <span className="text-[#f0d9a8] font-bold">
                  {isSupabaseRealtimeConfigured ? 'Conectado (Cloud PostgreSQL)' : 'Ativo (Backend & REST Proxy)'}
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#d4af6a]/15">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Notificação</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 flex justify-end border-t border-[#d4af6a]/15">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-[8px] bg-[#d4af6a] text-[#0b0a09] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
