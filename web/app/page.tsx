import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import { IMAGES } from "@/lib/media";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden kiosk-shell">
      <Image src={IMAGES.heroHome} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0808]/88 via-[#0a0404]/80 to-[#0a0404]/95" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 fade-in">
        <BrandLogo size="lg" />

        <h2 className="font-display text-4xl sm:text-5xl text-cream text-center leading-tight italic mt-10">
          Bem-vindo à
          <br />
          nossa Adega
        </h2>
        <p className="mt-4 text-cream/70 text-center max-w-xs">Toque para explorar o catálogo</p>

        <Link
          href="/inicio"
          className="kiosk-tap mt-12 inline-flex items-center justify-center gap-3 min-h-[64px] min-w-[280px] px-10 rounded-2xl bg-[#5C1A1A] border-2 border-gold/35 text-cream font-bold text-xl tracking-wide shadow-2xl"
        >
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
            <path d="M12 15.5V22M8 22h8" />
          </svg>
          COMEÇAR
        </Link>

        <Link href="/escolher" className="kiosk-tap mt-4 text-gold/80 text-sm font-medium underline underline-offset-4">
          Me ajude a escolher um vinho
        </Link>

        <p className="mt-8 text-cream/30 text-xs">Toque na tela para interagir</p>
      </div>
    </main>
  );
}
