import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Home, BarChart2, Calculator, GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  usePageMeta(
    'Página Não Encontrada (404) | NorteInvest',
    'A página que você procurou não foi encontrada. Retorne à página inicial ou consulte as cotações da B3.'
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 sm:py-24 px-4 bg-[#0b0a09]">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Monogram Icon */}
        <div className="w-16 h-16 rounded-[14px] bg-[#141210] border border-[#d4af6a]/30 flex items-center justify-center mx-auto shadow-xl shadow-[#d4af6a]/10">
          <ShieldAlert className="w-8 h-8 text-[#d4af6a]" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-[#d4af6a] uppercase tracking-widest block mb-1">
            Erro 404 • Rota Não Encontrada
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Página Não Encontrada
          </h1>
          <p className="text-sm text-[#a39a8c] mt-2.5 leading-relaxed font-normal">
            O endereço digitado não corresponde a nenhuma página ativa do portal NorteInvest.
          </p>
        </div>

        {/* Quick Recovery Links */}
        <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5 text-xs text-left">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6e675c] block">
            Sugestões de Navegação:
          </span>

          <Link
            to="/"
            className="flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
          >
            <Home className="w-4 h-4 text-[#d4af6a]" />
            <span className="font-semibold">Página Inicial (Início)</span>
          </Link>

          <Link
            to="/mercado"
            className="flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-[#3ddc97]" />
            <span className="font-semibold">Cotações da B3 (Atualizado a cada 60s)</span>
          </Link>

          <Link
            to="/simulador"
            className="flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
          >
            <Calculator className="w-4 h-4 text-[#e5c07b]" />
            <span className="font-semibold">Simulador de Juros Compostos</span>
          </Link>

          <Link
            to="/aprender"
            className="flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-[#d4af6a]" />
            <span className="font-semibold">Mini-Aulas para Iniciantes</span>
          </Link>
        </div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,106,0.25)] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retornar ao Início</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
