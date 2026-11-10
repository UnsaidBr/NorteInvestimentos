import React, { useState, useMemo, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { StaticReferenceNotice } from '../components/StaticReferenceNotice';
import { APP_NAME } from '../constants/config';
import { FiiItem, FiiSegment, FiiType } from '../types/fundamental';
import { getFiisList, FiiOverviewMetrics } from '../services/fundamentalService';
import { AssetLogo } from '../components/AssetLogo';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  Coins,
  Percent,
  CheckCircle2,
  Info,
  ExternalLink,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type SortField =
  | 'ticker'
  | 'price'
  | 'changePercent'
  | 'pvp'
  | 'dy12m'
  | 'lastDividend'
  | 'vacanciaFisica'
  | 'numImoveis'
  | 'liquidezDiaria';

export const FiisPage: React.FC = () => {
  usePageMeta(
    `Painel de Fundos Imobiliários (FIIs & IFIX) | ${APP_NAME}`,
    'Acompanhe os maiores Fundos Imobiliários da B3 por segmento (Tijolo, Papel, FoF, Fiagro), P/VP, dividend yield, vacância física e proventos mensais por cota.'
  );

  const [selectedSegment, setSelectedSegment] = useState<string>('TODOS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [maxPvp, setMaxPvp] = useState<number>(1.2);
  const [minDy, setMinDy] = useState<number>(0);
  const [maxVacancia, setMaxVacancia] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dy12m');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedFii, setSelectedFii] = useState<FiiItem | null>(null);

  const [fiisList, setFiisList] = useState<FiiItem[]>([]);
  const [overview, setOverview] = useState<FiiOverviewMetrics>({
    avgPvp: 0,
    avgDy12m: 0,
    avgVacanciaFisica: 0,
    totalFunds: 0,
    totalMarketCap: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFiisList(selectedSegment, selectedType, maxPvp, minDy, maxVacancia).then((data) => {
      setFiisList(data.fiis);
      setOverview(data.overview);
      setLoading(false);
    });
  }, [selectedSegment, selectedType, maxPvp, minDy, maxVacancia]);

  // Filtragem adicional de busca e ordenação
  const processedFiis = useMemo(() => {
    let list = [...fiisList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.ticker.toLowerCase().includes(q) ||
          f.friendlyName.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.segment.toLowerCase().includes(q) ||
          f.administrador.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [fiisList, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const segments: Array<{ id: string; label: string }> = [
    { id: 'TODOS', label: 'Todos os FIIs' },
    { id: 'Logística', label: 'Tijolo • Logística' },
    { id: 'Shoppings', label: 'Tijolo • Shoppings' },
    { id: 'Lajes Corporativas', label: 'Tijolo • Lajes' },
    { id: 'Renda Urbana', label: 'Tijolo • Renda Urbana' },
    { id: 'Papel / CRIs', label: 'Papel (CRIs)' },
    { id: 'Fundos de Fundos (FoF)', label: 'Fundos de Fundos (FoF)' },
    { id: 'Fiagro', label: 'Fiagro (Agronegócio)' },
  ];

  return (
    <div>
      <PageHeader
        badge="Mercado Imobiliário B3"
        badgeColor="gold"
        title="Painel de"
        titleHighlight="Fundos Imobiliários (FIIs)"
        subtitle="Métricas completas do setor imobiliário: relação P/VP, rendimento mensal por cota, dividend yield de 12 meses e vacância física de tijolo e papel."
        breadcrumbs={[{ label: 'Fundos Imobiliários' }]}
      >
        <Link
          to="/radar"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs font-mono font-medium text-[#f0d9a8] transition-all cursor-pointer shadow-sm"
        >
          <span>Ir para Rastreador Fundamentalista →</span>
        </Link>
      </PageHeader>
      <StaticReferenceNotice what="O Painel de FIIs" />

      <div className="py-12 sm:py-16 bg-[#0b0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* IFIX & Sector Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-1">
              <span className="text-[11px] font-mono text-[#8c8273] uppercase tracking-wider block">
                P/VP Médio do Mercado
              </span>
              <div className="text-2xl font-serif font-bold text-[#f5efe6] tabular-nums">
                {overview.avgPvp}x
              </div>
              <span className="text-[11px] font-mono text-[#3ddc97]">
                {overview.avgPvp < 1 ? 'Negociando com desconto' : 'Próximo ao laudo'}
              </span>
            </div>

            <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-1">
              <span className="text-[11px] font-mono text-[#8c8273] uppercase tracking-wider block">
                Dividend Yield Médio 12m
              </span>
              <div className="text-2xl font-serif font-bold text-[#3ddc97] tabular-nums">
                {overview.avgDy12m}%
              </div>
              <span className="text-[11px] font-mono text-[#8c8273]">
                Isento de IR para pessoa física
              </span>
            </div>

            <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-1">
              <span className="text-[11px] font-mono text-[#8c8273] uppercase tracking-wider block">
                Vacância Física (Tijolo)
              </span>
              <div className="text-2xl font-serif font-bold text-[#f0d9a8] tabular-nums">
                {overview.avgVacanciaFisica}%
              </div>
              <span className="text-[11px] font-mono text-[#8c8273]">
                Média dos galpões e shoppings
              </span>
            </div>

            <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-1">
              <span className="text-[11px] font-mono text-[#8c8273] uppercase tracking-wider block">
                FIIs Monitorados
              </span>
              <div className="text-2xl font-serif font-bold text-[#f5efe6] tabular-nums">
                {overview.totalFunds} Fundos
              </div>
              <span className="text-[11px] font-mono text-[#8c8273]">
                Mais líquidos da B3
              </span>
            </div>
          </div>

          {/* Segment Selector Tabs */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8c8273] font-bold block">
              Filtrar por Segmento Imobiliário:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {segments.map((seg) => {
                const isActive = selectedSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#d4af6a] text-[#0b0a09] border-[#d4af6a] font-bold shadow'
                        : 'bg-[#141210] text-[#c2b9ac] border-[#d4af6a]/20 hover:border-[#d4af6a]/40 hover:text-[#f5efe6]'
                    }`}
                  >
                    {seg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filters and Search */}
          <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#d4af6a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar FII (ex: HGLG11, MXRF11, XP Malls)..."
                className="w-full pl-10 pr-4 py-2 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a]"
              />
            </div>

            {/* Quick Sliders */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#8c8273]">P/VP Máximo:</span>
                <span className="text-[#f5efe6] font-bold">{maxPvp}x</span>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={maxPvp}
                  onChange={(e) => setMaxPvp(parseFloat(e.target.value))}
                  className="w-24 accent-[#d4af6a]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#8c8273]">DY Mínimo:</span>
                <span className="text-[#3ddc97] font-bold">{minDy}%</span>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.5"
                  value={minDy}
                  onChange={(e) => setMinDy(parseFloat(e.target.value))}
                  className="w-24 accent-[#d4af6a]"
                />
              </div>

              {(maxPvp !== 1.2 || minDy !== 0 || searchQuery || selectedSegment !== 'TODOS') && (
                <button
                  onClick={() => {
                    setMaxPvp(1.2);
                    setMinDy(0);
                    setSearchQuery('');
                    setSelectedSegment('TODOS');
                  }}
                  className="text-[#f0d9a8] hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* High Density FII Table */}
          <div className="rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1c1916] border-b border-[#d4af6a]/15 text-[#8c8273] uppercase tracking-wider text-[11px]">
                    <th
                      onClick={() => handleSort('ticker')}
                      className="py-3.5 px-4 font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      <div className="flex items-center gap-1">
                        <span>FII</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-3 font-bold">Segmento</th>
                    <th
                      onClick={() => handleSort('price')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Cotação
                    </th>
                    <th
                      onClick={() => handleSort('pvp')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      P/VP
                    </th>
                    <th
                      onClick={() => handleSort('dy12m')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8] bg-[#d4af6a]/5"
                    >
                      DY 12m
                    </th>
                    <th
                      onClick={() => handleSort('lastDividend')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Último Rend.
                    </th>
                    <th
                      onClick={() => handleSort('vacanciaFisica')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Vac. Física
                    </th>
                    <th
                      onClick={() => handleSort('numImoveis')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Imóveis
                    </th>
                    <th
                      onClick={() => handleSort('liquidezDiaria')}
                      className="py-3.5 px-4 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Liquidez / Dia
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#d4af6a]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#8c8273]">
                        Carregando fundos imobiliários e demonstrativos...
                      </td>
                    </tr>
                  ) : processedFiis.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#8c8273]">
                        Nenhum FII atende aos critérios do filtro.
                      </td>
                    </tr>
                  ) : (
                    processedFiis.map((fii) => {
                      const isDiscount = fii.pvp < 1.0;

                      return (
                        <tr
                          key={fii.ticker}
                          onClick={() => setSelectedFii(fii)}
                          className="hover:bg-[#1c1916]/80 transition-colors cursor-pointer group"
                        >
                          {/* Ticker & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <AssetLogo ticker={fii.ticker} name={fii.name} size="sm" />
                              <div className="min-w-0">
                                <div className="font-bold text-[#f0d9a8] group-hover:underline">
                                  {fii.ticker}
                                </div>
                                <div className="text-[11px] text-[#8c8273] font-sans truncate max-w-[140px]">
                                  {fii.friendlyName}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Segmento */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#1c1916] border border-[#d4af6a]/15 text-[#c2b9ac]">
                              {fii.segment}
                            </span>
                          </td>

                          {/* Cotação */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6] font-semibold">
                            {formatBRL(fii.price)}
                          </td>

                          {/* P/VP */}
                          <td className="py-3 px-3 text-right tabular-nums font-bold">
                            <span className={isDiscount ? 'text-[#3ddc97]' : 'text-[#f0d9a8]'}>
                              {fii.pvp.toFixed(2)}x
                            </span>
                          </td>

                          {/* DY 12m */}
                          <td className="py-3 px-3 text-right tabular-nums font-bold text-[#3ddc97] bg-[#d4af6a]/5">
                            {fii.dy12m}%
                          </td>

                          {/* Último Provento */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6]">
                            {formatBRL(fii.lastDividend)}
                          </td>

                          {/* Vacância Física */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#c2b9ac]">
                            {fii.type === 'Tijolo' ? `${fii.vacanciaFisica}%` : '—'}
                          </td>

                          {/* Imóveis */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#8c8273]">
                            {fii.numImoveis > 0 ? fii.numImoveis : 'Papel/Ativos'}
                          </td>

                          {/* Liquidez */}
                          <td className="py-3 px-4 text-right tabular-nums text-[#8c8273]">
                            {formatBRL(fii.liquidezDiaria)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informational Guidance Box */}
          <div className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-3 text-xs leading-relaxed text-[#c2b9ac]">
            <div className="flex items-center gap-2 font-mono font-bold uppercase text-[#f0d9a8]">
              <Info className="w-4 h-4 text-[#d4af6a]" />
              <span>Conceitos Chave dos Fundos Imobiliários</span>
            </div>
            <p>
              <strong>P/VP (Preço sobre Valor Patrimonial):</strong> Um P/VP de 0,95 indica que o investidor está pagando R$ 0,95 para cada R$ 1,00 de patrimônio físico avaliado pelo laudo dos imóveis (desconto de 5%). Fundos de papel com P/VP acima de 1,05 merecem cautela redobrada.
            </p>
            <p>
              <strong>Vacância Física vs. Financeira:</strong> A vacância física mede a área bruta locável desocupada (m²), enquanto a vacância financeira reflete a perda de fluxo de aluguel por descontos, carências ou inadimplência contratual.
            </p>
          </div>

        </div>
      </div>

      {/* Modal de Detalhes do FII */}
      {selectedFii && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141210] border border-[#d4af6a]/30 rounded-[18px] shadow-2xl p-6 sm:p-8 space-y-6 text-[#c2b9ac]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#d4af6a]/15 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#f0d9a8] bg-[#d4af6a]/15 px-2.5 py-0.5 rounded border border-[#d4af6a]/30">
                    {selectedFii.ticker}
                  </span>
                  <span className="text-xs font-mono text-[#8c8273]">
                    {selectedFii.segment} • {selectedFii.type}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] mt-1.5">
                  {selectedFii.name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                  <span className="text-[#f5efe6] font-bold text-sm">
                    {formatBRL(selectedFii.price)}
                  </span>
                  <span className={selectedFii.changePercent >= 0 ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}>
                    {formatPercent(selectedFii.changePercent)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedFii(null)}
                className="p-2 rounded-full bg-[#1c1916] hover:bg-[#25221e] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
                <div className="text-[#8c8273]">P/VP</div>
                <div className="text-sm font-bold text-[#f0d9a8] mt-0.5">{selectedFii.pvp.toFixed(2)}x</div>
              </div>
              <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
                <div className="text-[#8c8273]">DY 12m</div>
                <div className="text-sm font-bold text-[#3ddc97] mt-0.5">{selectedFii.dy12m}%</div>
              </div>
              <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
                <div className="text-[#8c8273]">Último Provento</div>
                <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{formatBRL(selectedFii.lastDividend)}</div>
              </div>
              <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
                <div className="text-[#8c8273]">Vacância Física</div>
                <div className="text-sm font-bold text-[#f5efe6] mt-0.5">
                  {selectedFii.type === 'Tijolo' ? `${selectedFii.vacanciaFisica}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Destaques do Fundo */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs font-bold uppercase text-[#f5efe6] tracking-wider">
                Características & Portfólio
              </h4>
              <ul className="text-xs space-y-2 text-[#c2b9ac]">
                {selectedFii.pontosDestaque.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ddc97] shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informações Institucionais */}
            <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/15 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8c8273]">Administrador:</span>
                <span className="text-[#f5efe6]">{selectedFii.administrador}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8273]">Patrimônio Líquido:</span>
                <span className="text-[#f5efe6]">{formatBRL(selectedFii.patrimonioLiquido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8273]">Quantidade de Ativos:</span>
                <span className="text-[#f5efe6]">{selectedFii.numImoveis > 0 ? `${selectedFii.numImoveis} imóveis` : 'Carteira de títulos'}</span>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-[#0b0a09] border border-[#d4af6a]/10 text-[11px] text-[#8c8273]">
              Os rendimentos de FIIs pagos a pessoas físicas contam com isenção de IR no Brasil conforme os requisitos da Lei nº 8.668/1993.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
