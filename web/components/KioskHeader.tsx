import Link from "next/link";

type Props = {
  title?: string;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  variant?: "dark" | "cream";
};

export function KioskHeader({
  title,
  backHref = "/",
  backLabel = "Voltar",
  right,
  variant = "dark",
}: Props) {
  const isDark = variant === "dark";

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        isDark
          ? "bg-charcoal/95 border-gold/10"
          : "bg-cream/95 border-burgundy/10"
      }`}
    >
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors ${
            isDark ? "text-cream/80 hover:bg-white/10 hover:text-cream" : "text-burgundy-deep hover:bg-burgundy/5"
          }`}
          aria-label={backLabel}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {title ? (
          <h1
            className={`font-display text-lg tracking-wide truncate flex-1 text-center ${
              isDark ? "text-cream" : "text-burgundy-deep"
            }`}
          >
            {title}
          </h1>
        ) : (
          <Link href="/" className="flex-1 flex justify-center" aria-label="Adega Premium">
            <span
              className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                isDark ? "border-gold/40 bg-gold/10" : "border-burgundy/20 bg-burgundy/5"
              }`}
            >
              <svg className={`w-5 h-5 ${isDark ? "text-gold" : "text-burgundy"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
                <path d="M12 15.5V22M8 22h8" />
              </svg>
            </span>
          </Link>
        )}

        <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
          {right ?? <span className="w-6" />}
        </div>
      </div>
    </header>
  );
}
