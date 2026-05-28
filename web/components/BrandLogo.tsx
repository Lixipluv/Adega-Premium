type Props = { size?: "sm" | "md" | "lg"; light?: boolean };

export function BrandLogo({ size = "md", light = true }: Props) {
  const title =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-4xl";
  const sub = size === "lg" ? "text-lg" : size === "sm" ? "text-[10px]" : "text-sm";

  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <div
          className={`rounded-full border flex items-center justify-center ${
            light ? "border-gold/40 bg-gold/10" : "border-burgundy/20 bg-burgundy/5"
          } ${size === "lg" ? "w-16 h-16" : size === "sm" ? "w-10 h-10" : "w-14 h-14"}`}
        >
          <svg
            className={`${size === "lg" ? "w-9 h-9" : size === "sm" ? "w-5 h-5" : "w-8 h-8"} ${light ? "text-gold" : "text-burgundy"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
            <path d="M12 15.5V22M8 22h8" />
          </svg>
        </div>
      </div>
      <p className={`font-display tracking-[0.2em] ${title} ${light ? "text-cream" : "text-burgundy-deep"}`}>
        ADEGA
      </p>
      <p className={`font-display tracking-[0.5em] ${sub} ${light ? "text-gold" : "text-burgundy/70"}`}>
        PREMIUM
      </p>
    </div>
  );
}
