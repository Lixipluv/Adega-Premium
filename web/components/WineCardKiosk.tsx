import Link from "next/link";
import { FLAGS, formatBRL, type Wine } from "@/lib/api";
import { WineImage } from "@/components/WineImage";
import { BADGE_LABELS } from "@/lib/labels";

export function WineCardKiosk({ wine, href }: { wine: Wine; href?: string }) {
  const link = href ?? `/wine/${wine.id}`;
  const promo = wine.on_promotion;
  const badge = wine.badges?.[0];

  return (
    <Link
      href={link}
      className="kiosk-tap bg-white rounded-2xl p-4 shadow-sm border border-burgundy/5 flex flex-col h-full active:scale-[0.97] transition-all hover:shadow-md hover:border-gold/30"
    >
      <div className="relative h-36 rounded-xl bg-gradient-to-b from-burgundy/[0.04] to-transparent flex items-center justify-center mb-3">
        {promo && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
            Promo
          </span>
        )}
        <span className="absolute top-2 right-2 text-lg z-10">{FLAGS[wine.country] || "🏳️"}</span>
        <WineImage src={wine.image_url} alt={wine.name} category={wine.category} height={120} className="max-h-[115px]" />
      </div>
      <p className="font-semibold text-sm text-burgundy-deep leading-snug line-clamp-2 flex-1">{wine.name}</p>
      <p className="text-xs text-burgundy/50 mt-1">{wine.country}</p>
      <p className="text-sm font-bold text-burgundy-deep mt-2">{formatBRL(wine.price_brl)}</p>
      {badge && BADGE_LABELS[badge] && (
        <span className={`mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${BADGE_LABELS[badge].color}`}>
          {BADGE_LABELS[badge].label}
        </span>
      )}
    </Link>
  );
}
