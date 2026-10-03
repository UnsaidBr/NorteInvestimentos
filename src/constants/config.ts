/**
 * Configuração Geral da Plataforma
 * Nome da marca facilmente personalizável conforme solicitado.
 */
export const APP_NAME = "NorteInvest";
export const APP_TAGLINE = "Entenda o mercado sem complicação";
export const APP_DESCRIPTION = "Portal brasileiro de informação e educação financeira com cotações B3 atualizadas a cada 60 segundos, criptoativos, simulador patrimonial e análises inteligentes.";

// Token para a API Brapi (https://brapi.dev)
// Pode ser configurado via variável de ambiente VITE_BRAPI_TOKEN ou inserido diretamente aqui
export const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN || "";

// Intervalo de atualização automática (em segundos)
export const AUTO_REFRESH_SECONDS = 60;

// Aviso Legal Obrigatório (Regulação CVM / ANBIMA)
export const LEGAL_DISCLAIMER = "Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros. Investimentos envolvem riscos.";
export const LEGAL_AI_DISCLAIMER = "As análises geradas por inteligência artificial são sínteses educacionais e hipóteses de mercado baseadas em dados públicos. Não representam recomendação de compra, venda ou alocação.";
