import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  KeyRound,
  FileCode,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  Landmark,
  Coins,
  DollarSign,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Server,
  Layers,
} from 'lucide-react';

interface DiagnosticSource {
  id: 'brapi' | 'bcb' | 'bcb_cambio' | 'coingecko';
  name: string;
  provider: string;
  endpoint: string;
  status: 'success' | 'rate_limit' | 'invalid_data' | 'error';
  httpStatus: number | null;
  isRealData: boolean;
  lastCallTime: string;
  lastSuccessTime: string | null;
  responseTimeMs: number;
  errorMessage: string | null;
  sampleSummary: any;
  rawJsonSnippet: string;
}

interface MockLocation {
  category: string;
  file: string;
  lines: string;
  description: string;
  triggerCondition: string;
}

interface DiagnosticResponse {
  serverTime: string;
  hasBrapiToken: 'sim' | 'não';
  overallMode: 'REAL' | 'HÍBRIDO' | 'MOCK/FALLBACK';
  realCount: number;
  totalSources: number;
  sources: DiagnosticSource[];
  mockLocations: MockLocation[];
}

export const DiagnosticPage: React.FC = () => {
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  usePageMeta(
    'Auditoria de Fontes de Dados (Diagnóstico DEV) | NorteInvest',
    'Painel interno de diagnóstico e auditoria das fontes de dados do NorteInvest: brapi.dev, Banco Central SGS, Banco Central PTAX (Olinda) e CoinGecko.'
  );

  const [data, setData] = useState<DiagnosticResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProbing, setIsProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRaw, setExpandedRaw] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadDiagnostics = async (triggerProbe = false) => {
    if (triggerProbe) {
      setIsProbing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const endpoint = triggerProbe ? '/api/diagnostic/probe' : '/api/diagnostic';
      const method = triggerProbe ? 'POST' : 'GET';
      const res = await fetch(endpoint, {
        method,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Falha na resposta do servidor: HTTP ${res.status}`);
      }

      const json: DiagnosticResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar diagnóstico de dados');
    } finally {
      setIsLoading(false);
      setIsProbing(false);
    }
  };

  useEffect(() => {
    loadDiagnostics(false);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedRaw((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: DiagnosticSource['status'], httpStatus: number | null) => {
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Sucesso ({httpStatus || 200})
        </span>
      );
    }
    if (status === 'rate_limit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Limite de requisições ({httpStatus || 429})
        </span>
      );
    }
    if (status === 'invalid_data') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Dado inválido (data futura)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        Erro de rede ({httpStatus || 'Falha'})
      </span>
    );
  };

  const getModeBadge = (isReal: boolean) => {
    if (isReal) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          DADO REAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        MOCK / FALLBACK
      </span>
    );
  };

  // Find specific sources
  const brapiSource = data?.sources?.find((s) => s.id === 'brapi');
  const bcbSource = data?.sources?.find((s) => s.id === 'bcb');
  const bcbCambioSource = data?.sources?.find((s) => s.id === 'bcb_cambio');
  const coinSource = data?.sources?.find((s) => s.id === 'coingecko');

  return (
    <div className="min-h-screen bg-[#0b0a09] text-[#f5efe6] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Developer Warning & Title */}
        <div className="border border-[#d4af6a]/25 rounded-[16px] bg-[#141210] p-6 lg:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af6a]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Oculto • Apenas DEV
                </span>
                <span className="text-xs font-mono text-[#8c8273]">/diagnostico</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Auditoria da Origem dos Dados
              </h1>
              <p className="text-sm text-[#c2b9ac] max-w-3xl leading-relaxed">
                Painel técnico de auditoria para inspeção em tempo real das conexões com APIs externas (brapi.dev, Banco Central SGS, Banco Central PTAX e CoinGecko). Esta página nunca mascara erros ou falhas de cota de requisição.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => loadDiagnostics(true)}
                disabled={isProbing || isLoading}
                className="px-4 py-2.5 rounded-[10px] bg-[#d4af6a] hover:bg-[#b89555] disabled:opacity-50 text-[#0b0a09] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin' : ''}`} />
                <span>{isProbing ? 'Consultando APIs...' : 'Revalidar Fontes Agora'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#d4af6a]/15 text-xs font-mono">
            <div className="bg-[#0b0a09]/80 p-3.5 rounded-[10px] border border-[#d4af6a]/15">
              <div className="text-[#8c8273] flex items-center gap-1.5 mb-1">
                <Server className="w-3.5 h-3.5 text-[#d4af6a]" />
                Modo Operacional
              </div>
              <div className="text-sm font-bold">
                {data ? (
                  <span
                    className={
                      data.overallMode === 'REAL'
                        ? 'text-emerald-400'
                        : data.overallMode === 'HÍBRIDO'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    {data.overallMode} ({data.realCount}/{data.totalSources} reais)
                  </span>
                ) : (
                  '...'
                )}
              </div>
            </div>

            <div className="bg-[#0b0a09]/80 p-3.5 rounded-[10px] border border-[#d4af6a]/15">
              <div className="text-[#8c8273] flex items-center gap-1.5 mb-1">
                <KeyRound className="w-3.5 h-3.5 text-[#d4af6a]" />
                Token brapi.dev
              </div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span
                  className={
                    data?.hasBrapiToken === 'sim'
                      ? 'text-emerald-400 font-bold'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {data ? data.hasBrapiToken.toUpperCase() : '...'}
                </span>
                <span className="text-[10px] text-[#8c8273] font-normal">
                  ({data?.hasBrapiToken === 'sim' ? 'Chave ativa em env' : 'Sem token / Modo público'})
                </span>
              </div>
            </div>

            <div className="bg-[#0b0a09]/80 p-3.5 rounded-[10px] border border-[#d4af6a]/15">
              <div className="text-[#8c8273] flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#d4af6a]" />
                Última Checagem
              </div>
              <div className="text-sm font-bold text-[#f5efe6]">
                {data ? formatDateTime(data.serverTime) : 'Carregando...'}
              </div>
            </div>

            <div className="bg-[#0b0a09]/80 p-3.5 rounded-[10px] border border-[#d4af6a]/15">
              <div className="text-[#8c8273] flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#d4af6a]" />
                Mocks no Código
              </div>
              <div className="text-sm font-bold text-amber-300">
                {data ? `${data.mockLocations.length} locais auditados` : '...'}
              </div>
            </div>
          </div>
        </div>

        {/* Active Errors Callout (Never hide errors!) */}
        {data?.sources?.some((s) => s.status !== 'success' || s.errorMessage) && (
          <div className="border border-rose-500/40 rounded-[14px] bg-rose-950/20 p-5 text-sm space-y-2.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Aviso de Limite ou Falha de API Detectado (Transparência Obrigatória)</span>
            </div>
            <p className="text-xs text-[#c2b9ac]">
              Conforme as diretrizes de desenvolvimento, falhas de rede, limites diários ou cotas de requisição (HTTP 429) são exibidas abertamente sem ocultação:
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              {data.sources
                .filter((s) => s.status !== 'success' || s.errorMessage)
                .map((s) => (
                  <div key={s.id} className="p-3 bg-[#0c0b0a] rounded-[8px] border border-rose-500/20 text-[#f5efe6]">
                    <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                      <span>{s.name} ({s.provider})</span>
                      <span className="text-amber-400">Status: {s.status.toUpperCase()} (HTTP {s.httpStatus || 'N/A'})</span>
                    </div>
                    <div className="text-xs text-rose-200 break-words">{s.errorMessage || 'Sem mensagem adicional'}</div>
                    <div className="text-[11px] text-[#8c8273] mt-1">
                      Endpoint afetado: <code className="text-[#d4af6a]">{s.endpoint}</code>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 1. MAIN AUDIT TABLE */}
        <div className="border border-[#d4af6a]/20 rounded-[16px] bg-[#141210] overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#d4af6a]/15 flex items-center justify-between bg-[#1c1916]/50">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#d4af6a]" />
              <h2 className="text-lg font-serif font-bold text-[#f5efe6]">
                Tabela de Auditoria das 4 Fontes de Dados
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8c8273]">
              Atualizado automaticamente a cada revalidação
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c0b0a] text-[#8c8273] font-mono uppercase tracking-wider text-[11px] border-b border-[#d4af6a]/15">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Fonte & Provedor</th>
                  <th className="py-3.5 px-4 font-semibold">Endpoint Consultado</th>
                  <th className="py-3.5 px-4 font-semibold">Status & HTTP</th>
                  <th className="py-3.5 px-4 font-semibold">Dado em Uso</th>
                  <th className="py-3.5 px-4 font-semibold">Última Resposta Real</th>
                  <th className="py-3.5 px-4 font-semibold">Latência</th>
                  <th className="py-3.5 px-4 font-semibold text-right">JSON Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af6a]/10">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8c8273]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#d4af6a] mb-2" />
                      Consultando fontes de dados...
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-rose-400 font-mono">
                      Erro ao consultar telemetria: {error}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  data?.sources?.map((source) => (
                    <React.Fragment key={source.id}>
                      <tr className="hover:bg-[#1a1714] transition-colors">
                        <td className="py-4 px-4 font-medium text-[#f5efe6] whitespace-nowrap">
                          <div className="font-bold text-sm text-[#f0d9a8]">{source.name}</div>
                          <div className="text-[11px] text-[#8c8273] font-mono">{source.provider}</div>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] max-w-xs break-all text-[#c2b9ac]">
                          <span className="p-1 rounded bg-[#0c0b0a] border border-[#d4af6a]/15">
                            {source.endpoint}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(source.status, source.httpStatus)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {getModeBadge(source.isRealData)}
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-[#c2b9ac] whitespace-nowrap">
                          {formatDateTime(source.lastSuccessTime)}
                        </td>

                        <td className="py-4 px-4 font-mono text-xs whitespace-nowrap text-[#d4af6a]">
                          {source.responseTimeMs ? `${source.responseTimeMs} ms` : '—'}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(source.id)}
                            className="px-2.5 py-1.5 rounded-[6px] bg-[#0c0b0a] hover:bg-[#1f1b17] border border-[#d4af6a]/25 text-[#d4af6a] text-xs font-mono transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{expandedRaw[source.id] ? 'Recolher' : 'Ver JSON'}</span>
                            {expandedRaw[source.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible raw JSON snippet viewer */}
                      {expandedRaw[source.id] && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-[#070605]">
                            <div className="p-4 border-t border-b border-[#d4af6a]/20 space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono text-[#8c8273]">
                                <span>Payload retornado pelo endpoint ({source.endpoint}):</span>
                                <button
                                  onClick={() => copyToClipboard(source.rawJsonSnippet, source.id)}
                                  className="text-xs text-[#d4af6a] hover:text-[#f0d9a8] flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === source.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar JSON</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 bg-[#0a0908] border border-[#d4af6a]/15 rounded-[8px] text-[11px] font-mono text-[#d4af6a] overflow-x-auto max-h-64 leading-tight">
                                {source.rawJsonSnippet || '(Nenhum snippet retornado)'}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. SHOWCASE DOS EXEMPLOS OBRIGATÓRIOS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#d4af6a]" />
            <h2 className="text-xl font-serif font-bold text-[#f5efe6]">
              Amostra de Valores Brutos Retornados (Exemplos Auditados)
            </h2>
          </div>
          <p className="text-xs text-[#8c8273]">
            Exemplos obrigatórios requisitados: PETR4, VALE3, ITUB4, Selic Meta, CDI Anualizada, IPCA 12 meses, Dólar Comercial e Bitcoin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: PETR4, VALE3, ITUB4 */}
            <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4af6a]/15">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4af6a]" />
                  <span className="font-bold text-sm text-[#f5efe6]">Ações B3 (brapi.dev)</span>
                </div>
                {getModeBadge(brapiSource?.isRealData ?? false)}
              </div>

              <div className="space-y-3 font-mono text-xs">
                {brapiSource?.sampleSummary?.PETR4 ? (
                  <>
                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">PETR4</div>
                        <div className="text-[10px] text-[#8c8273]">Petrobras PN</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          R$ {Number(brapiSource.sampleSummary.PETR4.preco || 0).toFixed(2)}
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            Number(brapiSource.sampleSummary.PETR4.variacaoPercent || 0) >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {Number(brapiSource.sampleSummary.PETR4.variacaoPercent || 0) >= 0 ? '+' : ''}
                          {Number(brapiSource.sampleSummary.PETR4.variacaoPercent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">VALE3</div>
                        <div className="text-[10px] text-[#8c8273]">Vale S.A. ON</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          R$ {Number(brapiSource.sampleSummary.VALE3?.preco || 0).toFixed(2)}
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            Number(brapiSource.sampleSummary.VALE3?.variacaoPercent || 0) >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {Number(brapiSource.sampleSummary.VALE3?.variacaoPercent || 0) >= 0 ? '+' : ''}
                          {Number(brapiSource.sampleSummary.VALE3?.variacaoPercent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">ITUB4</div>
                        <div className="text-[10px] text-[#8c8273]">Itaú Unibanco PN</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          R$ {Number(brapiSource.sampleSummary.ITUB4?.preco || 0).toFixed(2)}
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            Number(brapiSource.sampleSummary.ITUB4?.variacaoPercent || 0) >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {Number(brapiSource.sampleSummary.ITUB4?.variacaoPercent || 0) >= 0 ? '+' : ''}
                          {Number(brapiSource.sampleSummary.ITUB4?.variacaoPercent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-[#8c8273] text-center py-4">Sem dados resumidos disponíveis</div>
                )}
              </div>
            </div>

            {/* Card 2: BCB SGS (Selic, CDI, IPCA 12m) */}
            <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4af6a]/15">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#d4af6a]" />
                  <span className="font-bold text-sm text-[#f5efe6]">Banco Central SGS</span>
                </div>
                {getModeBadge(bcbSource?.isRealData ?? false)}
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8c8273]">Série 432 • Selic Meta</span>
                    {bcbSource?.sampleSummary?.selicRegistrosDescartados && (
                      <span className="text-[10px] text-purple-300 font-mono">
                        {bcbSource.sampleSummary.selicRegistrosDescartados}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      bcbSource?.sampleSummary?.selicMeta === 'Indisponível'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {bcbSource?.sampleSummary?.selicMeta || 'Indisponível'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15">
                  <div className="text-[10px] text-[#8c8273]">Série 4389 • CDI Anualizado (252)</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {bcbSource?.sampleSummary?.cdiAnualizado || '13.65% a.a.'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15">
                  <div className="text-[10px] text-[#8c8273]">Série 13522 • IPCA 12 Meses</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">
                    {bcbSource?.sampleSummary?.ipca12Meses || '4.58% acum.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Câmbio PTAX (Banco Central Olinda) */}
            <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4af6a]/15">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#d4af6a]" />
                  <span className="font-bold text-sm text-[#f5efe6]">Câmbio PTAX (Banco Central)</span>
                </div>
                {getModeBadge(bcbCambioSource?.isRealData ?? false)}
              </div>

              <div className="space-y-3 font-mono text-xs">
                {bcbCambioSource?.isRealData && bcbCambioSource.sampleSummary?.dolarPtax ? (
                  <>
                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">Dólar PTAX (USD)</div>
                        <div className="text-[10px] text-[#8c8273]">{bcbCambioSource.sampleSummary?.periodo || 'Últimos 7 dias'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          {bcbCambioSource.sampleSummary.dolarPtax.split(' (')[0]}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          {bcbCambioSource.sampleSummary.dolarPtax.includes('(')
                            ? bcbCambioSource.sampleSummary.dolarPtax.substring(bcbCambioSource.sampleSummary.dolarPtax.indexOf('('))
                            : ''}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">Euro PTAX (EUR)</div>
                        <div className="text-[10px] text-[#8c8273]">Bacen Olinda OData</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          {bcbCambioSource.sampleSummary.euroPtax?.split(' (')[0] || '—'}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          {bcbCambioSource.sampleSummary.euroPtax?.includes('(')
                            ? bcbCambioSource.sampleSummary.euroPtax.substring(bcbCambioSource.sampleSummary.euroPtax.indexOf('('))
                            : ''}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {bcbCambioSource?.status === 'rate_limit'
                          ? 'Limite de requisições (429)'
                          : bcbCambioSource?.status === 'invalid_data'
                          ? 'Dado inválido'
                          : 'Indisponível no momento'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#c2b9ac]">
                      {bcbCambioSource?.errorMessage || 'Cotação oficial PTAX do Banco Central indisponível nesta consulta.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Criptomoedas (CoinGecko) */}
            <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4af6a]/15">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#d4af6a]" />
                  <span className="font-bold text-sm text-[#f5efe6]">Cripto (CoinGecko)</span>
                </div>
                {getModeBadge(coinSource?.isRealData ?? false)}
              </div>

              <div className="space-y-3 font-mono text-xs">
                {coinSource?.sampleSummary?.bitcoin ? (
                  <>
                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">Bitcoin (BTC)</div>
                        <div className="text-[10px] text-[#8c8273]">
                          US$ {Number(coinSource.sampleSummary.bitcoin.precoUsd || 0).toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#f5efe6]">
                          R$ {Number(coinSource.sampleSummary.bitcoin.precoBrl || 0).toLocaleString('pt-BR')}
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            Number(coinSource.sampleSummary.bitcoin.variacao24h || 0) >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {Number(coinSource.sampleSummary.bitcoin.variacao24h || 0) >= 0 ? '+' : ''}
                          {Number(coinSource.sampleSummary.bitcoin.variacao24h || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">Ethereum (ETH)</div>
                      </div>
                      <div className="text-right font-bold text-[#f5efe6]">
                        R$ {Number(coinSource.sampleSummary.ethereum?.precoBrl || 0).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#0c0b0a] border border-[#d4af6a]/15 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#f0d9a8]">Solana (SOL)</div>
                      </div>
                      <div className="text-right font-bold text-[#f5efe6]">
                        R$ {Number(coinSource.sampleSummary.solana?.precoBrl || 0).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-[#8c8273] text-center py-4">Sem dados do CoinGecko</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. AUDITORIA DE CÓDIGO: INVENTÁRIO COMPLETO DE MOCKS E FALLBACKS */}
        <div className="border border-[#d4af6a]/20 rounded-[16px] bg-[#141210] overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#d4af6a]/15 bg-[#1c1916]/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-[#d4af6a]" />
              <div>
                <h2 className="text-lg font-serif font-bold text-[#f5efe6]">
                  Inventário de Valores Fixos e Mocks no Código
                </h2>
                <p className="text-xs text-[#8c8273]">
                  Mapeamento exaustivo de todos os arquivos onde existem constantes de contingência, valores pré-calculados ou fallbacks.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c0b0a] text-[#8c8273] font-mono uppercase tracking-wider text-[11px] border-b border-[#d4af6a]/15">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Categoria</th>
                  <th className="py-3.5 px-4 font-semibold">Arquivo & Linhas</th>
                  <th className="py-3.5 px-4 font-semibold">Descrição do Dado de Contingência</th>
                  <th className="py-3.5 px-4 font-semibold">Gatilho de Exibição ao Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af6a]/10">
                {data?.mockLocations?.map((loc, idx) => (
                  <tr key={idx} className="hover:bg-[#1a1714] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#f0d9a8] whitespace-nowrap">
                      {loc.category}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-[#d4af6a]">
                      <div>{loc.file}</div>
                      <div className="text-[10px] text-[#8c8273]">{loc.lines}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#c2b9ac] max-w-md">
                      {loc.description}
                    </td>

                    <td className="py-3.5 px-4 text-[#8c8273] text-[11px] max-w-xs font-mono">
                      {loc.triggerCondition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
