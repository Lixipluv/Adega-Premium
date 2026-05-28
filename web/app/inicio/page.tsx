import Link from "next/link";
import { KioskHeader } from "@/components/KioskHeader";
import { CategoryTile } from "@/components/CategoryTile";
import { KIOSK_MENU } from "@/lib/kioskMenu";

export default function InicioPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EF] kiosk-shell">
      <KioskHeader backHref="/" title="Escolha uma opção" variant="cream" />

      <section className="px-4 py-5 max-w-2xl mx-auto fade-in">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl text-burgundy-deep">O que você procura?</h1>
          <p className="text-burgundy/50 text-sm mt-1">Toque em uma categoria</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {KIOSK_MENU.map((item) => (
            <CategoryTile key={item.id} item={item} />
          ))}
        </div>

        <Link
          href="/escolher"
          className="kiosk-tap mt-4 flex items-center justify-center gap-3 min-h-[60px] w-full rounded-2xl bg-gold text-charcoal font-bold text-lg shadow-lg shadow-gold/25 border-2 border-gold-light/50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v3M12 18v3M5 8l2 2M17 16l2 2M3 12h3M18 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          Me ajude a escolher um vinho
        </Link>

        <Link
          href="/filtro"
          className="kiosk-tap mt-3 flex items-center justify-center gap-3 min-h-[52px] w-full rounded-2xl bg-burgundy text-cream font-semibold border border-gold/25"
        >
          <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          Filtro avançado
        </Link>
      </section>
    </main>
  );
}
