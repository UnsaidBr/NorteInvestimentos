import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  badge?: string;
  badgeColor?: 'emerald' | 'gold' | 'indigo' | 'purple' | 'amber';
  title: string;
  titleHighlight?: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeColor = 'gold',
  title,
  titleHighlight,
  subtitle,
  breadcrumbs,
  children,
}) => {
  const badgeClasses = {
    emerald: 'bg-[#3ddc97]/12 text-[#3ddc97] border-[#3ddc97]/25',
    gold: 'bg-[#d4af6a]/12 text-[#f0d9a8] border-[#d4af6a]/30',
    indigo: 'bg-[#d4af6a]/12 text-[#f0d9a8] border-[#d4af6a]/30',
    purple: 'bg-[#d4af6a]/12 text-[#f0d9a8] border-[#d4af6a]/30',
    amber: 'bg-[#d4af6a]/12 text-[#f0d9a8] border-[#d4af6a]/30',
  }[badgeColor];

  return (
    <div className="relative py-12 sm:py-16 bg-[#0e0c0b] border-b border-[#d4af6a]/15 overflow-hidden">
      {/* Subtle warm gold ambient light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af6a]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#a39a8c] font-mono mb-4">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-[#f0d9a8] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-[#d4af6a]/25 shrink-0" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#f0d9a8] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#f5efe6] font-medium truncate max-w-[240px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Badge & Title in Fraunces Serif */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-3 uppercase tracking-wider ${badgeClasses}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {badge}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight leading-tight">
              {title}{' '}
              {titleHighlight && (
                <span className="bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#a39a8c] mt-3 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </div>
  );
};
