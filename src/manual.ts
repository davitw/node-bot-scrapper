// src/manual.ts
import "dotenv/config";
import inquirer from "inquirer";
import { createTelegramBot } from "./output/telegram.bot";
import { markAsSent, hasBeenSent } from "./logic/history";
import { getCleanId } from "./core/utils";
import type { Deal } from "./core/types";

// Carrega configurações
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error("❌ Configure o .env primeiro.");
  process.exit(1);
}

const sendToTelegram = createTelegramBot(token, chatId);

async function manualEntry() {
  console.log("📝 --- INSERIR PROMOÇÃO MANUALMENTE --- \n");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "📦 Qual o TÍTULO do produto?",
      validate: (input) =>
        input.length > 0 ? true : "O título não pode ser vazio.",
    },
    {
      type: "input",
      name: "price",
      message: "💰 Qual o PREÇO? (apenas números, ex: 199.90)",
      validate: (input) =>
        !isNaN(parseFloat(input))
          ? true
          : "Digite um número válido (ex: 1500.00).",
    },
    {
      type: "input",
      name: "link",
      message: "🔗 Qual o LINK da oferta?",
      validate: (input) =>
        input.startsWith("http") ? true : "O link deve começar com http.",
    },
    {
      type: "input",
      name: "image",
      message: "📸 Qual o LINK DA IMAGEM? (Deixe vazio se não tiver)",
    },
    {
      type: "input",
      name: "store",
      message: "🏪 Qual o nome da LOJA?",
      default: "Oferta Especial",
    },
  ]);

  // Monta o objeto Deal
  const deal: Deal = {
    id: getCleanId(answers.link), // Gera um ID baseado no link
    title: answers.title,
    price: parseFloat(answers.price),
    originalLink: answers.link,
    image: answers.image || "", // Se estiver vazio, fica string vazia
    store: answers.store,
    category: "Manual",
  };

  // Verificação de segurança (Opcional: Você pode querer forçar o envio mesmo se já existe)
  const exists = await hasBeenSent(deal.id);
  if (exists) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "⚠️ Esse link já consta no banco de dados. Deseja enviar mesmo assim?",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log("❌ Cancelado.");
      return;
    }
  }

  console.log("\n🚀 Enviando para o Telegram...");

  try {
    await sendToTelegram(deal);
    await markAsSent(deal);
    console.log("✅ Sucesso! Promoção enviada e salva no histórico.");
  } catch (error) {
    console.error("❌ Erro ao enviar:", error);
  }
}

manualEntry();
