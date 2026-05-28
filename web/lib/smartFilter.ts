export type SmartFilters = {
  q?: string;
  category?: string;
  max_price?: number;
  min_price?: number;
  food?: string;
  country?: string;
  grape?: string;
  body?: string;
  sweetness?: string;
  knowledge_level?: string;
  on_promotion?: boolean;
  occasion?: string;
  sort?: string;
};

const FOOD_KEYWORDS: Record<string, string> = {
  massa: "massa",
  massas: "massa",
  pasta: "massa",
  macarrão: "massa",
  macarrao: "massa",
  carne: "carne",
  carnes: "carne",
  bife: "carne",
  churrasco: "carne",
  peixe: "peixe",
  peixes: "peixe",
  frutos: "peixe",
  mar: "peixe",
  queijo: "queijo",
  queijos: "queijo",
  frango: "frango",
  ave: "frango",
};

const CATEGORY_KEYWORDS: Record<string, string> = {
  tinto: "tinto",
  tintos: "tinto",
  branco: "branco",
  brancos: "branco",
  rosé: "rose",
  rose: "rose",
  rosés: "rose",
  espumante: "espumante",
  espumantes: "espumante",
  champagne: "espumante",
};

const OCCASION_KEYWORDS: Record<string, string> = {
  presente: "presente",
  jantar: "jantar",
  janta: "jantar",
  promoção: "promocao",
  promocao: "promocao",
  promo: "promocao",
};

const KNOWLEDGE_KEYWORDS: Record<string, string> = {
  iniciante: "iniciante",
  iniciantes: "iniciante",
  fácil: "iniciante",
  facil: "iniciante",
  apreciador: "apreciador",
  especialista: "apreciador",
};

/** Interpreta frases como "vinho para massas até R$ 80" */
export function parseSmartQuery(input: string): SmartFilters {
  const text = input.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const filters: SmartFilters = {};

  const priceUntil = text.match(/(?:ate|até|maximo|máximo|menos de)\s*r?\$?\s*(\d+)/);
  const priceFrom = text.match(/(?:acima de|mais de|minimo|mínimo)\s*r?\$?\s*(\d+)/);
  const priceSimple = text.match(/r?\$\s*(\d+)/);

  if (priceUntil) filters.max_price = Number(priceUntil[1]);
  else if (priceSimple && !priceFrom) filters.max_price = Number(priceSimple[1]);
  if (priceFrom) filters.min_price = Number(priceFrom[1]);

  for (const [word, food] of Object.entries(FOOD_KEYWORDS)) {
    if (text.includes(word)) {
      filters.food = food;
      break;
    }
  }

  for (const [word, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(word)) {
      filters.category = cat;
      break;
    }
  }

  for (const [word, occ] of Object.entries(OCCASION_KEYWORDS)) {
    if (text.includes(word)) {
      if (occ === "promocao") filters.on_promotion = true;
      else filters.occasion = occ;
      break;
    }
  }

  for (const [word, level] of Object.entries(KNOWLEDGE_KEYWORDS)) {
    if (text.includes(word)) {
      filters.knowledge_level = level;
      break;
    }
  }

  if (text.includes("barato") || text.includes("economico") || text.includes("econômico")) {
    filters.max_price = filters.max_price ?? 100;
    filters.occasion = filters.occasion ?? "custo-beneficio";
  }

  if (!filters.food && !filters.category && input.trim().length > 2) {
    filters.q = input.trim();
  }

  return filters;
}

export function filtersToSearchParams(f: SmartFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.max_price != null) p.set("max_price", String(f.max_price));
  if (f.min_price != null) p.set("min_price", String(f.min_price));
  if (f.food) p.set("food", f.food);
  if (f.country) p.set("country", f.country);
  if (f.grape) p.set("grape", f.grape);
  if (f.body) p.set("body", f.body);
  if (f.sweetness) p.set("sweetness", f.sweetness);
  if (f.knowledge_level) p.set("knowledge_level", f.knowledge_level);
  if (f.on_promotion) p.set("promo", "true");
  if (f.occasion) p.set("occasion", f.occasion);
  if (f.sort) p.set("sort", f.sort);
  return p;
}
