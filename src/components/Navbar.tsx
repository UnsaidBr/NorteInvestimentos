import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { RefreshCw, Menu, X, Clock } from 'lucide-react';
import { formatDateTimeBR } from '../utils/formatters';

interface NavbarProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Mercado B3', href: '/mercado' },
    { label: 'Cripto & Câmbio', href: '/cripto' },
    { label: 'Simulador', href: '/simulador' },
    { label: 'Aprender', href: '/aprender' },
    { label: 'Inteligência Artificial', href: '/ia' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0a09]/92 backdrop-blur-xl border-b border-[#d4af6a]/15 shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
          : 'bg-[#0b0a09]/75 backdrop-blur-md border-b border-[#d4af6a]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Monogram */}
          <Link to="/" className="focus:outline-none">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#141210]/90 border border-[#d4af6a]/15 backdrop-blur-sm">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-[#d4af6a]/20 to-[#f0d9a8]/15 text-[#f0d9a8] border border-[#d4af6a]/35 shadow-sm font-semibold'
                      : 'text-[#a39a8c] hover:text-[#f5efe6] hover:bg-[#1c1916]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Status & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Market Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141210] border border-[#d4af6a]/15 text-xs text-[#a39a8c]">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: marketOpen ? '#3ddc97' : '#d4af6a',
                  boxShadow: marketOpen ? '0 0 8px rgba(61, 220, 151, 0.6)' : '0 0 8px rgba(212, 175, 106, 0.4)',
                }}
              />
              <span className="font-medium text-[#f5efe6]">
                {marketOpen ? 'B3 Aberta' : 'B3 Fechada'}
              </span>
              <span className="text-[#6e675c] text-[10px] hidden xl:inline font-mono">
                10h - 17h
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={`Última atualização: ${formatDateTimeBR(lastUpdated)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] text-xs font-medium text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#d4af6a]' : 'text-[#a39a8c]'}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 text-[#a39a8c] hover:text-white focus:outline-none cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#d4af6a]" /> : <Menu className="w-5 h-5 text-[#d4af6a]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0a09]/98 border-b border-[#d4af6a]/15 px-4 pt-3 pb-6 space-y-3 animate-fadeIn backdrop-blur-2xl">
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
          <div className="space-y-1">
            {navLinks.map((link) => {
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
        </div>
      )}
    </header>
  );
};
