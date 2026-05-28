"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KioskHeader } from "@/components/KioskHeader";
import { parseSmartQuery, filtersToSearchParams } from "@/lib/smartFilter";
import { FOOD_LABELS } from "@/lib/labels";

const PRICE_RANGES = [
  { label: "Até R$ 80", min: undefined, max: 80 },
  { label: "R$ 80 – 150", min: 80, max: 150 },
  { label: "R$ 150 – 300", min: 150, max: 300 },
  { label: "Acima de R$ 300", min: 300, max: undefined },
];

const QUICK_PHRASES = [
  "Vinho para massas até R$ 80",
  "Tinto encorpado para jantar",
  "Espumante para presente",
  "Branco leve para iniciante",
  "Promoção até R$ 100",
];

function FiltroInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "smart";
  const [query, setQuery] = useState("");

  function go(params: URLSearchParams) {
    router.push(`/explorar?${params.toString()}`);
  }

  function handleSmartSearch() {
    const filters = parseSmartQuery(query);
    go(filtersToSearchParams(filters));
  }

  return (
    <>
      <KioskHeader backHref="/inicio" title="Filtro" variant="dark" />

      <section className="px-4 py-5 max-w-2xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-burgundy/10">
          {[
            { id: "smart", label: "Busca inteligente" },
            { id: "comida", label: "Por comida" },
            { id: "preco", label: "Por preço" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => router.push(`/filtro?tab=${t.id}`)}
              className={`flex-1 min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
                tab === t.id ? "bg-burgundy-deep text-cream" : "text-burgundy/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "smart" && (
          <div className="space-y-4">
            <p className="text-sm text-burgundy/70">
              Exemplo: <em className="text-burgundy-deep">“Quero um vinho para massas até R$ 80”</em>
              <br />
              <span className="text-xs text-burgundy/50">Prefere perguntas guiadas? Use </span>
              <a href="/escolher" className="text-burgundy font-semibold underline">Me ajude a escolher</a>
            </p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Descreva o que você procura..."
              rows={3}
              className="w-full rounded-2xl border border-burgundy/15 bg-white px-4 py-3 text-burgundy-deep text-base resize-none focus:outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={handleSmartSearch}
              className="kiosk-tap w-full min-h-[56px] rounded-2xl bg-burgundy-deep text-cream font-semibold"
            >
              Buscar vinhos
            </button>
            <div className="space-y-2">
              <p className="text-xs text-burgundy/50 uppercase tracking-wider font-semibold">Sugestões rápidas</p>
              {QUICK_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => {
                    setQuery(phrase);
                    const f = parseSmartQuery(phrase);
                    go(filtersToSearchParams(f));
                  }}
                  className="kiosk-tap w-full text-left min-h-[48px] px-4 py-3 rounded-xl bg-white border border-burgundy/10 text-sm text-burgundy-deep"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "comida" && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(FOOD_LABELS).map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  const p = new URLSearchParams();
                  p.set("food", slug);
                  go(p);
                }}
                className="kiosk-tap min-h-[72px] rounded-2xl bg-white border border-burgundy/10 font-semibold text-burgundy-deep shadow-sm active:scale-[0.98]"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {tab === "preco" && (
          <div className="space-y-3">
            {PRICE_RANGES.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  const p = new URLSearchParams();
                  if (r.min != null) p.set("min_price", String(r.min));
                  if (r.max != null) p.set("max_price", String(r.max));
                  go(p);
                }}
                className="kiosk-tap w-full min-h-[56px] rounded-2xl bg-white border border-burgundy/10 font-semibold text-burgundy-deep text-left px-5"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Filtros avançados */}
        <div className="bg-white rounded-2xl p-4 border border-burgundy/10 space-y-3">
          <p className="text-xs font-bold text-burgundy/50 uppercase">Filtros extras</p>
          <FilterSelect
            label="Tipo"
            options={[
              ["", "Todos"],
              ["tinto", "Tinto"],
              ["branco", "Branco"],
              ["rose", "Rosé"],
              ["espumante", "Espumante"],
            ]}
            onPick={(v) => {
              const p = new URLSearchParams();
              if (v) p.set("category", v);
              go(p);
            }}
          />
          <FilterSelect
            label="Nível"
            options={[
              ["", "Todos"],
              ["iniciante", "Iniciante"],
              ["intermediario", "Intermediário"],
              ["apreciador", "Apreciador"],
            ]}
            onPick={(v) => {
              const p = new URLSearchParams();
              if (v) p.set("knowledge_level", v);
              go(p);
            }}
          />
          <FilterSelect
            label="Corpo"
            options={[
              ["", "Todos"],
              ["leve", "Leve"],
              ["medio", "Médio"],
              ["encorpado", "Encorpado"],
            ]}
            onPick={(v) => {
              const p = new URLSearchParams();
              if (v) p.set("body", v);
              go(p);
            }}
          />
        </div>
      </section>
    </>
  );
}

function FilterSelect({
  label,
  options,
  onPick,
}: {
  label: string;
  options: [string, string][];
  onPick: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-burgundy/60">{label}</span>
      <select
        className="mt-1 w-full min-h-[48px] rounded-xl border border-burgundy/15 px-3 text-burgundy-deep bg-cream"
        defaultValue=""
        onChange={(e) => onPick(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v || "all"} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FiltroPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EF] kiosk-shell">
      <Suspense fallback={<p className="p-8 text-center">Carregando...</p>}>
        <FiltroInner />
      </Suspense>
    </main>
  );
}
