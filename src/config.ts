// src/config.ts
import "dotenv/config";

export const config = {
  // Configurações do Telegram
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN as string,
    chatId: process.env.TELEGRAM_CHAT_ID as string,
  },

  // Frequência de execução (Cron)
  cronSchedule: "*/60 * * * *", // A cada 30 minutos

  // Lista de produtos para monitorar (Você pode adicionar quantos quiser!)
  queries: [
    {
      name: "Bambu Lab A1 Amazon",
      url: "https://www.amazon.com.br/s?k=bambu+lab+a1",
      category: "Smartphones",
    },
    {
      name: "Bambu Lab A1 Mercado Livre",
      url: "https://lista.mercadolivre.com.br/bambu-lab-a1?sb=all_mercadolibre#D[A:bambu%20lab%20a1]",
      category: "Smartphones",
    },
    // Quer monitorar iPhone? Só adicionar aqui:
    // { name: "iPhone 15", url: "https://www.amazon.com.br/s?k=iphone+15" }
  ],

  // Filtros Globais (aplica para tudo)
  filters: {
    // Palavras que SE tiver no título, a gente ignora
    mustExclude: [
      "adesivo",
      "capa",
      "skin",
      "filme",
      "lençol",
      "suporte",
      "controle",
      "cover",
      "faceplate",
    ],
    // Preço mínimo para evitar acessórios baratos (Ex: R$ 1000)
    minPrice: 2000,
  },
};
