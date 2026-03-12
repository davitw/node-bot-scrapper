import "dotenv/config";
import cron from "node-cron";
import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-extra"; // A versão com Stealth
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { amazonScraper } from "./input/amazon.scraper";
import { mercadoLivreScraper } from "./input/mercadolivre.scraper";
import { createTelegramBot } from "./output/telegram.bot";
import { hasBeenSent, markAsSent } from "./logic/history";
import { loadDynamicConfig } from "./core/config.loader";
import { Deal } from "./core/types";

// Ativa o plugin stealth
puppeteer.use(StealthPlugin());

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) process.exit(1);

let isRunning = false;

async function runBotCycle() {
  if (isRunning) {
    console.log("⚠️ Ciclo anterior ocupado. Aguardando...");
    return;
  }
  isRunning = true;
  console.log(`\n⏰ Iniciando Ciclo: ${new Date().toLocaleTimeString()}`);

  const currentConfig = loadDynamicConfig();
  if (!currentConfig) {
    isRunning = false;
    return;
  }

  // CONFIGURAÇÃO DO CLUSTER
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    // --- A CORREÇÃO MÁGICA ---
    // Dizemos ao Cluster para usar a nossa instância do puppeteer-extra (com Stealth)
    // e não o puppeteer padrão.
    puppeteer: puppeteer,
    // -------------------------
    puppeteerOptions: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=1920,1080",
        "--start-maximized",
        "--lang=pt-BR,pt",
        "--disable-blink-features=AutomationControlled",
      ],
    },
    timeout: 60000,
  });

  const sendToTelegram = createTelegramBot(
    TELEGRAM_TOKEN as string,
    TELEGRAM_CHAT_ID as string,
  );

  await cluster.task(async ({ page, data: query }) => {
    const url = query.url;
    const name = query.name;

    console.log(`\n🔎 Processando: ${name}`);
    let deals: Deal[] = [];

    try {
      if (url.includes("amazon")) {
        deals = await amazonScraper.getDeals(url, page);
      } else if (url.includes("mercadolivre")) {
        deals = await mercadoLivreScraper.getDeals(url, page);
      }

      console.log(`   ↳ Encontrados: ${deals.length} itens brutos.`);

      // FILTRAGEM COM LOGS
      const validDeals = deals.filter((deal) => {
        const titleLower = deal.title.toLowerCase();

        // 1. Filtro de Palavras
        const excludedWord = currentConfig.filters.mustExclude.find((word) =>
          titleLower.includes(word.toLowerCase()),
        );
        if (excludedWord) {
          // Descomente se quiser ver o que foi bloqueado
          // console.log(`      ⛔ Bloqueado por palavra '${excludedWord}': ${deal.title.substring(0, 30)}...`);
          return false;
        }

        // 2. Filtro de Preço
        if (deal.price < currentConfig.filters.minPrice) {
          // console.log(`      ⛔ Preço baixo (R$ ${deal.price}): ${deal.title.substring(0, 30)}...`);
          return false;
        }

        return true;
      });

      console.log(`   👉 ${validDeals.length} itens passaram nos filtros.`);

      let sentCount = 0;
      for (const deal of validDeals) {
        const alreadySent = await hasBeenSent(deal.id);

        if (alreadySent) {
          console.log(`      ⏩ Já enviado antes: ${deal.id}`);
          continue;
        }

        console.log(`      🚀 ENVIANDO: ${deal.title.substring(0, 40)}...`);
        await sendToTelegram(deal);
        await markAsSent(deal);
        sentCount++;
        await new Promise((r) => setTimeout(r, 2000)); // Delay anti-spam
      }

      console.log(`   ✅ Enviados para o Telegram nesta rodada: ${sentCount}`);
    } catch (err) {
      console.error(`❌ Erro crítico em ${name}:`, err);
    }
  });

  for (const query of currentConfig.queries) {
    cluster.queue(query);
  }

  await cluster.idle();
  await cluster.close();

  console.log("🏁 Ciclo Finalizado.");
  isRunning = false;
}

console.log(`🚀 Bot Iniciado (Cluster + Stealth).`);
cron.schedule("*/30 * * * *", runBotCycle);
runBotCycle();
