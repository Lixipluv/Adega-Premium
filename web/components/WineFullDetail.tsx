"use client";
import Image from "next/image";
import { FLAGS, formatBRL, qrUrl, type Wine } from "@/lib/api";
import { WineImage } from "@/components/WineImage";
import { getPairingImages } from "@/lib/media";
import {
  BADGE_LABELS,
  BODY_LABELS,
  CATEGORY_LABELS,
  FOOD_LABELS,
  KNOWLEDGE_LABELS,
  SWEETNESS_LABELS,
} from "@/lib/labels";
import { useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function WineFullDetail({ wine }: { wine: Wine }) {
  const pairings = getPairingImages();
  const badges = wine.badges ?? [];
  if (wine.on_promotion && !badges.includes("promocao")) badges.unshift("promocao");

  useEffect(() => {
    fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wine_id: wine.id, event_type: "detail_open" }),
    }).catch(() => {});
  }, [wine.id]);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-burgundy/5 overflow-hidden">
      <div className="relative h-64 bg-gradient-to-b from-burgundy/[0.06] to-cream flex items-center justify-center">
        <WineImage src={wine.image_url} alt={wine.name} category={wine.category} height={220} className="max-h-[220px]" priority />
        {!wine.stock_available && (
          <span className="absolute top-4 left-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
            Fora de estoque
          </span>
        )}
      </div>

      <div className="px-6 py-6 space-y-5">
        <div>
          <h1 className="font-display text-3xl text-burgundy-deep leading-tight">{wine.name}</h1>
          <p className="text-burgundy/70 mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-xl">{FLAGS[wine.country] || "🍷"}</span>
            <span>
              {wine.winery}
              {wine.region ? ` · ${wine.region}` : ""}, {wine.country}
            </span>
          </p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((b) =>
                BADGE_LABELS[b] ? (
                  <span key={b} className={`text-xs font-medium px-3 py-1 rounded-full ${BADGE_LABELS[b].color}`}>
                    {BADGE_LABELS[b].label}
                  </span>
                ) : null,
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoChip label="Tipo" value={CATEGORY_LABELS[wine.category] || wine.category} />
          <InfoChip label="Uva" value={wine.grape_variety} />
          {wine.vintage_year && <InfoChip label="Safra" value={String(wine.vintage_year)} />}
          {wine.alcohol_pct != null && <InfoChip label="Álcool" value={`${wine.alcohol_pct}%`} />}
          <InfoChip label="Doçura" value={SWEETNESS_LABELS[wine.sweetness_level || "seco"] || wine.sweetness_level || "Seco"} />
          <InfoChip label="Corpo" value={BODY_LABELS[wine.body || "medio"] || wine.body || "Médio"} />
          <InfoChip label="Nível" value={KNOWLEDGE_LABELS[wine.knowledge_level || "intermediario"] || ""} />
          {wine.score_average > 0 && <InfoChip label="Nota" value={`★ ${wine.score_average.toFixed(1)}`} />}
        </div>

        <Section title="Notas de sabor" icon="doc">
          <p className="text-sm text-burgundy/85 leading-relaxed">{wine.tasting_notes}</p>
        </Section>

        <Section title="Harmonização" icon="food">
          <p className="text-sm text-burgundy/85 leading-relaxed mb-3">{wine.pairing_suggestions}</p>
          {wine.food_pairings && wine.food_pairings.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {wine.food_pairings.map((f) => (
                <span key={f} className="text-xs bg-cream border border-burgundy/10 px-2 py-1 rounded-lg">
                  {FOOD_LABELS[f] || f}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {pairings.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-burgundy/10">
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        </Section>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between pt-4 border-t border-burgundy/10">
          <div>
            <p className="text-xs font-bold text-burgundy/50 uppercase tracking-wider">Preço</p>
            <p className="font-display text-4xl text-burgundy-deep font-semibold mt-1">{formatBRL(wine.price_brl)}</p>
          </div>
          <div className="flex flex-col items-center gap-2 bg-cream rounded-2xl p-4 border border-burgundy/10">
            <img src={qrUrl(wine.id)} alt="QR Code" className="w-28 h-28" />
            <p className="text-[11px] text-burgundy/60 text-center max-w-[140px]">
              Escaneie para ver no celular ou comprar online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-xl px-3 py-2.5 border border-burgundy/5">
      <p className="text-[10px] uppercase tracking-wider text-burgundy/50 font-semibold">{label}</p>
      <p className="text-sm font-medium text-burgundy-deep mt-0.5">{value}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "doc" | "food";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon === "doc" ? (
          <svg className="w-4 h-4 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 7h10M7 12h6" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 6v12a3 3 0 003 3h6a3 3 0 003-3V6" />
          </svg>
        )}
        <h2 className="text-sm font-bold text-burgundy-deep uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}
