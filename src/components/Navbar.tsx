import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  RefreshCw,
  Menu,
  X,
  Clock,
  Star,
  Scale,
  Calendar,
  Crown,
  ChevronDown,
  Sparkles,
  Newspaper,
  BookOpen,
  Building2,
  SlidersHorizontal,
  Coins,
  GraduationCap,
  Calculator,
  Compass,
  FileText,
} from 'lucide-react';
import { formatDateTimeBR } from '../utils/formatters';
import { useFavorites } from '../hooks/useFavorites';
import { usePlan } from '../context/PlanContext';

interface NavbarProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  isDemoMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  isDemoMode = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { count: favoritesCount } = useFavorites();
  const { isPremium } = usePlan();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menus ao trocar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Fechar ao clicar fora do dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMarketOpen = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brt = new Date(utc - 3600000 * 3);
    const day = brt.getDay();
    const hours = brt.getHours();
    const isWeekday = day >= 1 && day <= 5;
    return isWeekday && hours >= 10 && hours < 17;
  };

  const marketOpen = isMarketOpen();

  // Links primários de primeiro nível (diretos na barra de navegação)
  const primaryNavLinks = [
    { label: 'Início', href: '/' },
    { label: 'Carteira', href: '/carteira' },
    { label: 'Ações B3', href: '/mercado' },
    { label: 'FIIs', href: '/fiis' },
    { label: 'Rastreador', href: '/radar' },
    { label: 'Simulador', href: '/simulador' },
  ];

  // Ferramentas analíticas no dropdown
  const toolLinks = [
    { label: 'Comparador de Ativos', href: '/comparar', icon: Scale, desc: 'Até 4 ativos simultâneos' },
    { label: 'Calendário de Dividendos', href: '/dividendos', icon: Calendar, desc: 'Datas-com e pagamentos' },
    { label: 'Criptomoedas & Câmbio', href: '/cripto', icon: Coins, desc: 'Bitcoin, Dólar e Euro PTAX' },
    { label: 'Meus Favoritos', href: '/favoritos', icon: Star, desc: 'Sua lista de monitoramento', badge: favoritesCount > 0 ? favoritesCount : null },
    { label: 'Planos & Premium', href: '/planos', icon: Crown, desc: 'Recursos avançados de valuation' },
  ];

  // Recursos de conteúdo e educação no dropdown
  const contentLinks = [
    { label: 'Mini-Aulas', href: '/aprender', icon: GraduationCap, desc: 'Conceitos didáticos para iniciantes' },
    { label: 'Radar de Notícias RSS', href: '/noticias', icon: Newspaper, desc: 'Manchetes da economia em tempo real' },
    { label: 'Glossário Financeiro', href: '/glossario', icon: BookOpen, desc: 'Dicionário A-Z descomplicado' },
    { label: 'Síntese Algorítmica IA', href: '/ia', icon: Sparkles, desc: 'Como o modelo traduz o mercado' },
    { label: 'Metodologia de Cálculo', href: '/metodologia', icon: FileText, desc: 'Fontes de dados e fórmulas' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isDropdownActive =
    toolLinks.some((l) => location.pathname.startsWith(l.href)) ||
    contentLinks.some((l) => location.pathname.startsWith(l.href));

  return (
    <header
      className={`sticky z-40 transition-all duration-300 ${
        isDemoMode ? 'top-7 sm:top-8' : 'top-0'
      } ${
        isScrolled
          ? 'bg-[#0b0a09]/95 backdrop-blur-xl border-b border-[#d4af6a]/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-[#0b0a09]/85 backdrop-blur-md border-b border-[#d4af6a]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo Monogram */}
          <Link to="/" className="focus:outline-none shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation - Organizada, desobstruída e 100% de linha única */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#141210]/95 border border-[#d4af6a]/15 backdrop-blur-sm whitespace-nowrap">
            {primaryNavLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-gradient-to-r from-[#d4af6a]/25 to-[#f0d9a8]/15 text-[#f0d9a8] border border-[#d4af6a]/40 shadow-sm font-semibold'
                      : 'text-[#a39a8c] hover:text-[#f5efe6] hover:bg-[#1c1916]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Dropdown Estruturado: Mais Recursos */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onMouseEnter={() => setMoreDropdownOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  isDropdownActive || moreDropdownOpen
                    ? 'bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/35 font-semibold'
                    : 'text-[#a39a8c] hover:text-[#f5efe6] hover:bg-[#1c1916]'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <Compass className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Explorar</span>
                {favoritesCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    moreDropdownOpen ? 'rotate-180 text-[#f0d9a8]' : 'text-[#8c8273]'
                  }`}
                />
              </button>

              {/* Dropdown Menu Box em 2 Colunas Lógicas */}
              {moreDropdownOpen && (
                <div
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-[520px] rounded-[16px] bg-[#141210]/98 border border-[#d4af6a]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 backdrop-blur-2xl z-50 animate-fadeIn"
                >
                  <div className="grid grid-cols-2 gap-4 divide-x divide-[#d4af6a]/15">
                    
                    {/* Coluna 1: Ferramentas de Análise */}
                    <div className="space-y-1">
                      <div className="px-2.5 pb-2 border-b border-[#d4af6a]/10 text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] font-semibold flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Ferramentas Analíticas</span>
                      </div>
                      <div className="space-y-0.5 pt-1">
                        {toolLinks.map((tool) => {
                          const Icon = tool.icon;
                          const active = isLinkActive(tool.href);
                          return (
                            <Link
                              key={tool.href}
                              to={tool.href}
                              onClick={() => setMoreDropdownOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-[10px] transition-colors group ${
                                active
                                  ? 'bg-[#d4af6a]/15 text-[#f0d9a8]'
                                  : 'hover:bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6]'
                              }`}
                            >
                              <div className="p-1.5 rounded-[8px] bg-[#1c1916] text-[#d4af6a] group-hover:bg-[#d4af6a]/20 shrink-0 mt-0.5">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-[#f5efe6] group-hover:text-[#f0d9a8]">
                                    {tool.label}
                                  </span>
                                  {tool.badge && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-[#d4af6a]/25 text-[#f0d9a8] font-mono text-[9px] font-bold">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#8c8273] block truncate">
                                  {tool.desc}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coluna 2: Conteúdo & Educação */}
                    <div className="space-y-1 pl-4">
                      <div className="px-2.5 pb-2 border-b border-[#d4af6a]/10 text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] font-semibold flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3" />
                        <span>Educação & Metodologia</span>
                      </div>
                      <div className="space-y-0.5 pt-1">
                        {contentLinks.map((content) => {
                          const Icon = content.icon;
                          const active = isLinkActive(content.href);
                          return (
                            <Link
                              key={content.href}
                              to={content.href}
                              onClick={() => setMoreDropdownOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-[10px] transition-colors group ${
                                active
                                  ? 'bg-[#d4af6a]/15 text-[#f0d9a8]'
                                  : 'hover:bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6]'
                              }`}
                            >
                              <div className="p-1.5 rounded-[8px] bg-[#1c1916] text-[#d4af6a] group-hover:bg-[#d4af6a]/20 shrink-0 mt-0.5">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-[#f5efe6] group-hover:text-[#f0d9a8]">
                                    {content.label}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#8c8273] block truncate">
                                  {content.desc}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Status & Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
            
            {/* Status do Pregão B3 */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141210] border border-[#d4af6a]/15 text-xs text-[#a39a8c] whitespace-nowrap shrink-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: marketOpen ? '#3ddc97' : '#d4af6a',
                  boxShadow: marketOpen ? '0 0 8px rgba(61, 220, 151, 0.6)' : '0 0 8px rgba(212, 175, 106, 0.4)',
                }}
              />
              <span className="font-medium text-[#f5efe6]">
                {marketOpen ? 'B3 Aberta' : 'B3 Fechada'}
              </span>
              <span className="text-[#6e675c] text-[10px] font-mono">
                10h - 17h
              </span>
            </div>

            {/* Botão Seja Premium */}
            <Link
              to="/planos"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-mono font-bold transition-all border shadow-sm whitespace-nowrap shrink-0 ${
                isPremium
                  ? 'bg-gradient-to-r from-[#d4af6a]/30 to-[#f0d9a8]/20 border-[#d4af6a] text-[#f0d9a8] hover:brightness-110 shadow-[0_0_15px_rgba(212,175,106,0.2)]'
                  : 'bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] text-[#0a0908] border-[#d4af6a] hover:brightness-105 font-extrabold shadow-[0_2px_12px_rgba(212,175,106,0.3)]'
              }`}
              title="Acessar recursos exclusivos Premium"
            >
              <Crown className={`w-3.5 h-3.5 shrink-0 ${isPremium ? 'text-[#d4af6a]' : 'text-[#0a0908]'}`} />
              <span>{isPremium ? 'Premium ⭐' : 'Seja Premium'}</span>
            </Link>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={`Última atualização: ${formatDateTimeBR(lastUpdated)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] text-xs font-medium text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin text-[#d4af6a]' : 'text-[#a39a8c]'}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 text-[#a39a8c] hover:text-white focus:outline-none cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#d4af6a]" /> : <Menu className="w-5 h-5 text-[#d4af6a]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Organizado por Seções Claras */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0a09]/98 border-b border-[#d4af6a]/20 px-4 pt-3 pb-6 space-y-4 animate-fadeIn backdrop-blur-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/10 text-xs text-[#a39a8c]">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: marketOpen ? '#3ddc97' : '#d4af6a' }}
              />
              <span>Pregão B3: <strong className="text-[#f5efe6]">{marketOpen ? 'Aberto' : 'Fechado'}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[#6e675c] font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDateTimeBR(lastUpdated).split(' ')[1] || ''}</span>
            </div>
          </div>

          {/* Principais Páginas */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] px-3 py-1">
              Navegação Principal
            </div>
            {primaryNavLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/30 font-semibold'
                      : 'text-[#f5efe6] hover:bg-[#141210]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Grupo Ferramentas no Mobile */}
          <div className="space-y-1 pt-2 border-t border-[#d4af6a]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] px-3 py-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Ferramentas Analíticas</span>
            </div>
            {toolLinks.map((tool) => {
              const Icon = tool.icon;
              const active = isLinkActive(tool.href);
              return (
                <Link
                  key={tool.href}
                  to={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-[12px] text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/30 font-semibold'
                      : 'text-[#f5efe6] hover:bg-[#141210]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#d4af6a]" />
                    <span>{tool.label}</span>
                  </div>
                  {tool.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#d4af6a]/25 text-[#f0d9a8] font-mono text-xs font-bold">
                      {tool.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Grupo Educação no Mobile */}
          <div className="space-y-1 pt-2 border-t border-[#d4af6a]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] px-3 py-1 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" />
              <span>Conteúdo & Educação</span>
            </div>
            {contentLinks.map((content) => {
              const Icon = content.icon;
              const active = isLinkActive(content.href);
              return (
                <Link
                  key={content.href}
                  to={content.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-[12px] text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/30 font-semibold'
                      : 'text-[#f5efe6] hover:bg-[#141210]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#d4af6a]" />
                    <span>{content.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Botão Premium no Drawer */}
          <div className="pt-2">
            <Link
              to="/planos"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] text-[#0a0908] font-mono text-xs font-bold tracking-wide uppercase shadow-lg shadow-[#d4af6a]/20"
            >
              <Crown className="w-4 h-4" />
              <span>{isPremium ? 'Plano Premium Ativo' : 'Conhecer Plano Premium'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
