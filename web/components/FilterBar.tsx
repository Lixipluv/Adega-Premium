"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const COUNTRIES = ["Argentina", "Chile", "França", "Itália", "Portugal", "Espanha"];
const GRAPES = ["Malbec", "Cabernet Sauvignon", "Sangiovese", "Tempranillo", "Chardonnay"];
const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Até R$ 150", max: 150 },
  { label: "R$ 150–300", min: 150, max: 300 },
  { label: "R$ 300–600", min: 300, max: 600 },
  { label: "Acima R$ 600", min: 600 },
];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString());
      if (value === undefined || next.get(key) === value) next.delete(key);
      else next.set(key, value);
      router.push(`/search?${next.toString()}`);
    },
    [params, router],
  );

  const setRange = (min?: number, max?: number) => {
    const next = new URLSearchParams(params.toString());
    if (min !== undefined) next.set("min_price", String(min));
    else next.delete("min_price");
    if (max !== undefined) next.set("max_price", String(max));
    else next.delete("max_price");
    router.push(`/search?${next.toString()}`);
  };

  const Pill = ({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label: string }) => (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`min-h-[48px] px-5 rounded-full text-base font-medium transition ${
        active ? "bg-burgundy text-cream" : "bg-cream text-burgundy border border-burgundy/20"
      }`}
    >
      {children}
    </button>
  );

  const country = params.get("country") ?? "";
  const grape = params.get("grape") ?? "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map((c) => (
          <Pill key={c} active={country === c} onClick={() => setParam("country", c)} label={`Filtrar por ${c}`}>
            {c}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {GRAPES.map((g) => (
          <Pill key={g} active={grape === g} onClick={() => setParam("grape", g)} label={`Filtrar uva ${g}`}>
            {g}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRICE_RANGES.map((r) => (
          <Pill key={r.label} active={false} onClick={() => setRange(r.min, r.max)} label={`Faixa ${r.label}`}>
            {r.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
