"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KioskHeader } from "@/components/KioskHeader";
import { WineCardKiosk } from "@/components/WineCardKiosk";
import type { Wine } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/labels";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ExplorarInner() {
  const params = useSearchParams();
  const [wines, setWines] = useState<Wine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    params.forEach((v, k) => qs.set(k, v));
    if (!qs.has("page_size")) qs.set("page_size", "24");
    return qs.toString();
  }, [params]);

  const title = useMemo(() => {
    if (params.get("promo") === "1") return "Promoções";
    if (params.get("sort") === "bestseller") return "Mais vendidos";
    const cat = params.get("category");
    if (cat) return CATEGORY_LABELS[cat] ? `${CATEGORY_LABELS[cat]}s` : cat;
    if (params.get("food")) return `Para ${params.get("food")}`;
    return "Vinhos";
  }, [params]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/wines?${queryString}`)
      .then((r) => r.json())
      .then((d) => {
        setWines(d.items || []);
        setTotal(d.total || 0);
      })
      .catch(() => setWines([]))
      .finally(() => setLoading(false));
  }, [queryString]);

  return (
    <>
      <KioskHeader backHref="/inicio" title={title} variant="dark" />

      <section className="px-4 py-5 max-w-2xl mx-auto">
        <p className="text-burgundy/50 text-sm mb-4">
          {loading ? "Carregando..." : `${total} vinho(s) encontrado(s)`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-burgundy/60">Nenhum vinho encontrado.</p>
            <a href="/filtro" className="inline-block mt-4 text-burgundy font-medium underline">
              Tentar filtro inteligente
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {wines.map((w) => (
              <WineCardKiosk key={w.id} wine={w} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function ExplorarPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EF] kiosk-shell">
      <Suspense fallback={<p className="p-8 text-center text-burgundy/50">Carregando...</p>}>
        <ExplorarInner />
      </Suspense>
    </main>
  );
}
