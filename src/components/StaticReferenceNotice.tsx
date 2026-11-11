import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StaticReferenceNoticeProps {
  /** O que esta tela mostra com base em dados de referência fixos */
  what: string;
}

/**
 * Aviso visível em telas que usam tabelas de referência estáticas (preços e indicadores
 * embutidos no código), ou seja, que NÃO são atualizadas a cada 60 segundos.
 */
export const StaticReferenceNotice: React.FC<StaticReferenceNoticeProps> = ({ what }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
    <div
      role="note"
      className="flex items-start gap-3 rounded-[12px] border border-[#d4af6a]/35 bg-[#d4af6a]/10 px-4 py-3 text-xs text-[#f0d9a8]"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[#d4af6a]" aria-hidden="true" />
      <p className="leading-relaxed">
        <strong className="font-mono uppercase tracking-wider">Dados de referência estáticos.</strong>{' '}
        {what} usa uma tabela fixa de preços e indicadores, <strong>não atualizada em tempo real</strong> e
        que pode estar desatualizada. Serve apenas para fins educacionais e de demonstração das ferramentas;
        não use estes números para decidir investimentos. Para a cotação atual, consulte a página do ativo.
      </p>
    </div>
  </div>
);
