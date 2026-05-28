import type { SmartFilters } from "./smartFilter";
import { filtersToSearchParams } from "./smartFilter";

export type PriceRange = "ate80" | "80-150" | "150-300" | "any";
export type TastePref = "seco" | "suave" | "unsure";
export type OccasionPref = "presente" | "consumo" | "jantar";

export type QuizAnswers = {
  food: string | null;
  priceRange: PriceRange;
  taste: TastePref;
  occasion: OccasionPref;
};

export const QUIZ_STEPS = [
  {
    id: "food",
    title: "Vai beber com comida?",
    subtitle: "Escolha o tipo de prato ou beber só o vinho",
  },
  {
    id: "price",
    title: "Qual faixa de preço?",
    subtitle: "Toque na opção que combina com você",
  },
  {
    id: "taste",
    title: "Prefere suave, seco ou não sabe?",
    subtitle: "Sem problema — te ajudamos a decidir",
  },
  {
    id: "occasion",
    title: "É para presente ou consumo?",
    subtitle: "Última pergunta",
  },
] as const;

export function answersToFilters(a: QuizAnswers): SmartFilters {
  const f: SmartFilters = { sort: "score" };

  switch (a.priceRange) {
    case "ate80":
      f.max_price = 80;
      break;
    case "80-150":
      f.min_price = 80;
      f.max_price = 150;
      break;
    case "150-300":
      f.min_price = 150;
      f.max_price = 300;
      break;
    default:
      break;
  }

  if (a.food) f.food = a.food;

  if (a.taste === "seco") {
    f.sweetness = "seco";
  } else if (a.taste === "suave") {
    f.sweetness = "meio-seco";
    f.body = "leve";
  } else {
    f.knowledge_level = "iniciante";
  }

  if (a.occasion === "presente") {
    f.occasion = "presente";
  } else if (a.occasion === "jantar") {
    f.occasion = "jantar";
    if (!f.food) f.food = "carne";
  }

  return f;
}

/** Relaxa filtros se poucos resultados */
export function relaxedFilterVariants(base: SmartFilters): SmartFilters[] {
  const variants: SmartFilters[] = [base];
  const v2 = { ...base };
  delete v2.food;
  variants.push(v2);
  const v3 = { ...v2, knowledge_level: undefined, body: undefined, sweetness: undefined };
  delete v3.max_price;
  delete v3.min_price;
  variants.push(v3);
  return variants;
}

export function filtersToQueryString(f: SmartFilters): string {
  const p = filtersToSearchParams(f);
  p.set("page_size", "3");
  p.set("sort", "score");
  return p.toString();
}
