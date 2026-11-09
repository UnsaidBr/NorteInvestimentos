# Carteira de Investimentos & Projeção de Dividendos (Estilo Investidor10)

Implementação do módulo de **Gerenciador de Carteira de Investimentos** do NorteInvest, inspirado na principal ferramenta de acompanhamento e retenção do Investidor10, permitindo ao investidor cadastrar suas posições (Ações B3, FIIs, Renda Fixa e Cripto), acompanhar o patrimônio consolidado em tempo real, visualizar gráficos de alocação de ativos e simular a **projeção de dividendos mensais** com base nos proventos reais de cada ativo, com armazenamento local seguro sem necessidade de cadastro.

---

## Revisão do Usuário & Decisões Confirmadas

> [!IMPORTANT]
> **Decisões confirmadas na Fase 1 de alinhamento interativo:**
> 1. **Módulo Principal Priorizado**: **Carteira de Investimentos** com projeção de proventos mensais (a principal função faltante do Investidor10 no NorteInvest).
> 2. **Recursos Centrais da Carteira**:
>    - **Painel de Projeção de Dividendos Mensais**: Cálculo automático do fluxo de proventos projetados mês a mês (R$/mês) a partir da quantidade de cotas/ações em carteira.
>    - **Gráfico de Alocação Patrimonial por Classe**: Visualização percentual e financeira dividida em Ações B3, Fundos Imobiliários (FIIs), Renda Fixa e Criptomoedas.
> 3. **Estratégia de Persistência**: Armazenamento 100% no navegador (`localStorage`), garantindo privacidade total, carregamento imediato e sem fricção de login/senha.

---

## 1. Visão Geral & Conceito

### O que o módulo entrega
No Investidor10, a funcionalidade mais utilizada é a "Minha Carteira", onde o usuário gerencia seus investimentos e responde à pergunta crucial: *"Quanto vou receber de renda passiva neste mês e no ano?"*

O **NorteInvest** trará essa mesma capacidade, elevada ao padrão visual de *Private Banking*:
- **Visão Geral Patrimonial**: Total Investido, Saldo Atual com cotações em tempo real da B3, Lucro/Prejuízo Total (R$ e %) e Dividend Yield médio da carteira.
- **Calendário & Projeção de Proventos**: Gráfico de barras com estimativa de dividendos nos próximos 12 meses e tabela dos próximos pagamentos com Data-Com e Data de Pagamento.
- **Diversificação de Ativos**: Gráfico donut de alocação por classe (Ações, FIIs, Renda Fixa, Cripto) e por ativo individual, com identificação visual via `AssetLogo`.
- **Aportes Rápidos & Simulação**: Modal simples para adicionar ativos da B3 com busca inteligente, quantidade e preço de compra, com carteira demonstrativa inicial sugerida para exploração instantânea.

### Público-Alvo
Investidores pessoa física que buscam viver de renda passiva ou acumular patrimônio na B3 e desejam controlar suas posições sem planilhas confusas ou taxas de custódia.

---

## 2. Experiência do Usuário & Design Visual

### Jornada do Usuário na Carteira (`/carteira`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CABEÇALHO PATRIMONIAL & KPIS CONSOLIDADOS                          │
│    - Patrimônio Atual: R$ 48.520,00  ·  Rentabilidade: +12,4% (▲ R$ 5.350)│
│    - Proventos Projetados (Ano): R$ 4.280,00  ·  DY Carteira: 8,82% a.a.│
│    - Botões: [+ Adicionar Ativo]  [↻ Atualizar Cotações]  [Limpar]     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PAINEL DE PROJEÇÃO DE DIVIDENDOS (ASSINATURA INVESTIDOR10)          │
│    - Gráfico de colunas com a renda passiva mensal estimada (Jan - Dez)│
│    - Média mensal: R$ 356,66 / mês  ·  Meta de Renda Passiva           │
│    - Lista dos próximos proventos confirmados (Data-Com e Pagamento)   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ALOCAÇÃO & DIVERSIFICAÇÃO PATRIMONIAL                               │
│    - Gráfico Donut de classes: 55% Ações · 35% FIIs · 10% Cripto       │
│    - Barra de concentração por ativo (evitar risco de sobreposição)    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. TABELA DE POSIÇÕES DETALHADA COM ASSETLOGO                         │
│    - Ativo (Logo + Ticker) · Qtd · Preço Médio · Preço Atual · Saldo  │
│    - Rentabilidade (R$ e %) · Provento Anual Projetado · Ações         │
└────────────────────────────────────────────────────────────────────────┘
```

### Identidade Visual, Tipografia e Cores
- **Paleta de Superfícies**: Obsidiana `#0b0a09` com cards estruturais `#141210` e divisores sutis em ouro champagne `#d4af6a`/15.
- **Tipografia**: Fraunces nos totais patrimoniais e títulos; `font-mono tabular-nums` em todos os valores monetários, cotas e percentuais.
- **Cores Semânticas**:
  - Ações B3: Dourado / Champagne `#d4af6a`
  - FIIs: Azul Safira / Índigo `#60a5fa`
  - Renda Fixa / CDI: Verde Esmeralda `#3ddc97`
  - Cripto: Âmbar Cripto `#f7931a`
