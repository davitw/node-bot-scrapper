import { Page } from "puppeteer";
import type { ScraperModule } from "../core/interfaces";
import type { Deal } from "../core/types";
import { parsePrice, getCleanId } from "../core/utils";
import type { Browser } from "puppeteer";

// Removemos a constante TARGET_URL daqui. Ela virá de fora.

export const amazonScraper: ScraperModule = {
  name: "AmazonBR",

  // Recebe a 'targetUrl' como argumento agora
  getDeals: async (targetUrl: string, page: Page): Promise<Deal[]> => {
    // ... Configurações do Browser (Iguais ao anterior) ...

    try {
      await page.setViewport({ width: 1920, height: 1080 });

      await page.setExtraHTTPHeaders({
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      });

      console.log(`🔌 [Amazon] Acessando: ${targetUrl}`);
      // Usa a variável targetUrl
      await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 60000 });

      // ... O RESTO DO CÓDIGO DE EXTRAÇÃO É IDÊNTICO AO ANTERIOR ...
      // (Copie a parte do page.evaluate até o final do try/catch da sua versão anterior)

      // Apenas para facilitar, aqui está o bloco page.evaluate resumido:
      const rawDeals = await page.evaluate(() => {
        const extracted: any[] = [];
        const items = document.querySelectorAll("div[data-asin]");
        items.forEach((item) => {
          const asin = item.getAttribute("data-asin");
          if (!asin) return;
          const titleEl =
            item.querySelector("h2") || item.querySelector("h2 a span");
          const title = titleEl ? titleEl.textContent : null;
          if (!title) return;
          const priceEl = item.querySelector(".a-price .a-offscreen");
          const priceText = priceEl ? priceEl.textContent : null;
          const linkEl =
            item.querySelector("a.a-link-normal") || item.querySelector("h2 a");
          const imgEl = item.querySelector("img.s-image");

          if (priceText && linkEl) {
            extracted.push({
              asin,
              title: title.trim(),
              link: linkEl.getAttribute("href"),
              img: imgEl?.getAttribute("src"),
              priceText,
            });
          }
        });
        return extracted;
      });

      console.log(`✅ [Amazon] Encontrados ${rawDeals.length} produtos.`);

      const deals: Deal[] = rawDeals.map((item) => {
        const fullLink = item.link.startsWith("http")
          ? item.link
          : `https://www.amazon.com.br${item.link}`;
        const uniqueId = getCleanId(fullLink, item.asin);

        return {
          id: uniqueId,
          title: item.title,
          price: parsePrice(item.priceText),
          originalLink: fullLink,
          image: item.img || "",
          store: "Amazon",
          category: "category", // Poderíamos passar isso na config também!
        };
      });

      return deals;
    } catch (error) {
      console.error("❌ Erro no Scraper:", error);
      return [];
    }
  },
};
