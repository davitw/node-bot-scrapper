export interface Deal {
  id: string; // Um ID único (pode ser o hash da URL)
  title: string; // Título do produto
  price: number; // Preço numérico (ex: 1200.50)
  originalLink: string; // Link original da loja
  image: string; // URL da imagem do produto
  store: string; // Nome da loja (ex: 'Amazon')
  category?: string; // Categoria encontrada
}

// Configuração do Nicho (carregada do JSON)
export interface NicheConfig {
  name: string;
  keywords: {
    mustInclude: string[]; // Whitelist
    mustExclude: string[]; // Blacklist
  };
  maxPrice?: number;
}
