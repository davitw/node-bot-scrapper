// src/core/utils.ts

export const parsePrice = (priceText: string | null): number => {
  if (!priceText) return 0;

  // Remove "R$", espaços, pontos de milhar e troca vírgula por ponto
  // Ex: "R$ 3.500,00" -> "3500.00"
  const cleanString = priceText
    .replace(/[^\d,]/g, "") // Remove tudo que não é número ou vírgula
    .replace(",", "."); // Troca vírgula decimal por ponto

  const price = parseFloat(cleanString);
  return isNaN(price) ? 0 : price;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getCleanId = (
  link: string,
  specificId?: string | null,
): string => {
  // 1. Se já veio um ID pronto (ex: ASIN da Amazon), usa ele.
  if (specificId) {
    return specificId;
  }

  if (!link) return "unknown_id";

  // 2. TENTATIVA INTELIGENTE: Extrair ID do Mercado Livre (MLB)
  // Procura por padrões como: MLB-12345678 ou MLB12345678
  const mlMatch = link.match(/(MLB-?\d+)/i);

  if (mlMatch) {
    // Retorna apenas o ID (ex: MLB12345678), ignorando o resto do link
    return mlMatch[0]?.toUpperCase().replace("-", "") || "unknown_ml_id";
  }

  // 3. LIMPEZA PADRÃO (Fallback)
  // Remove tudo depois de '?' (Query Params)
  // Remove tudo depois de '#' (Hashes de rastreamento do ML)
  return link.split("?")[0]?.split("#")[0] || "unknown_id";
};
