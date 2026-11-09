import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Building2,
  SlidersHorizontal,
  Calculator,
  Coins,
  GraduationCap,
  Sparkles,
  Wallet,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'carteira',
    title: 'Minha Carteira',
    badge: 'Proventos',
    description: 'Projeção mensal e alocação',
    path: '/carteira',
    icon: Wallet,
  },
  {
    id: 'acoes',
    title: 'Ações B3',
    badge: '80+ Ativos',
    description: 'Cotações atualizadas a cada 60 segundos e múltiplos',
    path: '/mercado',
    icon: TrendingUp,
  },
  {
    id: 'fiis',
    title: 'Fundos Imobiliários',
    badge: 'IFIX & Proventos',
    description: 'Tijolo, Papel, Vacância e P/VP',
    path: '/fiis',
    icon: Building2,
  },
  {
    id: 'radar',
    title: 'Rastreador Valuation',
    badge: 'Graham & Bazin',
    description: 'Filtros com premissas abertas',
    path: '/radar',
    icon: SlidersHorizontal,
  },
  {
    id: 'simulador',
    title: 'Simulador Patrimonial',
    badge: 'CDI x IR',
    description: 'Juros compostos e alíquotas reais',
    path: '/simulador',
    icon: Calculator,
  },
  {
    id: 'cripto',
    title: 'Cripto & Moedas',
    badge: 'PTAX Oficial',
    description: 'Bitcoin, Dólar PTAX e Euro',
    path: '/cripto',
    icon: Coins,
  },
  {
    id: 'aprender',
    title: 'Educação Financeira',
    badge: 'Didático',
    description: 'Mini-aulas diretas ao ponto',
    path: '/aprender',
    icon: GraduationCap,
  },
];

export const CategoryShortcuts: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#8c8273]">
        <span className="uppercase tracking-wider text-[#d4af6a] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Navegação Rápida por Categorias
        </span>
        <span className="hidden sm:inline">Acesso imediato aos módulos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={cat.path}
              className="p-3 sm:p-3.5 rounded-[12px] bg-[#141210]/90 hover:bg-[#1c1916] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-[0_4px_16px_rgba(212,175,106,0.1)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-medium text-[#c2b9ac] px-1.5 py-0.5 rounded bg-[#141210] border border-[#d4af6a]/10">
                  {cat.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-tight">
                  {cat.title}
                </h3>
                <p className="text-[10px] text-[#8c8273] mt-1 line-clamp-1 leading-snug">
                  {cat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
