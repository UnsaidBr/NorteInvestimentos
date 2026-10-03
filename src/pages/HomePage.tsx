import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { Hero } from '../components/Hero';
import { NewsletterCta } from '../components/NewsletterCta';
import { MiniSparkline } from '../components/StocksSection';
import { formatBRL, formatPercent } from '../utils/formatters';
import { LEARN_TOPICS } from '../data/learningContent';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Calculator,
  GraduationCap,
  BarChart2,
  Clock,
  Building2,
  Percent,
  Scale,
  Info,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  usePageMeta(
    'NorteInvest | Inteligência de Mercado & B3',
    'Acompanhe cotações da B3 atualizadas a cada 60 segundos, ativos globais, taxas do Banco Central e simulações patrimoniais com sínteses de inteligência artificial.'
  );

  const { marketState, setSelectedStockForChart, setSelectedStockForAi } = useMarket();
  const { stocks, macro, isDemoMode, lastUpdated } = marketState;

  // Top 3 Gainers and Losers
  const { topGainers, topLosers } = useMemo(() => {
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      topGainers: sorted.slice(0, 3),
      topLosers: sorted.slice(-3).reverse(),
    };
  }, [stocks]);

  const previewLessons = useMemo(() => {
    return LEARN_TOPICS.slice(0, 3);
  }, []);

  const getLessonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#d4af6a]" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-[#d4af6a]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#d4af6a]" />;
      default:
        return <GraduationCap className="w-5 h-5 text-[#d4af6a]" />;
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Resumo do Mercado: Top 3 Altas & Top 3 Baixas */}
      <section className="py-20 sm:py-28 bg-[#0b0a09] border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] shadow-[0_0_8px_#d4af6a]" />
                  Pregão B3
                </div>

                <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Resumo do Mercado
              </h2>
              <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
                As maiores oscilações percentuais registradas na sessão diária de negociação da bolsa brasileira.
              </p>
            </div>

            <Link
              to="/mercado"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 hover:border-[#d4af6a]/50 text-xs sm:text-sm font-semibold text-[#f0d9a8] transition-all shadow-sm shrink-0"
            >
              <span>Ver todas as ações da B3</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid: 3 Altas and 3 Baixas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top 3 Altas */}
            <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-[#d4af6a]/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#3ddc97]/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#3ddc97]" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#f5efe6]">
                    Maiores Altas do Dia
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#8c8273] tracking-widest uppercase">Dados da B3</span>
              </div>

              {/* Action cards in 2 clean rows */}
              <div className="space-y-4">
                {topGainers.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="p-4 sm:p-5 rounded-[14px] bg-[#1c1916]/90 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm space-y-3"
                  >
                    {/* Linha 1: avatar, ticker, nome completo da empresa sem truncar, preço e variação */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-[#24201c] to-[#141210] border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#f0d9a8] shrink-0">
                          {stock.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-base text-[#f5efe6]">
                              {stock.ticker}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141210] text-[#c2b9ac] border border-[#d4af6a]/10">
                              B3
                            </span>
                          </div>
                          {/* Nome completo da empresa sem truncar */}
                          <div className="text-xs text-[#c2b9ac] font-normal leading-snug">
                            {stock.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono tabular-nums font-bold text-base text-[#f5efe6]">
                          {formatBRL(stock.price)}
                        </div>
                        <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold text-[#3ddc97]">
                          ▲ {formatPercent(stock.changePercent, false)}
                        </span>
                      </div>
                    </div>

                    {/* Linha 2: sparkline à esquerda e os botões à direita (nada se sobrepondo) */}
                    <div className="pt-2.5 border-t border-[#d4af6a]/10 flex items-center justify-between gap-3">
                      <div className="shrink-0">
                        <MiniSparkline stock={stock} width={90} height={24} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStockForChart(stock)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] border border-[#d4af6a]/15 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                          <span>Gráfico</span>
                        </button>
                        <button
                          onClick={() => setSelectedStockForAi(stock)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                          <span>Explicar com IA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Baixas */}
            <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-[#d4af6a]/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff5c6c]/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-[#ff5c6c]" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#f5efe6]">
                    Maiores Baixas do Dia
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#8c8273] tracking-widest uppercase">Dados da B3</span>
              </div>

              {/* Action cards in 2 clean rows */}
              <div className="space-y-4">
                {topLosers.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="p-4 sm:p-5 rounded-[14px] bg-[#1c1916]/90 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm space-y-3"
                  >
                    {/* Linha 1: avatar, ticker, nome completo da empresa sem truncar, preço e variação */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-[#24201c] to-[#141210] border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#c2b9ac] shrink-0">
                          {stock.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-base text-[#f5efe6]">
                              {stock.ticker}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141210] text-[#c2b9ac] border border-[#d4af6a]/10">
                              B3
                            </span>
                          </div>
                          {/* Nome completo da empresa sem truncar */}
                          <div className="text-xs text-[#c2b9ac] font-normal leading-snug">
                            {stock.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono tabular-nums font-bold text-base text-[#f5efe6]">
                          {formatBRL(stock.price)}
                        </div>
                        <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold text-[#ff5c6c]">
                          ▼ {formatPercent(stock.changePercent, false)}
                        </span>
                      </div>
                    </div>

                    {/* Linha 2: sparkline à esquerda e os botões à direita (nada se sobrepondo) */}
                    <div className="pt-2.5 border-t border-[#d4af6a]/10 flex items-center justify-between gap-3">
                      <div className="shrink-0">
                        <MiniSparkline stock={stock} width={90} height={24} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStockForChart(stock)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] border border-[#d4af6a]/15 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                          <span>Gráfico</span>
                        </button>
                        <button
                          onClick={() => setSelectedStockForAi(stock)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                          <span>Explicar com IA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-10 text-center">
            <Link
              to="/mercado"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#d4af6a] hover:text-[#f0d9a8] transition-colors"
            >
              <span>Ver todas as ações da B3 com gráficos e busca</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. Prévia do Simulador de Investimentos */}
      <section className="py-20 sm:py-28 bg-[#141210]/50 border-b border-[#d4af6a]/15 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141210] border border-[#d4af6a]/25 text-xs font-mono font-semibold text-[#f0d9a8]">
                <Calculator className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Simulador Patrimonial</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight leading-tight">
                A matemática do juro composto
              </h2>

              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Com o CDI referencial em <strong>{macro.cdi.rateAnnual.toFixed(2)}% ao ano</strong>, compare a evolução do patrimônio com aportes regulares frente à Poupança e outros indicadores.
              </p>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[#c2b9ac]">
                  <span>Aporte inicial R$ 5.000 + R$ 500/mês por 3 anos:</span>
                </div>
                <div className="flex justify-between items-center text-[#c2b9ac] pt-2 border-t border-[#d4af6a]/10">
                  <span>Poupança (6,17% a.a. - Isenta):</span>
                  <span className="font-semibold text-[#f5efe6]">R$ 25.130</span>
                </div>
                <div className="flex justify-between items-center text-[#d4af6a] font-bold">
                  <span>CDI 100% Líquido ({macro.cdi.rateAnnual.toFixed(2)}% a.a.):</span>
                  <span className="text-sm">R$ 26.638 (já descontado IR 15%)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/simulador"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,106,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  <span>Abrir Simulador Completo com Gráfico</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs uppercase font-mono text-[#c2b9ac] tracking-wider">
                      Descolamento da Curva
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6]">
                      Evolução de Patrimônio
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#d4af6a] bg-[#1c1916] px-2.5 py-1 rounded-full border border-[#d4af6a]/25 font-semibold">
                    CDI {macro.cdi.rateAnnual.toFixed(2)}% a.a.
                  </span>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-[#f5efe6] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#d4af6a] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#d4af6a]" /> 100% do CDI (Bruto R$ 27.280)
                      </span>
                      <span className="font-bold text-[#d4af6a]">R$ 26.638 (Líquido)</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#b58d46] to-[#f0d9a8] rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#f5efe6] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#3ddc97]">
                        <span className="w-2 h-2 rounded-full bg-[#3ddc97]" /> Ibovespa Histórico (12,5% a.a.)
                      </span>
                      <span className="font-bold text-[#f5efe6]">R$ 28.210</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2ea872] to-[#3ddc97] rounded-full w-[100%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#c2b9ac] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#c2b9ac]">
                        <span className="w-2 h-2 rounded-full bg-[#6e675c]" /> Poupança Tradicional (6,17% a.a. - Isenta)
                      </span>
                      <span>R$ 25.130</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6e675c] rounded-full w-[80%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#8c8273] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#8c8273]">
                        <span className="w-2 h-2 rounded-full bg-[#3d3830]" /> Total Investido (Sem Juros)
                      </span>
                      <span>R$ 23.000</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3d3830] rounded-full w-[65%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#c2b9ac]">
                  <span>Projeção para 36 meses com tabela regressiva de IR.</span>
                  <Link to="/simulador" className="text-[#d4af6a] hover:text-[#f0d9a8] font-semibold">
                    Simular outros valores →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Prévia da Inteligência Artificial */}
      <section className="py-20 sm:py-28 bg-[#0b0a09] border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-[0_12px_45px_rgba(0,0,0,0.6)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1916] border border-[#d4af6a]/25 text-xs font-mono font-semibold text-[#f0d9a8]">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                  <span>Síntese Algorítmica</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight leading-tight">
                  Entenda o que moveu cada ativo em segundos
                </h2>

                <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                  A IA gera hipóteses em linguagem simples sobre o que pode ter influenciado o preço, relacionando notícias, commodities e decisões de política monetária.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    to="/ia"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,106,0.25)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Conhecer a Tecnologia da IA</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/mercado"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] bg-[#1c1916] text-[#f5efe6] hover:text-[#d4af6a] border border-[#d4af6a]/20 text-xs sm:text-sm font-medium transition-all"
                  >
                    <span>Consultar Ações da B3</span>
                  </Link>
                </div>
              </div>

              {/* Sample AI Answer Mock - Rotulado como "Exemplo ilustrativo" */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-[14px] bg-[#1c1916] border border-[#d4af6a]/20 shadow-2xl space-y-3.5 font-mono text-xs relative">
                  
                  {/* Selo Exemplo Ilustrativo */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3ddc97]" />
                      <span className="font-bold text-[#f5efe6]">PETR4 (Petrobras)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#141210] border border-[#d4af6a]/20 text-[10px] font-mono text-[#d4af6a] font-semibold">
                      Exemplo ilustrativo
                    </span>
                  </div>

                  <p className="text-[#f5efe6]/90 leading-relaxed font-sans text-xs">
                    "A alta das ações da Petrobras foi impulsionada pela valorização de mais de 2% do barril de petróleo Brent no mercado internacional, associada à divulgação de fortes dados operacionais no pré-sal."
                  </p>

                  <div className="pt-2 border-t border-[#d4af6a]/10 flex items-center justify-between text-[10px] text-[#8c8273]">
                    <span>Síntese Educacional IA</span>
                    <span className="text-[#d4af6a]">Conteúdo educacional</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. Prévia das Mini-Aulas */}
      <section className="py-20 sm:py-28 bg-[#0b0a09] border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider mb-2.5">
                <GraduationCap className="w-4 h-4" />
                Educação Financeira
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Mini-Aulas para Iniciantes
              </h2>
              <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
                Conteúdos diretos e objetivos para você dominar os conceitos fundamentais do mercado brasileiro com clareza.
              </p>
            </div>

            <Link
              to="/aprender"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs sm:text-sm font-semibold text-[#f0d9a8] transition-all shadow-sm shrink-0"
            >
              <span>Ver todas as 6 aulas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewLessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/aprender/${lesson.id}`}
                className="p-6 sm:p-7 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#1c1916] transition-all duration-200 shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getLessonIcon(lesson.iconName)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/10">
                      {lesson.category}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-[#c2b9ac] mt-2.5 line-clamp-2 leading-relaxed font-normal">
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273]">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#c2b9ac]" />
                    <span className="text-[#c2b9ac]">{lesson.readTime}</span>
                  </div>
                  <span className="font-semibold text-[#d4af6a] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono">
                    Ler aula <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Newsletter Capture */}
      <NewsletterCta />
    </div>
  );
};
