/** Imagens locais e fallbacks para vinhos e categorias */

export const IMAGES = {
  heroHome: "/images/hero-home.jpg",
  bgCellar: "/images/bg-cellar.jpg",
  bgLogin: "/images/bg-login.jpg",
  adminSidebar: "/images/bg-admin-sidebar.jpg",
} as const;

const CATEGORY_IMAGES: Record<string, string> = {
  tinto: "/images/cat-tinto.jpg",
  branco: "/images/cat-branco.jpg",
  rose: "/images/cat-rose.jpg",
  espumante: "/images/cat-espumante.jpg",
};

const WINE_BOTTLE_BY_CATEGORY: Record<string, string> = {
  tinto: "/images/cat-tinto.jpg",
  branco: "/images/cat-branco.jpg",
  rose: "/images/cat-rose.jpg",
  espumante: "/images/cat-espumante.jpg",
};

const PAIRING_IMAGES = [
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&w=200",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&w=200",
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&w=200",
];

export function getCategoryHeroImage(slug: string): string {
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.tinto;
}

export function getWineImage(imageUrl: string | null | undefined, category?: string): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  const cat = (category || "tinto").toLowerCase();
  return WINE_BOTTLE_BY_CATEGORY[cat] || WINE_BOTTLE_BY_CATEGORY.tinto;
}

export function getPairingImages(): string[] {
  return PAIRING_IMAGES;
}
