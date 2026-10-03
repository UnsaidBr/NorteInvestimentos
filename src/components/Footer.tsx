import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { APP_NAME, LEGAL_DISCLAIMER } from '../constants/config';
import {
  AlertTriangle,
  ArrowUp,
  Instagram,
  Youtube,
} from 'lucide-react';

// Custom sleek TikTok SVG icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.29.98.19 2.03-.09 2.77-.76.6-.54.95-1.31.96-2.11.05-3.87.02-7.74.02-11.61z" />
  </svg>
);

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { label: 'Instagram', icon: <Instagram className="w-4 h-4" />, href: 'https://instagram.com' },
    { label: 'TikTok', icon: <TikTokIcon className="w-4 h-4" />, href: 'https://tiktok.com' },
    { label: 'YouTube', icon: <Youtube className="w-4 h-4" />, href: 'https://youtube.com' },
  ];

  return (
    <footer className="bg-[#0b0a09] border-t border-[#d4af6a]/15 text-[#c2b9ac] text-xs">
      
      {/* 1. Highlighted Regulatory Disclaimer Box */}
      <div className="border-b border-[#d4af6a]/10 bg-[#141210]/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-[14px] bg-gradient-to-r from-[#1c1916] via-[#141210] to-[#1c1916] border border-[#d4af6a]/25 flex flex-col sm:flex-row items-start gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="w-10 h-10 rounded-[10px] bg-[#d4af6a]/10 border border-[#d4af6a]/25 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#d4af6a]" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#d4af6a]/15 text-[#f0d9a8]">
                  Conteúdo Educacional
                </span>
                <span className="text-[#f5efe6] font-serif text-sm font-semibold tracking-tight">
                  Aviso Legal de Mercado
                </span>
              </div>
              <p className="text-[#f5efe6]/90 leading-relaxed text-xs sm:text-sm font-normal">
                {LEGAL_DISCLAIMER}
              </p>
              <p className="text-[#c2b9ac] text-[11px] leading-relaxed pt-1">
                O portal <strong>{APP_NAME}</strong> possui finalidade estritamente informativa, analítica e de educação financeira para o investidor brasileiro. Não atuamos como corretora de valores, distribuidora ou consultoria de investimentos (Resolução CVM nº 19). As cotações são fornecidas para fins didáticos e nenhuma informação deve ser tomada como recomendação de investimento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <Logo size="md" />

            <p className="text-xs text-[#c2b9ac] leading-relaxed max-w-sm font-normal">
              Portal independente de inteligência de mercado e educação financeira. Descomplicando a B3, taxas de juros e investimentos para o público brasileiro com clareza.
            </p>

            {/* Social Networks: Instagram, TikTok and YouTube only */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273] block mb-2 font-semibold">
                Siga o {APP_NAME}
              </span>
              <div className="flex items-center gap-2">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 text-[#c2b9ac] hover:text-[#f0d9a8] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/mercado" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Mercado B3 & Ações
                </Link>
              </li>
              <li>
                <Link to="/cripto" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Criptomoedas & Câmbio
                </Link>
              </li>
              <li>
                <Link to="/simulador" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Simulador de Juros
                </Link>
              </li>
              <li>
                <Link to="/aprender" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Mini-Aulas para Iniciantes
                </Link>
              </li>
              <li>
                <Link to="/ia" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Como a IA Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fontes de Dados Reais */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase tracking-wider mb-4">
              Fontes de Dados
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#c2b9ac]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                <span>brapi.dev (Cotações B3)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                <span>Banco Central (SGS / Selic)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                <span>CoinGecko (Criptoativos)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                <span>AwesomeAPI (Câmbio USD/EUR)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Termos & Privacidade */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase tracking-wider mb-4">
              Legal & Privacidade
            </h4>
            <ul className="space-y-2.5 text-xs mb-4">
              <li>
                <Link to="/privacidade" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Política de Privacidade (LGPD)
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] text-[#f5efe6] border border-[#d4af6a]/20 hover:border-[#d4af6a]/40 transition-all cursor-pointer text-xs font-medium shadow-sm active:scale-95"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Voltar ao topo</span>
            </button>
          </div>

        </div>

        {/* 3. Bottom Bar: Copyright & Feito no Brasil */}
        <div className="mt-12 pt-6 border-t border-[#d4af6a]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8c8273] font-mono">
          <div>
            © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141210] border border-[#d4af6a]/15">
            <span className="text-sm">🇧🇷</span>
            <span className="text-[#f5efe6] font-medium font-sans text-xs">
              Feito no Brasil com foco no investidor brasileiro
            </span>
          </div>

          <div>
            Horário de Brasília (UTC-3)
          </div>
        </div>

      </div>
    </footer>
  );
};
