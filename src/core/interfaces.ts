// src/core/interfaces.ts
import type { Deal } from "./types";
import { Page } from "puppeteer";

// Um Scraper agora é apenas um objeto com um nome e uma função de busca
export type ScraperModule = {
  name: string;
  getDeals: (url: string, page: Page) => Promise<Deal[]>;
};

// Um Bot/Publisher é apenas uma função que recebe uma Deal e retorna uma Promise vazia
export type PublisherFunction = (deal: Deal) => Promise<void>;
