import * as fs from "fs";
import * as path from "path";

export interface DynamicConfig {
  filters: {
    mustExclude: string[];
    minPrice: number;
  };
  queries: {
    name: string;
    url: string;
  }[];
}

export const loadDynamicConfig = (): DynamicConfig | null => {
  try {
    // Busca o arquivo na raiz do projeto
    const configPath = path.resolve(__dirname, "../../products.json");

    // Lê o arquivo de forma síncrona (bloqueia por milissegundos, mas garante a leitura)
    const rawData = fs.readFileSync(configPath, "utf-8");

    return JSON.parse(rawData);
  } catch (error) {
    console.error("❌ Erro ao ler products.json:", error);
    return null;
  }
};
