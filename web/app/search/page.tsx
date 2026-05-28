"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KioskHeader } from "@/components/KioskHeader";
import { WineImage } from "@/components/WineImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FLAGS: Record<string, string> = {
  Argentina: "🇦🇷", Chile: "🇨🇱", França: "🇫🇷", Franca: "🇫🇷",
  Itália: "🇮🇹", Italia: "🇮🇹", Portugal: "🇵🇹", Espanha: "🇪🇸",
  Brasil: "🇧🇷", Uruguai: "🇺🇾", Austrália: "🇦🇺", "Estados Unidos": "🇺🇸",
};

type Wine = {
  id: number;
  name: string;
  country: string;
  image_url: string | null;
  price_brl: number;
  category: string;
  grape_variety: string;
};

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<Wine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      qs.set("page_size", "24");
      fetch(`${API}/wines?${qs}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.items || []);
          setTotal(data.total || 0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className="px-5 py-6 max-w-lg mx-auto fade-in">
      {/* Search input */}
      <div className="relative mb-6">
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-burgundy/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, uva, região..."
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-gray-200 text-burgundy-deep text-sm placeholder:text-burgundy/40 focus:outline-none focus:border-gold/50 shadow-sm"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length === 0 && q && (
        <div className="text-center py-12">
          <p className="font-display text-xl text-burgundy-deep">Nenhum vinho encontrado</p>
          <p className="text-burgundy/50 text-sm mt-2">Tente outra busca.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-burgundy/50 text-sm mb-4">{total} vinho(s) encontrado(s)</p>
          <div className="grid grid-cols-2 gap-4">
            {results.map((wine) => (
              <Link
                key={wine.id}
                href={`/wine/${wine.id}`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all duration-200 active:scale-95 hover:shadow-md"
              >
                <div className="relative h-36 mb-3 rounded-xl bg-burgundy/[0.03] flex items-center justify-center">
                  <span className="absolute top-2 right-2 text-lg z-10">{FLAGS[wine.country] || "🏳️"}</span>
                  <WineImage src={wine.image_url} alt={wine.name} category={wine.category} height={120} className="max-h-[110px]" />
                </div>
                <p className="font-semibold text-sm text-burgundy-deep leading-tight">{wine.name}</p>
                <p className="text-xs text-burgundy/50 mt-1">{wine.country}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EF]">
      <KioskHeader backHref="/categorias" title="Buscar" variant="dark" />
      <Suspense fallback={<p className="p-6 text-center text-burgundy/50">Carregando...</p>}>
        <SearchInner />
      </Suspense>
    </main>
  );
}
