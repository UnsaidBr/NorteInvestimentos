import React, { useState, useMemo } from 'react';
import { MacroIndicators, SimulatorComparisonData } from '../types/market';
import { formatBRL } from '../utils/formatters';
import { Calculator, Landmark, ShieldAlert, FileText, Info } from 'lucide-react';
import { DataSourceBadge } from './DataSourceBadge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface SimulatorSectionProps {
  macro: MacroIndicators;
  isDemoMode?: boolean;
  lastUpdated?: Date;
}

export const SimulatorSection: React.FC<SimulatorSectionProps> = ({
  macro,
  isDemoMode = false,
  lastUpdated = new Date(),
}) => {
  const [initialAmount, setInitialAmount] = useState<number>(5000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(500);
  const [periodMonths, setPeriodMonths] = useState<number>(36);

  const cdiAnnual = macro.cdi.rateAnnual || 10.65;
  const poupancaAnnual = 6.17;
  const ibovespaAnnual = 12.50;
  const dolarAnnual = 8.00;

  const [visibleSeries, setVisibleSeries] = useState({
    cdi: true,
    ibovespa: true,
    dolar: true,
    poupanca: true,
    totalDeposited: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Official Brazilian regressive income tax table for fixed income
  const getIncomeTaxRate = (months: number) => {
    const days = months * 30;
    if (days <= 180) return 0.225; // 22.5%
    if (days <= 360) return 0.200; // 20.0%
    if (days <= 720) return 0.175; // 17.5%
    return 0.150; // 15.0%
  };

  const taxRate = getIncomeTaxRate(periodMonths);
  const taxRatePercent = (taxRate * 100).toFixed(1);

  const SERIES_CONFIG = {
    cdi: {
      name: 'CDI (100%)',
      color: '#d4af6a',
      rate: `${cdiAnnual.toFixed(2)}% a.a.`,
    },
    ibovespa: {
      name: 'Ibovespa',
      color: '#3ddc97',
      rate: '12,50% a.a.',
    },
    dolar: {
      name: 'Dólar',
      color: '#e5c07b',
      rate: '8,00% a.a.',
    },
    poupanca: {
      name: 'Poupança',
      color: '#a39a8c',
      rate: '6,17% a.a.',
    },
    totalDeposited: {
      name: 'Total Aportado',
      color: '#6e675c',
      rate: 'Principal',
    },
  };

  const simulationResults = useMemo(() => {
    const data: SimulatorComparisonData[] = [];
    const monthlyCdiRate = Math.pow(1 + cdiAnnual / 100, 1 / 12) - 1;
    const monthlyPoupancaRate = Math.pow(1 + poupancaAnnual / 100, 1 / 12) - 1;
    const monthlyIbovRate = Math.pow(1 + ibovespaAnnual / 100, 1 / 12) - 1;
    const monthlyDolarRate = Math.pow(1 + dolarAnnual / 100, 1 / 12) - 1;

    let totalDeposited = initialAmount;
    let balancePoupanca = initialAmount;
    let balanceCdi = initialAmount;
    let balanceIbov = initialAmount;
    let balanceDolar = initialAmount;

    data.push({
      month: 0,
      totalDeposited,
      poupanca: Math.round(balancePoupanca),
      cdi: Math.round(balanceCdi),
      ibovespa: Math.round(balanceIbov),
      dolar: Math.round(balanceDolar),
    });

    for (let m = 1; m <= periodMonths; m++) {
      balancePoupanca = (balancePoupanca + monthlyDeposit) * (1 + monthlyPoupancaRate);
      balanceCdi = (balanceCdi + monthlyDeposit) * (1 + monthlyCdiRate);
      balanceIbov = (balanceIbov + monthlyDeposit) * (1 + monthlyIbovRate);
      balanceDolar = (balanceDolar + monthlyDeposit) * (1 + monthlyDolarRate);
      totalDeposited += monthlyDeposit;

      const step = periodMonths > 60 ? 6 : periodMonths > 24 ? 3 : 1;
      if (m % step === 0 || m === periodMonths) {
        data.push({
          month: m,
          totalDeposited: Math.round(totalDeposited),
          poupanca: Math.round(balancePoupanca),
          cdi: Math.round(balanceCdi),
          ibovespa: Math.round(balanceIbov),
          dolar: Math.round(balanceDolar),
        });
      }
    }

    const grossProfitCdi = Math.max(0, balanceCdi - totalDeposited);
    const taxDeductionCdi = grossProfitCdi * taxRate;
    const netBalanceCdi = totalDeposited + (grossProfitCdi - taxDeductionCdi);

    return {
      timeline: data,
      final: {
        totalDeposited: Math.round(totalDeposited),
        poupanca: Math.round(balancePoupanca),
        cdi: Math.round(balanceCdi),
        cdiNet: Math.round(netBalanceCdi),
        cdiTax: Math.round(taxDeductionCdi),
        cdiProfitGross: Math.round(grossProfitCdi),
        ibovespa: Math.round(balanceIbov),
        dolar: Math.round(balanceDolar),
      },
    };
  }, [initialAmount, monthlyDeposit, periodMonths, cdiAnnual, poupancaAnnual, ibovespaAnnual, dolarAnnual, taxRate]);

  const { final, timeline } = simulationResults;

  const presets = [
    { label: '1 Ano', months: 12 },
    { label: '2 Anos', months: 24 },
    { label: '3 Anos', months: 36 },
    { label: '5 Anos', months: 60 },
    { label: '10 Anos', months: 120 },
  ];

  return (
    <section id="simulador" className="py-16 sm:py-24 bg-[#0b0a09]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Data Source Origin Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-[#d4af6a]" />
                Simulação Patrimonial
              </div>
              <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
              Compare a Evolução dos Juros Compostos
            </h2>
            <p className="text-sm text-[#c2b9ac] mt-2 max-w-2xl font-normal leading-relaxed">
              Simulação comparativa entre instrumentos de Renda Fixa (CDI), Poupança tradicional, média histórica do Ibovespa e oscilação do Dólar.
            </p>
          </div>
        </div>

        {/* Input Controls Card */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Initial Amount */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#c2b9ac] uppercase tracking-wider mb-2">
                Aporte Inicial (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8273] font-mono text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[10px] text-base font-mono tabular-nums font-bold text-[#f5efe6] focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-[#8c8273] mt-1.5 block">
                Patrimônio alocado no início
              </span>
            </div>

            {/* Monthly Deposit */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#c2b9ac] uppercase tracking-wider mb-2">
                Aporte Mensal (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8273] font-mono text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[10px] text-base font-mono tabular-nums font-bold text-[#f5efe6] focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-[#8c8273] mt-1.5 block">
                Valor reinvestido todos os meses
              </span>
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#c2b9ac] uppercase tracking-wider mb-2">
                Prazo: <strong className="text-[#f5efe6] font-mono">{periodMonths} meses ({Math.floor(periodMonths / 12)}a {periodMonths % 12 > 0 ? `${periodMonths % 12}m` : ''})</strong>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {presets.map((p) => (
                  <button
                    key={p.months}
                    onClick={() => setPeriodMonths(p.months)}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-mono font-semibold transition-all cursor-pointer ${
                      periodMonths === p.months
                        ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] font-bold shadow-sm'
                        : 'bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6] border border-[#d4af6a]/15'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="6"
                max="240"
                step="6"
                value={periodMonths}
                onChange={(e) => setPeriodMonths(parseInt(e.target.value))}
                className="w-full mt-3.5 accent-[#d4af6a] cursor-pointer"
              />
            </div>

          </div>

          <div className="mt-6 pt-5 border-t border-[#d4af6a]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#c2b9ac]">
              <Landmark className="w-4 h-4 text-[#d4af6a]" />
              <span>
                Taxa Selic Meta: <strong className="text-[#f5efe6] font-mono tabular-nums">{macro.selic.rateAnnual.toFixed(2)}% a.a.</strong> • CDI: <strong className="text-[#d4af6a] font-mono tabular-nums">{cdiAnnual.toFixed(2)}% a.a.</strong>
              </span>
            </div>
            <span className="text-[11px] text-[#8c8273] font-mono">
              Fonte de dados: {macro.selic.source}
            </span>
          </div>
        </div>

        {/* Results Cards Grid (Gross vs Net IR breakdown) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          
          {/* Total Investido */}
          <div
            onClick={() => toggleSeries('totalDeposited')}
            className={`p-5 rounded-[14px] bg-[#141210] border transition-all cursor-pointer ${
              visibleSeries.totalDeposited
                ? 'border-[#d4af6a]/15 shadow-sm'
                : 'opacity-40 border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-mono font-medium text-[#8c8273]">
                Total Investido
              </span>
              <span className="text-[10px] text-[#8c8273] font-mono">Principal</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-xl text-[#f5efe6]">
              {formatBRL(final.totalDeposited, 0)}
            </div>
            <span className="text-[11px] text-[#8c8273] mt-1 block">
              Seu próprio capital aportado
            </span>
          </div>

          {/* Poupança (Isenta de IR) */}
          <div
            onClick={() => toggleSeries('poupanca')}
            className={`p-5 rounded-[14px] bg-[#141210] border transition-all cursor-pointer ${
              visibleSeries.poupanca
                ? 'border-[#d4af6a]/20 shadow-sm'
                : 'opacity-40 border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-mono font-medium text-[#c2b9ac]">
                Poupança
              </span>
              <span className="text-[10px] text-[#3ddc97] font-mono">Isenta de IR</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-xl text-[#f5efe6]">
              {formatBRL(final.poupanca, 0)}
            </div>
            <div className="text-[11px] text-[#c2b9ac] font-mono mt-1 space-y-0.5">
              <div>+{formatBRL(final.poupanca - final.totalDeposited, 0)} em juros</div>
              <span className="text-[10px] text-[#8c8273]">Alíquota: 0% (Isenta)</span>
            </div>
          </div>

          {/* CDI 100% com Bruto e Líquido de IR */}
          <div
            onClick={() => toggleSeries('cdi')}
            className={`p-5 rounded-[14px] bg-[#141210] border transition-all cursor-pointer ${
              visibleSeries.cdi
                ? 'border-[#d4af6a]/40 shadow-[0_4px_25px_rgba(212,175,106,0.15)]'
                : 'opacity-40 border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-mono font-bold text-[#d4af6a]">
                100% do CDI
              </span>
              <span className="text-[10px] text-[#f0d9a8] font-mono font-semibold">
                IR {taxRatePercent}%
              </span>
            </div>
            <div className="font-mono tabular-nums font-extrabold text-xl text-[#f0d9a8]">
              {formatBRL(final.cdiNet, 0)} <span className="text-xs font-normal text-[#c2b9ac]">(Líquido)</span>
            </div>
            <div className="text-[11px] text-[#c2b9ac] font-mono mt-1 space-y-0.5">
              <div>Bruto: {formatBRL(final.cdi, 0)}</div>
              <div className="text-[10px] text-[#ff5c6c]">IR descontado: -{formatBRL(final.cdiTax, 0)}</div>
            </div>
          </div>

          {/* Ibovespa */}
          <div
            onClick={() => toggleSeries('ibovespa')}
            className={`p-5 rounded-[14px] bg-[#141210] border transition-all cursor-pointer ${
              visibleSeries.ibovespa
                ? 'border-[#3ddc97]/30 shadow-sm'
                : 'opacity-40 border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-mono font-medium text-[#3ddc97]">
                Ibovespa (Média)
              </span>
              <span className="text-[10px] text-[#3ddc97] font-mono">12,50% a.a.</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-xl text-[#f5efe6]">
              {formatBRL(final.ibovespa, 0)}
            </div>
            <span className="text-[11px] text-[#3ddc97] font-mono tabular-nums mt-1 block">
              +{formatBRL(final.ibovespa - final.totalDeposited, 0)} em juros brutos
            </span>
          </div>

          {/* Dólar */}
          <div
            onClick={() => toggleSeries('dolar')}
            className={`p-5 rounded-[14px] bg-[#141210] border transition-all cursor-pointer ${
              visibleSeries.dolar
                ? 'border-[#e5c07b]/30 shadow-sm'
                : 'opacity-40 border-dashed border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-mono font-medium text-[#e5c07b]">
                Dólar (Tendência)
              </span>
              <span className="text-[10px] text-[#e5c07b] font-mono">8,00% a.a.</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-xl text-[#f5efe6]">
              {formatBRL(final.dolar, 0)}
            </div>
            <span className="text-[11px] text-[#e5c07b] font-mono tabular-nums mt-1 block">
              +{formatBRL(final.dolar - final.totalDeposited, 0)} em valorização
            </span>
          </div>

        </div>

        {/* Chart Card */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] tracking-tight">
                Curva de Evolução Patrimonial
              </h3>
              <p className="text-xs text-[#c2b9ac] mt-0.5">
                Clique nas legendas para ligar ou desligar as projeções comparativas.
              </p>
            </div>

            {/* Clickable Legend Pills in Champagne Gold & Luxury Palette */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <button
                onClick={() => toggleSeries('cdi')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.cdi
                    ? 'bg-[#d4af6a]/15 text-[#f0d9a8] border-[#d4af6a]/40 shadow-sm'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/10 opacity-50 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af6a]" />
                <span className="font-medium">CDI ({cdiAnnual.toFixed(1)}%)</span>
              </button>

              <button
                onClick={() => toggleSeries('ibovespa')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.ibovespa
                    ? 'bg-[#3ddc97]/15 text-[#3ddc97] border-[#3ddc97]/30 shadow-sm'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/10 opacity-50 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#3ddc97]" />
                <span className="font-medium">Ibovespa (12,5%)</span>
              </button>

              <button
                onClick={() => toggleSeries('dolar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.dolar
                    ? 'bg-[#e5c07b]/15 text-[#e5c07b] border-[#e5c07b]/30 shadow-sm'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/10 opacity-50 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]" />
                <span className="font-medium">Dólar (8%)</span>
              </button>

              <button
                onClick={() => toggleSeries('poupanca')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.poupanca
                    ? 'bg-[#1c1916] text-[#c2b9ac] border-[#d4af6a]/25 shadow-sm'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/10 opacity-50 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#a39a8c]" />
                <span className="font-medium">Poupança (6,2%)</span>
              </button>

              <button
                onClick={() => toggleSeries('totalDeposited')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  visibleSeries.totalDeposited
                    ? 'bg-[#1c1916] text-[#c2b9ac] border-[#d4af6a]/15'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/10 opacity-40 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#6e675c]" />
                <span>Aportado</span>
              </button>
            </div>
          </div>

          <div className="h-[320px] sm:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 106, 0.08)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6e675c"
                  tick={{ fontSize: 11, fill: '#c2b9ac', fontFamily: 'Space Grotesk' }}
                  tickFormatter={(val) => `Mês ${val}`}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6e675c"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#c2b9ac', fontFamily: 'Space Grotesk' }}
                  tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SimulatorComparisonData;
                      return (
                        <div className="bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/25 p-3.5 rounded-[12px] shadow-[0_12px_36px_rgba(0,0,0,0.8)] font-mono text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-[#f5efe6] pb-1.5 border-b border-[#d4af6a]/15 flex items-center justify-between">
                            <span>Mês {data.month}</span>
                            <span className="text-[#a39a8c] font-normal text-[10px]">
                              {Math.floor(data.month / 12)}a {data.month % 12}m
                            </span>
                          </div>

                          {visibleSeries.cdi && (
                            <div className="flex justify-between text-[#d4af6a] tabular-nums">
                              <span>CDI Bruto:</span>
                              <span className="font-bold">{formatBRL(data.cdi, 0)}</span>
                            </div>
                          )}

                          {visibleSeries.ibovespa && (
                            <div className="flex justify-between text-[#3ddc97] tabular-nums">
                              <span>Ibovespa:</span>
                              <span className="font-bold">{formatBRL(data.ibovespa, 0)}</span>
                            </div>
                          )}

                          {visibleSeries.dolar && (
                            <div className="flex justify-between text-[#e5c07b] tabular-nums">
                              <span>Dólar:</span>
                              <span className="font-bold">{formatBRL(data.dolar, 0)}</span>
                            </div>
                          )}

                          {visibleSeries.poupanca && (
                            <div className="flex justify-between text-[#a39a8c] tabular-nums">
                              <span>Poupança:</span>
                              <span className="font-bold">{formatBRL(data.poupanca, 0)}</span>
                            </div>
                          )}

                          {visibleSeries.totalDeposited && (
                            <div className="flex justify-between text-[#8c8273] pt-1 border-t border-[#d4af6a]/10 tabular-nums">
                              <span>Aportado:</span>
                              <span>{formatBRL(data.totalDeposited, 0)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="cdi"
                  name={SERIES_CONFIG.cdi.name}
                  stroke={SERIES_CONFIG.cdi.color}
                  strokeWidth={2.5}
                  dot={false}
                  hide={!visibleSeries.cdi}
                  isAnimationActive={true}
                  animationDuration={800}
                />

                <Line
                  type="monotone"
                  dataKey="ibovespa"
                  name={SERIES_CONFIG.ibovespa.name}
                  stroke={SERIES_CONFIG.ibovespa.color}
                  strokeWidth={2.2}
                  dot={false}
                  hide={!visibleSeries.ibovespa}
                  isAnimationActive={true}
                  animationDuration={800}
                />

                <Line
                  type="monotone"
                  dataKey="dolar"
                  name={SERIES_CONFIG.dolar.name}
                  stroke={SERIES_CONFIG.dolar.color}
                  strokeWidth={2}
                  dot={false}
                  hide={!visibleSeries.dolar}
                  isAnimationActive={true}
                  animationDuration={800}
                />

                <Line
                  type="monotone"
                  dataKey="poupanca"
                  name={SERIES_CONFIG.poupanca.name}
                  stroke={SERIES_CONFIG.poupanca.color}
                  strokeWidth={2}
                  dot={false}
                  hide={!visibleSeries.poupanca}
                  isAnimationActive={true}
                  animationDuration={800}
                />

                <Line
                  type="monotone"
                  dataKey="totalDeposited"
                  name={SERIES_CONFIG.totalDeposited.name}
                  stroke={SERIES_CONFIG.totalDeposited.color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  hide={!visibleSeries.totalDeposited}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Mathematical Formula and Assumptions Card */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md space-y-6 text-xs text-[#c2b9ac] mb-6">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#f5efe6] pb-3 border-b border-[#d4af6a]/15">
            <FileText className="w-4 h-4 text-[#d4af6a]" />
            <span>Fórmula Matemática e Premissas Utilizadas na Simulação</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Col 1: Formula */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase font-bold text-[#f0d9a8]">
                1. Fórmula de Juros Compostos com Aportes Regulares
              </h4>
              <div className="p-4 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 font-mono text-center text-sm text-[#f5efe6]">
                M = C · (1 + i)^t + PMT · [ ((1 + i)^t - 1) / i ]
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-[#c2b9ac]">
                <li><strong>M:</strong> Montante total acumulado bruto ao final do período.</li>
                <li><strong>C:</strong> Aporte inicial aplicado no instante inicial (mês zero).</li>
                <li><strong>PMT:</strong> Aporte mensal regular realizado no início de cada mês.</li>
                <li><strong>i:</strong> Taxa de juros mensal equivalente, obtida por: <em>(1 + i_anual)^(1/12) - 1</em>.</li>
                <li><strong>t:</strong> Prazo da simulação em meses corridos ({periodMonths} meses).</li>
              </ul>
            </div>

            {/* Col 2: Regressive Tax Table & Assumptions */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase font-bold text-[#f0d9a8]">
                2. Tabela Regressiva de IR e Premissas
              </h4>
              <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 text-[11px] space-y-1.5 font-mono">
                <div className="flex justify-between text-[#c2b9ac]">
                  <span>Até 180 dias (≤ 6 meses):</span>
                  <span className="font-bold text-[#f5efe6]">22,5%</span>
                </div>
                <div className="flex justify-between text-[#c2b9ac]">
                  <span>De 181 a 360 dias (7 a 12 meses):</span>
                  <span className="font-bold text-[#f5efe6]">20,0%</span>
                </div>
                <div className="flex justify-between text-[#c2b9ac]">
                  <span>De 361 a 720 dias (13 a 24 meses):</span>
                  <span className="font-bold text-[#f5efe6]">17,5%</span>
                </div>
                <div className="flex justify-between text-[#d4af6a]">
                  <span>Acima de 720 dias (&gt; 24 meses):</span>
                  <span className="font-bold">15,0% (aplicada no prazo atual: {periodMonths}m)</span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>Premissas:</strong> O imposto incide exclusivamente sobre o rendimento (lucro) auferido. A poupança é legalmente isenta de imposto de renda para pessoas físicas (Lei 12.703/2012). As taxas são nominais constantes e a simulação possui finalidade didática.
              </p>
            </div>

          </div>
        </div>

        {/* Regulatory note */}
        <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3 text-xs text-[#c2b9ac]">
          <ShieldAlert className="w-4 h-4 text-[#d4af6a] shrink-0 mt-0.5" />
          <p>
            <strong>Aviso de risco e conteúdo educacional:</strong> Simulação baseada em taxas nominais constantes para fins estritamente pedagógicos. Rentabilidade passada de ativos de renda variável (Ibovespa e Dólar) não representa garantia de rentabilidade futura. A remuneração em renda fixa pode oscilar com as deliberações do Copom/Banco Central.
          </p>
        </div>

      </div>
    </section>
  );
};
