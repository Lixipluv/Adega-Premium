import Link from "next/link";
import { FLAGS, formatBRL, type Wine } from "@/lib/api";
import { ScoreBadge } from "./ScoreBadge";

export function WineCard({ wine }: { wine: Wine }) {
  return (
    <Link
      href={`/wine/${wine.id}`}
      className="card-hover block rounded-2xl bg-cream shadow-card hover:shadow-cardHover p-5 min-w-[260px]"
      aria-label={`Ver detalhes de ${wine.name}`}
    >
      <div className="relative h-56 flex items-center justify-center">
        {wine.image_url ? (
          <img
            src={wine.image_url}
            alt={`Garrafa de ${wine.name}`}
            className="h-full w-auto object-contain drop-shadow"
            loading="lazy"
          />
        ) : (
          <div className="h-40 w-16 rounded-md bg-burgundy" aria-hidden />
        )}
        <span className="absolute top-1 right-1 text-2xl" aria-label={wine.country}>
          {FLAGS[wine.country] ?? "🍷"}
        </span>
      </div>
      <h3 className="font-display text-xl text-burgundy-deep leading-tight mt-3">{wine.name}</h3>
      <p className="text-sm text-burgundy/80 mt-1">{wine.country}</p>
      <div className="mt-3 flex items-center justify-between">
        <ScoreBadge score={wine.score_average} />
        <span className="font-display text-lg text-burgundy font-semibold">{formatBRL(wine.price_brl)}</span>
      </div>
    </Link>
  );
}
