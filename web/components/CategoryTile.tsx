import Link from "next/link";
import Image from "next/image";
import type { MenuItem } from "@/lib/kioskMenu";

export function CategoryTile({ item }: { item: MenuItem }) {
  return (
    <Link
      href={item.href}
      className="kiosk-tap block relative h-[100px] sm:h-[110px] rounded-2xl overflow-hidden shadow-lg active:scale-[0.97] transition-transform"
    >
      <Image src={item.image} alt="" fill className="object-cover" sizes="50vw" />
      <div className={`absolute inset-0 bg-gradient-to-r ${item.accent}`} />
      <div className="relative z-10 h-full flex flex-col justify-center px-4">
        <span className="font-display text-xl text-cream leading-tight">{item.label}</span>
        <span className="text-cream/65 text-xs mt-0.5">{item.subtitle}</span>
        <span className="w-8 h-px bg-gold/50 mt-2" />
      </div>
    </Link>
  );
}
