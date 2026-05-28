const SERVER_BASE = process.env.API_URL_INTERNAL || "http://api:8000";
const CLIENT_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const base = () => (typeof window === "undefined" ? SERVER_BASE : CLIENT_BASE);

export type Wine = {
  id: number;
  name: string;
  winery: string;
  region: string | null;
  country: string;
  grape_variety: string;
  vintage_year: number | null;
  price_brl: number;
  alcohol_pct: number | null;
  tasting_notes: string | null;
  pairing_suggestions: string | null;
  score_average: number;
  stock_available: boolean;
  image_url: string | null;
  category: string;
  sweetness_level?: string;
  body?: string;
  on_promotion?: boolean;
  knowledge_level?: string;
  badges?: string[];
  food_pairings?: string[];
};

export type WineList = {
  items: Wine[];
  page: number;
  page_size: number;
  total: number;
};

export async function listWines(params: Record<string, string | number | undefined> = {}): Promise<WineList> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const res = await fetch(`${base()}/wines?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch wines");
  return res.json();
}

export async function getWine(id: number): Promise<Wine> {
  const res = await fetch(`${base()}/wines/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Wine not found");
  return res.json();
}

export async function relatedWines(id: number): Promise<Wine[]> {
  const res = await fetch(`${base()}/wines/${id}/related`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function topWines(): Promise<(Wine & { views: number })[]> {
  const res = await fetch(`${base()}/analytics/top`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}

export function qrUrl(id: number): string {
  return `${CLIENT_BASE}/wines/${id}/qr`;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const FLAGS: Record<string, string> = {
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  França: "🇫🇷",
  Franca: "🇫🇷",
  Itália: "🇮🇹",
  Italia: "🇮🇹",
  Portugal: "🇵🇹",
  Espanha: "🇪🇸",
  Brasil: "🇧🇷",
};
