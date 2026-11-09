import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Share2,
  Tag,
  ArrowRight,
  Sparkles,
  Info,
  Filter,
  X,
} from 'lucide-react';

export const GlossaryPage: React.FC = () => {
  const { termSlug } = useParams<{ termSlug?: string }>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('TODOS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Active term from URL
  const activeTerm = useMemo(() => {
    if (!termSlug) return null;
    return GLOSSARY_TERMS.find((t) => t.slug === termSlug) || null;
  }, [termSlug]);

  // Page meta updates dynamically if viewing a specific term
  usePageMeta(
    activeTerm
      ? `${activeTerm.term} - O que é? | Glossário ${APP_NAME}`
      : `Glossário Financeiro & B3 | ${APP_NAME}`,
    activeTerm
      ? `Definição de ${activeTerm.term}: ${activeTerm.definition}`
      : `Dicionário financeiro descomplicado da B3 e economia brasileira. Mais de 50 termos essenciais explicados de forma simples e didática.`
  );

  // Scroll to active term card when loaded with a slug
  const termCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (termSlug && termCardRefs.current[termSlug]) {
      termCardRefs.current[termSlug]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [termSlug]);

  // Distinct alphabet letters present in terms
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    GLOSSARY_TERMS.forEach((t) => letters.add(t.letter));
    return Array.from(letters).sort();
  }, []);

  // Distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    GLOSSARY_TERMS.forEach((t) => cats.add(t.category));
    return ['TODAS', ...Array.from(cats)];
  }, []);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      // Letter filter
      if (selectedLetter !== 'TODOS' && item.letter !== selectedLetter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'TODAS' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTerm = item.term.toLowerCase().includes(q);
        const inDef = item.definition.toLowerCase().includes(q);
        const inTip = item.practicalTip ? item.practicalTip.toLowerCase().includes(q) : false;
        const inCat = item.category.toLowerCase().includes(q);
        if (!inTerm && !inDef && !inTip && !inCat) return false;
      }
      return true;
    });
  }, [searchQuery, selectedLetter, selectedCategory]);

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/glossario/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    });
  };

  const handleSelectTerm = (slug: string) => {
    if (termSlug === slug) {
      navigate('/glossario');
    } else {
      navigate(`/glossario/${slug}`);
    }
  };

  const getCategoryBadgeColor = (category: GlossaryTerm['category']) => {
    switch (category) {
      case 'Ações':
        return 'bg-[#3ddc97]/10 text-[#3ddc97] border-[#3ddc97]/25';
      case 'Renda Fixa':
        return 'bg-[#d4af6a]/15 text-[#f0d9a8] border-[#d4af6a]/30';
      case 'Macroeconomia':
        return 'bg-[#60a5fa]/10 text-[#93c5fd] border-[#60a5fa]/25';
      case 'Indicadores':
        return 'bg-[#a78bfa]/10 text-[#c4b5fd] border-[#a78bfa]/25';
      case 'Fundos':
        return 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/25';
      case 'Cripto':
        return 'bg-[#fb923c]/10 text-[#fdba74] border-[#fb923c]/25';
      case 'Regulação':
        return 'bg-[#ef4444]/10 text-[#fca5a5] border-[#ef4444]/25';
      default:
        return 'bg-[#1c1916] text-[#c2b9ac] border-[#d4af6a]/15';
    }
  };

  return (
    <div>
      <PageHeader
        badge="Dicionário do Investidor • Mais de 50 Termos"
        badgeColor="gold"
        title="Glossário"
        titleHighlight="Financeiro"
        subtitle="Conceitos essenciais da B3, renda fixa, macroeconomia e indicadores explicados em linguagem simples, direta e acessível."
        breadcrumbs={
          activeTerm
            ? [{ label: 'Glossário', href: '/glossario' }, { label: activeTerm.term }]
            : [{ label: 'Glossário' }]
        }
      />

      <div className="py-12 sm:py-16 bg-[#0b0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Featured Highlight when accessing /glossario/:termSlug */}
          {activeTerm && (
            <div className="p-6 sm:p-8 rounded-[18px] bg-gradient-to-br from-[#1c1916] via-[#141210] to-[#1c1916] border-2 border-[#d4af6a]/50 shadow-2xl relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#d4af6a]/20 text-[#f0d9a8] font-bold">
                    Termo em Destaque
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(activeTerm.category)}`}>
                    {activeTerm.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyLink(activeTerm.slug, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#25221e] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8] transition-colors cursor-pointer"
                  >
                    {copiedSlug === activeTerm.slug ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3ddc97]" />
                        <span className="text-[#3ddc97]">Link copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar link direto</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/glossario')}
                    className="p-1.5 rounded-full bg-[#141210] hover:bg-[#25221e] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer"
                    title="Fechar destaque"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight">
                  {activeTerm.term}
                </h2>
                <p className="text-sm sm:text-base text-[#f5efe6] mt-2.5 leading-relaxed font-normal">
                  {activeTerm.definition}
                </p>
              </div>

              {activeTerm.practicalTip && (
                <div className="p-4 rounded-[12px] bg-[#141210]/90 border border-[#d4af6a]/20 flex items-start gap-3 text-xs sm:text-sm text-[#f0d9a8]">
                  <Sparkles className="w-4 h-4 text-[#d4af6a] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Aplicação Prática:</strong> {activeTerm.practicalTip}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search bar and Filters */}
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#d4af6a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar termo ou conceito (ex: CDI, Selic, PTAX, Dividendos, Marcação a Mercado, P/L)..."
                className="w-full pl-11 pr-4 py-3 rounded-[12px] bg-[#141210] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c8273] hover:text-[#f5efe6] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* A-Z Alphabet Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 text-xs font-mono overflow-x-auto">
              <span className="text-[#8c8273] text-[11px] uppercase mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#d4af6a]" />
                Índice:
              </span>
              <button
                onClick={() => setSelectedLetter('TODOS')}
                className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                  selectedLetter === 'TODOS'
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow'
                    : 'text-[#c2b9ac] hover:bg-[#1c1916] hover:text-[#f0d9a8]'
                }`}
              >
                Todos ({GLOSSARY_TERMS.length})
              </button>

              {availableLetters.map((letter) => {
                const count = GLOSSARY_TERMS.filter((t) => t.letter === letter).length;
                const isSelected = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-[#d4af6a] text-[#0b0a09] shadow'
                        : 'text-[#c2b9ac] hover:bg-[#1c1916] hover:text-[#f0d9a8]'
                    }`}
                    title={`${count} termos iniciando com ${letter}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
              <span className="text-[#8c8273] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#d4af6a]" />
                Categoria:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1c1916] text-[#f0d9a8] border-[#d4af6a]/50 font-bold shadow-sm'
                        : 'bg-[#141210]/60 text-[#8c8273] border-[#d4af6a]/15 hover:text-[#c2b9ac] hover:border-[#d4af6a]/30'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs font-mono text-[#8c8273] pt-2 border-t border-[#d4af6a]/10">
            <span>
              Exibindo <strong>{filteredTerms.length}</strong> de {GLOSSARY_TERMS.length} termos catalogados
            </span>
            {(selectedLetter !== 'TODOS' || selectedCategory !== 'TODAS' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedLetter('TODOS');
                  setSelectedCategory('TODAS');
                  setSearchQuery('');
                }}
                className="text-[#f0d9a8] hover:underline cursor-pointer"
              >
                Resetar filtros
              </button>
            )}
          </div>

          {/* Terms Grid */}
          {filteredTerms.length === 0 ? (
            <div className="p-12 text-center rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 space-y-3">
              <BookOpen className="w-8 h-8 text-[#d4af6a] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#f5efe6]">
                Nenhum termo encontrado
              </h3>
              <p className="text-xs text-[#a39a8c] max-w-md mx-auto">
                Não encontramos verbetes para os critérios selecionados ou a busca &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTerms.map((term) => {
                const isCurrentActive = termSlug === term.slug;
                return (
                  <div
                    key={term.slug}
                    ref={(el) => {
                      termCardRefs.current[term.slug] = el;
                    }}
                    id={term.slug}
                    onClick={() => handleSelectTerm(term.slug)}
                    className={`p-6 rounded-[14px] transition-all duration-200 shadow-md flex flex-col justify-between cursor-pointer group ${
                      isCurrentActive
                        ? 'bg-[#1c1916] border-2 border-[#d4af6a] shadow-[0_0_20px_rgba(212,175,106,0.15)]'
                        : 'bg-[#141210] hover:bg-[#181614] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Category and Letter badge */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(term.category)}`}>
                          {term.category}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#1c1916] border border-[#d4af6a]/20 text-[#8c8273] flex items-center justify-center font-bold">
                          {term.letter}
                        </span>
                      </div>

                      {/* Term Title */}
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug">
                        {term.term}
                      </h3>

                      {/* Concise Definition */}
                      <p className="text-xs text-[#c2b9ac] leading-relaxed line-clamp-3 font-normal">
                        {term.definition}
                      </p>
                    </div>

                    {/* Bottom action row: URL slug indicator and Copy link button */}
                    <div className="mt-5 pt-3.5 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-[#8c8273] truncate max-w-[150px]">
                        /glossario/{term.slug}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(term.slug, e)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#d4af6a] hover:text-[#f0d9a8] p-1 rounded transition-colors"
                        title="Copiar URL deste termo"
                      >
                        {copiedSlug === term.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#3ddc97]" />
                            <span className="text-[#3ddc97]">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            <span>Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Educational Note */}
          <div className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/25 flex items-center justify-center text-[#d4af6a] shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs text-[#c2b9ac] leading-relaxed">
              <h4 className="font-mono font-bold uppercase text-[#f5efe6] text-xs">
                Sobre as Definições do Glossário
              </h4>
              <p>
                Os verbetes são redigidos de maneira concisa e objetiva pela equipe do <strong>{APP_NAME}</strong> com o intuito de facilitar a navegação do cidadão brasileiro pelo universo financeiro. Cada termo possui uma URL própria para que você possa compartilhar definições específicas diretamente com amigos, estudantes ou em redes sociais.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
