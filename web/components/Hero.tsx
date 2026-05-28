"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FLAGS, formatBRL, type Wine } from "@/lib/api";

export function Hero({ wines }: { wines: Wine[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (wines.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % wines.length), 8000);
    return () => clearInterval(t);
  }, [wines.length]);

  if (wines.length === 0) return null;
  const w = wines[idx];

  return (
    <Link
      href={`/wine/${w.id}`}
      className="relative block overflow-hidden rounded-3xl bg-burgundy-deep text-cream shadow-card fade-in"
      style={{ minHeight: 360 }}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,#C9A84C_0%,transparent_60%)]" />
      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-6 p-8 md:p-12">
        <div>
          <p className="text-gold tracking-widest text-sm uppercase">Destaque</p>
          <h2 className="font-display text-5xl md:text-6xl text-cream leading-tight mt-2">{w.name}</h2>
          <p className="mt-3 text-lg text-cream/80">
            <span className="mr-2">{FLAGS[w.country] ?? "🍷"}</span>
            {w.winery} — {w.country}
          </p>
          <p className="mt-4 text-cream/70 line-clamp-3 max-w-md">{w.tasting_notes}</p>
          <div className="mt-6 inline-flex items-center gap-3 bg-cream text-burgundy rounded-full px-6 py-3 min-h-[48px] font-semibold border border-gold">
            <span aria-hidden>🍷</span> Ver produto · {formatBRL(w.price_brl)}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          {w.image_url ? (
            <img src={w.image_url} alt={w.name} className="h-72 object-contain drop-shadow-2xl" />
          ) : (
            <div className="h-72 w-24 rounded-md bg-cream" aria-hidden />
          )}
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {wines.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i === idx ? "bg-gold" : "bg-cream/30"}`}
            aria-hidden
          />
        ))}
      </div>
    </Link>
  );
}
