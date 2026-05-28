import Link from "next/link";

export function Header() {
  return (
    <header className="bg-burgundy-deep text-cream py-5">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Adega Premium — Início">
          <span className="text-3xl text-gold" aria-hidden>🍷</span>
          <div>
            <div className="font-display text-2xl tracking-[0.3em] text-gold">ADEGA</div>
            <div className="font-display text-xs tracking-[0.5em] text-cream/80">PREMIUM</div>
          </div>
        </Link>
        <Link
          href="/search"
          className="min-h-[48px] inline-flex items-center gap-2 rounded-full bg-cream/10 border border-gold/40 px-5 text-cream"
          aria-label="Buscar vinhos"
        >
          <span aria-hidden>🔍</span> Buscar
        </Link>
      </div>
    </header>
  );
}
