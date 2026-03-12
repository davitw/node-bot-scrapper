// src/output/telegram.bot.ts
import { Telegraf } from "telegraf";
import type { Deal } from "../core/types";
import type { PublisherFunction } from "../core/interfaces";

// Função auxiliar para evitar que caracteres especiais no título quebrem o HTML
const escapeHtml = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

export const createTelegramBot = (
  token: string,
  chatId: string,
): PublisherFunction => {
  const bot = new Telegraf(token);

  return async (deal: Deal): Promise<void> => {
    try {
      console.log(`📤 [Telegram] Enviando: ${deal.title}...`);

      // Título limpo e seguro
      const safeTitle = escapeHtml(deal.title);
      const safeStore = escapeHtml(deal.store);

      // Usando HTML (<b> para negrito)
      const message = `
🔥 <b>${safeTitle}</b>

💰 <b>Preço:</b> R$ ${deal.price.toFixed(2).replace(".", ",")}
🛒 <b>Loja:</b> ${safeStore}

👇 <a href="${deal.originalLink}">Link para comprar</a>
      `.trim();

      if (deal.image) {
        await bot.telegram.sendPhoto(chatId, deal.image, {
          caption: message,
          parse_mode: "HTML", // <--- Mudamos de Markdown para HTML
        });
      } else {
        await bot.telegram.sendMessage(chatId, message, {
          parse_mode: "HTML", // <--- Mudamos de Markdown para HTML
          link_preview_options: { is_disabled: false },
        });
      }
    } catch (error) {
      // Se der erro, logamos, mas não matamos o processo
      console.error("❌ [Telegram] Erro ao enviar mensagem:", error);
    }
  };
};
