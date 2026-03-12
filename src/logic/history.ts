// src/logic/history.ts
import { PrismaClient } from "@prisma/client";
import type { Deal } from "../core/types";

// Instância única do cliente do banco
const prisma = new PrismaClient();

// Função que pergunta: "Já enviamos isso?"
export const hasBeenSent = async (dealId: string): Promise<boolean> => {
  const found = await prisma.sentDeal.findUnique({
    where: { id: dealId },
  });
  // Se encontrou (não é null), retorna true
  return !!found;
};

// Função que diz: "Marque como enviado agora!"
export const markAsSent = async (deal: Deal): Promise<void> => {
  await prisma.sentDeal.create({
    data: {
      id: deal.id,
      title: deal.title,
      store: deal.store,
      price: deal.price,
    },
  });
  console.log(
    `💾 [Banco] Salvo no histórico: ${deal.title.substring(0, 20)}...`,
  );
};