- **Zero-Pill Discipline**: Metadados inline discretos separados por `·`, sem pílulas decorativas estáticas.

---

## 3. Decisões de Produto & Trade-Offs

### Decisão 1: Persistência sem Login (LocalStorage com Import/Export JSON)
- **Abordagem Escolhida**: Salvar as transações da carteira em `localStorage` com suporte a backup/exportação em JSON e uma carteira pré-carregada padrão (demo realista com PETR4, ITUB4, HGLG11, MXRF11) para que o usuário veja a funcionalidade funcionando de imediato.
- **Motivo**: Remove qualquer fricção de autenticação ou criação de conta. O usuário começa a usar em 1 segundo com total privacidade dos seus dados financeiros.
- **Alternativa Considerada**: Criar banco de dados na nuvem obrigando login e senha (descartada para respeitar a privacidade e resposta do usuário).

### Decisão 2: Modelo de Projeção de Dividendos Mensais
- **Abordagem Escolhida**: Combinar o histórico de proventos dos últimos 12 meses de cada ativo em carteira (DPA da B3 e rendimento médio mensal dos FIIs) com as datas de pagamento do nosso `DividendCalendarPage` para projetar a curva mensal de renda passiva.
- **Motivo**: Entrega a mesma sensação dos gráficos de "Projeção de Proventos" do Investidor10, mostrando claramente o fluxo de caixa passivo entrando mês a mês.

### Decisão 3: Ponto de Entrada na Navegação e Home
- **Abordagem Escolhida**:
  - Adicionar a rota `/carteira` diretamente no menu principal (`Navbar.tsx`) ao lado de Ações, FIIs e Rastreador.
  - Adicionar um atalho de "Minha Carteira" na seção de atalhos do Hero (`CategoryShortcuts.tsx`).
  - Adicionar no Rodapé em "Ferramentas Analíticas".

---

## 4. Arquitetura Técnica & Componentes

### Diagrama de Arquitetura da Carteira

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PORTFOLIO DASHBOARD (/carteira)                 │
├───────────────────────────────────┬────────────────────────────────────┤
│   PortfolioSummaryCards.tsx       │   PortfolioAllocationChart.tsx     │
│   - Patrimônio Consolidado        │   - Gráfico de Alocação por Classe │
│   - Rentabilidade Total (R$ e %)  │   - Concentração por Ativo         │
│   - Proventos Projetados (Ano)    │   - Donut SVG Interativo           │
├───────────────────────────────────┴────────────────────────────────────┤
│   PortfolioDividendProjection.tsx                                      │
│   - Gráfico de Barras Mensal (Renda Passiva Estimada Jan - Dez)        │
│   - Próximos Pagamentos Confirmados (Data-Com, Pagto e Valor)          │
├────────────────────────────────────────────────────────────────────────┤
│   PortfolioPositionsTable.tsx                                          │
│   - Tabela de Ativos com AssetLogo · Quantidade · Preço Médio · Saldo  │
│   - Lucro/Prejuízo · DY da Posição · Botões de Editar e Excluir        │
├────────────────────────────────────────────────────────────────────────┤
│   AddTransactionModal.tsx (Modal de Inclusão/Edição com Busca B3)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SERVIÇO & HOOK DA CARTEIRA                        │
│  - usePortfolio.ts: Hook com persistência em localStorage              │
│  - portfolioService.ts: Cálculos de preço médio, alocação e proventos  │
│  - Integração com useMarket() para cotações em tempo real da B3        │
└────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Tipos (`src/types/portfolio.ts`)
```typescript
export interface PortfolioPosition {
  id: string;
  ticker: string;
  name: string;
  category: 'acao' | 'fii' | 'renda_fixa' | 'cripto';
  quantity: number;
  averagePrice: number;
  createdAt: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  projectedAnnualDividends: number;
  averageDividendYield: number;
  monthlyProjection: Array<{ month: string; value: number }>;
}
```

---

## 5. Próximos Passos & Verificação

Após a aprovação deste plano:
1. Criar o modelo de tipos `src/types/portfolio.ts` e o hook `src/hooks/usePortfolio.ts`.
2. Criar os cálculos analíticos em `src/services/portfolioService.ts`.
3. Criar a página completa `src/pages/PortfolioPage.tsx` com os cards de resumo, gráfico de alocação, projeção de dividendos e tabela de posições com `AssetLogo`.
4. Criar o modal `AddPositionModal.tsx` com busca inteligente de tickers da B3 e preenchimento de preço atual.
5. Adicionar a rota `/carteira` em `src/App.tsx`, na `Navbar.tsx`, no `CategoryShortcuts.tsx` e no `Footer.tsx`.
6. Validar compilação (`compile_applet`) e linter (`lint_applet`).
