import { getCategoryHeroImage } from "./media";

export type MenuItem = {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  image: string;
  accent: string;
};

export const KIOSK_MENU: MenuItem[] = [
  {
    id: "tinto",
    label: "Tintos",
    subtitle: "Encorpados e marcantes",
    href: "/explorar?category=tinto",
    image: getCategoryHeroImage("tinto"),
    accent: "from-[#3d1111]/90 to-[#5C1A1A]/40",
  },
  {
    id: "branco",
    label: "Brancos",
    subtitle: "Frescos e elegantes",
    href: "/explorar?category=branco",
    image: getCategoryHeroImage("branco"),
    accent: "from-[#4a4020]/90 to-[#8B7D3C]/40",
  },
  {
    id: "rose",
    label: "Rosés",
    subtitle: "Leves e florais",
    href: "/explorar?category=rose",
    image: getCategoryHeroImage("rose"),
    accent: "from-[#6B2A4A]/90 to-[#A04060]/40",
  },
  {
    id: "espumante",
    label: "Espumantes",
    subtitle: "Para celebrar",
    href: "/explorar?category=espumante",
    image: getCategoryHeroImage("espumante"),
    accent: "from-black/80 to-gray-800/40",
  },
  {
    id: "promocoes",
    label: "Promoções",
    subtitle: "Melhores ofertas",
    href: "/explorar?promo=true",
    image: getCategoryHeroImage("tinto"),
    accent: "from-red-950/90 to-burgundy/50",
  },
  {
    id: "mais-vendidos",
    label: "Mais vendidos",
    subtitle: "Favoritos da adega",
    href: "/explorar?sort=bestseller",
    image: getCategoryHeroImage("tinto"),
    accent: "from-[#2A0808]/90 to-gold/30",
  },
  {
    id: "harmonizacao",
    label: "Harmonização",
    subtitle: "Por tipo de comida",
    href: "/filtro?tab=comida",
    image: getCategoryHeroImage("branco"),
    accent: "from-burgundy-deep/90 to-burgundy/40",
  },
  {
    id: "preco",
    label: "Por preço",
    subtitle: "Escolha sua faixa",
    href: "/filtro?tab=preco",
    image: getCategoryHeroImage("espumante"),
    accent: "from-[#1a0808]/90 to-gold/20",
  },
];
