import * as fs from "fs"; // <--- Para salvar o debug
import type { ScraperModule } from "../core/interfaces";
import type { Deal } from "../core/types";
import { parsePrice, getCleanId } from "../core/utils";
import { Page } from "puppeteer";

export const mercadoLivreScraper: ScraperModule = {
  name: "MercadoLivre (Universal)",

  getDeals: async (targetUrl: string, page: Page): Promise<Deal[]> => {
    try {
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`🔌 [ML] Acessando: ${targetUrl}`);

      // Espera carregar. Mercado Livre é rápido, mas networkidle2 é mais seguro.
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Espera pelo menos algum elemento de lista aparecer
      try {
        await page.waitForSelector("li.ui-search-layout__item", {
          timeout: 5000,
        });
      } catch (e) {
        // Se falhar, tenta esperar pelo novo layout (poly-card)
        try {
          await page.waitForSelector(".poly-card", { timeout: 5000 });
        } catch (e2) {}
      }

      const rawDeals = await page.evaluate(() => {
        const extracted: any[] = [];

        // Tenta pegar itens do layout ANTIGO ou NOVO
        // Layout Antigo: li.ui-search-layout__item
        // Layout Novo: div.poly-card ou div.ui-search-result__wrapper
        const items = document.querySelectorAll(
          "li.ui-search-layout__item, div.poly-card, div.ui-search-result__wrapper",
        );

        items.forEach((item) => {
          // --- TÍTULO ---
          // Tenta seletores do modelo antigo e do novo
          let title = null;
          const t1 = item.querySelector(".ui-search-item__title");
          const t2 = item.querySelector(".poly-component__title"); // Novo layout
          const t3 = item.querySelector("h2"); // Genérico

          if (t1) title = t1.textContent;
          else if (t2) title = t2.textContent;
          else if (t3) title = t3.textContent;

          if (!title) return;

          // --- LINK ---
          let link = null;
          const l1 = item.querySelector("a.ui-search-link");
          const l2 = item.querySelector("a.poly-component__title"); // No novo, o titulo é o link
          const l3 = item.querySelector("a"); // Genérico

          if (l1) link = l1.getAttribute("href");
          else if (l2) link = l2.getAttribute("href");
          else if (l3) link = l3.getAttribute("href");

          if (!link) return;

          // --- PREÇO ---
          // O ML usa a classe "andes-money-amount__fraction" para a parte inteira do preço
          // Isso costuma ser igual em todos os layouts
          const priceEl = item.querySelector(".andes-money-amount__fraction");
          const priceText = priceEl ? priceEl.textContent : null;

          // --- IMAGEM ---
          const imgEl = item.querySelector("img");
          let image = imgEl ? imgEl.getAttribute("src") : null;
          // Correção para Lazy Load (data-src)
          if (imgEl && (!image || image.includes("data:image"))) {
            image = imgEl.getAttribute("data-src") || image;
          }

          if (title && priceText && link) {
            extracted.push({
              title: title.trim(),
              link,
              image,
              priceText,
            });
          }
        });
        return extracted;
      });

      console.log(`✅ [ML] Encontrados ${rawDeals.length} produtos.`);

      const deals: Deal[] = rawDeals.map((item) => {
        const uniqueId = getCleanId(item.link);

        return {
          id: uniqueId,
          title: item.title,
          price: parsePrice(item.priceText),
          originalLink: item.link,
          image: item.image || "",
          store: "Mercado Livre",
          category: "category",
        };
      });

      return deals;
    } catch (error) {
      console.error("❌ Erro no Scraper ML:", error);
      return [];
    }
  },
};
