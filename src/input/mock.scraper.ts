// src/input/mock.scraper.ts
import type { ScraperModule } from "../core/interfaces";
import type { Deal } from "../core/types";

// Implementação direta do módulo
export const mockScraper: ScraperModule = {
  name: "MockStore",

  getDeals: async (): Promise<Deal[]> => {
    console.log("🔍 [Funcional] Buscando promoções na MockStore...");

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        id: "123",
        title: "Console PlayStation 5 Slim",
        price: 3500.0,
        originalLink: "https://mockstore.com/ps5",
        image: "https://mockstore.com/img/ps5.jpg",
        store: "MockStore",
      },
      {
        id: "456",
        title: "Fralda Geriátrica",
        price: 50.0,
        originalLink: "https://mockstore.com/fralda",
        image: "https://mockstore.com/img/fralda.jpg",
        store: "MockStore",
      },
    ];
  },
};
