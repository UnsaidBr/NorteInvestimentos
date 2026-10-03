import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { NewsletterCta } from '../components/NewsletterCta';
import { LEARN_TOPICS } from '../data/learningContent';
import {
  GraduationCap,
  Clock,
  ArrowRight,
  Search,
  Building2,
  Percent,
  Coins,
  Scale,
  PieChart,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export const LearnIndexPage: React.FC = () => {
  usePageMeta(
    'Educação Financeira para Iniciantes | Trilha B3 e Renda Fixa | NorteInvest',
    'Aprenda a investir com mini-aulas diretas e sem jargões. Entenda ações, proventos, taxa Selic, CDI, diversificação e gestão de riscos no mercado brasileiro.'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories = useMemo(() => {
    const set = new Set(LEARN_TOPICS.map((t) => t.category));
    return ['todas', ...Array.from(set)];
  }, []);

  const filteredTopics = useMemo(() => {
    return LEARN_TOPICS.filter((t) => {
      const matchQuery =
        !searchTerm.trim() ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'todas' || t.category === selectedCategory;

      return matchQuery && matchCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#d4af6a]" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-[#d4af6a]" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-[#d4af6a]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#d4af6a]" />;
      case 'PieChart':
        return <PieChart className="w-5 h-5 text-[#d4af6a]" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-[#ff5c6c]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#d4af6a]" />;
    }
  };

  return (
    <div>
      <PageHeader
        badge="Trilha Educativa"
        badgeColor="gold"
        title="Educação Financeira"
        titleHighlight="Descomplicada"
        subtitle="Domine os fundamentos do mercado financeiro brasileiro em leituras de 3 a 4 minutos. Sem fórmulas obscuras, sem promessas e sem 'economês'."
        breadcrumbs={[{ label: 'Aprender' }]}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono">
          <GraduationCap className="w-4 h-4 text-[#d4af6a]" />
          <span className="text-[#a39a8c]">Trilha Básica:</span>
          <strong className="text-[#f5efe6] font-bold">{LEARN_TOPICS.length} mini-aulas</strong>
        </div>
      </PageHeader>

      <section className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] shadow-sm font-bold'
                      : 'bg-[#141210] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15'
                  }`}
                >
                  {cat === 'todas' ? 'Todas as Categorias' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39a8c]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aula ou conceito..."
                className="w-full pl-10 pr-4 py-2 bg-[#141210] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[10px] text-xs sm:text-sm text-[#f5efe6] placeholder:text-[#6e675c] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/aprender/${topic.id}`}
                className="p-6 sm:p-7 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#1c1916] transition-all duration-200 shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
                      {getTopicIcon(topic.iconName)}
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#1c1916] text-[#a39a8c] border border-[#d4af6a]/15 font-semibold">
                      {topic.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug">
                    {topic.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#a39a8c] mt-2.5 leading-relaxed font-normal">
                    {topic.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#6e675c] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#a39a8c]" />
                    <span className="text-[#a39a8c]">{topic.readTime}</span>
                  </div>
                  <span className="font-semibold text-[#d4af6a] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler aula <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <NewsletterCta
        title="Receba novas mini-aulas todo fim de semana"
        subtitle="Expanda seus conhecimentos de forma gradual com pílulas de educação financeira gratuitas preparadas pela nossa equipe editorial."
      />
    </div>
  );
};
