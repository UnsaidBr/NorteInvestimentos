import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlan } from '../context/PlanContext';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Sliders,
  Star,
  Scale,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Code2,
  CheckCircle2,
  Bell,
  Activity,
} from 'lucide-react';

export const DevPlanSwitcher: React.FC = () => {
  const {
    plan,
    isPremium,
    togglePlan,
    setPlan,
    aiUsageToday,
    limits,
    resetAiUsage,
    openWaitlistModal,
  } = usePlan();

  const [isOpen, setIsOpen] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <aside aria-label="Controle de desenvolvimento" className="fixed bottom-4 left-4 z-50 font-mono text-xs select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-2 w-80 bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/40 rounded-[14px] p-4 shadow-2xl text-[#f5efe6] space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#d4af6a]/20">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#d4af6a]" />
                <span className="font-bold text-xs text-[#f0d9a8]">DEV: Seletor de Plano</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8c8273] hover:text-[#f5efe6] p-1 rounded hover:bg-[#1c1916] transition-colors"
                title="Minimizar seletor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Plan Switch Buttons */}
            <div>
              <div className="text-[11px] text-[#8c8273] mb-1.5 font-sans">
                Alternar plano ativo para testes:
              </div>
              <div className="grid grid-cols-2 gap-2 bg-[#0c0b0a] p-1 rounded-[10px] border border-[#d4af6a]/15">
                <button
                  onClick={() => setPlan('free')}
                  className={`py-1.5 px-3 rounded-[8px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    !isPremium
                      ? 'bg-[#1c1916] text-[#f5efe6] border border-[#d4af6a]/40 shadow'
                      : 'text-[#8c8273] hover:text-[#f5efe6]'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Gratuito</span>
                </button>
                <button
                  onClick={() => setPlan('premium')}
                  className={`py-1.5 px-3 rounded-[8px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    isPremium
                      ? 'bg-[#d4af6a] text-[#0a0908] shadow-md shadow-[#d4af6a]/20'
                      : 'text-[#8c8273] hover:text-[#f0d9a8]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#0a0908]" />
                  <span>Premium</span>
                </button>
              </div>
            </div>

            {/* Active Plan Rules Summary */}
            <div className="bg-[#0c0b0a] rounded-[10px] p-2.5 border border-[#d4af6a]/15 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#d4af6a]" />
                  Filtros Screener:
                </span>
                <span className="font-bold text-[#f5efe6]">
                  {isPremium ? 'Ilimitados' : `Até ${limits.maxFilters}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#d4af6a]" />
                  Favoritos Salvos:
                </span>
                <span className="font-bold text-[#f5efe6]">
                  {isPremium ? 'Ilimitados' : `Até ${limits.maxFavorites}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#d4af6a]" />
                  Consultas IA Hoje:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${!isPremium && aiUsageToday >= 3 ? 'text-rose-400' : 'text-[#f5efe6]'}`}>
                    {isPremium ? 'Ilimitadas' : `${aiUsageToday} / 3`}
                  </span>
                  {!isPremium && aiUsageToday > 0 && (
                    <button
                      onClick={resetAiUsage}
                      className="p-0.5 text-[#8c8273] hover:text-amber-400 transition-colors"
                      title="Resetar contador de IA"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-[#d4af6a]" />
                  Comparador:
                </span>
                <span className="font-bold text-[#f5efe6]">
                  {isPremium ? 'Até 4 ativos' : 'Até 2 ativos'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3 text-[#d4af6a]" />
                  Exportação CSV:
                </span>
                <span className={`font-bold ${isPremium ? 'text-emerald-400' : 'text-amber-400/80'}`}>
                  {isPremium ? 'Liberada' : 'Abre Modal'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#c2b9ac]">
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3 text-[#d4af6a]" />
                  Alertas E-mail:
                </span>
                <span className={`font-bold ${isPremium ? 'text-emerald-400' : 'text-amber-400/80'}`}>
                  {isPremium ? 'Liberado' : 'Abre Modal'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-1 flex flex-col gap-1.5">
              <button
                onClick={() => openWaitlistModal('Teste do Modal de Lista de Espera')}
                className="w-full py-1.5 px-2.5 rounded-[8px] bg-[#1c1916] hover:bg-[#25221d] text-[#f0d9a8] border border-[#d4af6a]/30 transition-colors text-center text-[11px] font-sans flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#d4af6a]" />
                <span>Testar Modal Premium</span>
              </button>

              <Link
                to="/planos"
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 px-2.5 rounded-[8px] bg-[#0c0b0a] hover:bg-[#141210] text-[#c2b9ac] hover:text-[#f5efe6] border border-[#d4af6a]/20 transition-colors text-center text-[11px] font-sans flex items-center justify-center gap-1"
              >
                <span>Ver página /planos</span>
                <ExternalLink className="w-3 h-3 text-[#8c8273]" />
              </Link>

              <Link
                to="/diagnostico"
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 px-2.5 rounded-[8px] bg-[#0c0b0a] hover:bg-[#141210] text-[#f0d9a8] hover:text-[#f5efe6] border border-amber-500/30 transition-colors text-center text-[11px] font-sans flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3 h-3 text-[#d4af6a]" />
                <span>Auditoria /diagnostico</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
          isPremium
            ? 'bg-[#141210]/90 border-[#d4af6a] text-[#f0d9a8] hover:bg-[#1c1916]'
            : 'bg-[#141210]/90 border-amber-500/40 text-[#c2b9ac] hover:text-[#f5efe6] hover:bg-[#1c1916]'
        }`}
        title="Alternar seletor de desenvolvimento para plano Gratuito / Premium"
      >
        <span className="w-2 h-2 rounded-full animate-pulse bg-[#d4af6a]" />
        <span className="font-bold text-[11px]">
          DEV: {isPremium ? '⭐ Premium' : '⚡ Gratuito'}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#8c8273]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#8c8273]" />}
      </button>
    </aside>
  );
};
