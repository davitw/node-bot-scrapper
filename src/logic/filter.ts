// src/logic/filter.ts
import type { Deal, NicheConfig } from "../core/types";

// Esta é uma "Factory Function". Ela cria o filtro com base na config.
export const createDealFilter = (config: NicheConfig) => {
  // Retorna a função que será usada no filter do array
  return (deal: Deal): boolean => {
    const titleLower = deal.title.toLowerCase();

    // 1. Check Blacklist
    const hasForbiddenWord = config.keywords.mustExclude.some((word) =>
      titleLower.includes(word.toLowerCase()),
    );
    if (hasForbiddenWord) {
      console.log(`❌ Filtrado (Blacklist): ${deal.title}`);
      return false;
    }

    // 2. Check Whitelist
    if (config.keywords.mustInclude.length > 0) {
      const hasRequiredWord = config.keywords.mustInclude.some((word) =>
        titleLower.includes(word.toLowerCase()),
      );
      if (!hasRequiredWord) {
        console.log(`❌ Filtrado (Keywords): ${deal.title}`);
        return false;
      }
    }

    return true;
  };
};
