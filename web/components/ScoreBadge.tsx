type Props = { score: number };

function Glass({ filled }: { filled: number }) {
  // filled: 1 = full, 0.5 = half, 0 = empty
  const fill = filled >= 0.75 ? "#C9A84C" : filled >= 0.25 ? "url(#half)" : "transparent";
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden>
      <defs>
        <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M3 2 H15 C15 8 12 11 9 11 C6 11 3 8 3 2 Z"
        fill={fill}
        stroke="#C9A84C"
        strokeWidth="1.2"
      />
      <line x1="9" y1="11" x2="9" y2="18" stroke="#C9A84C" strokeWidth="1.2" />
      <line x1="5" y1="20" x2="13" y2="20" stroke="#C9A84C" strokeWidth="1.4" />
    </svg>
  );
}

export function ScoreBadge({ score }: Props) {
  const max = 5;
  return (
    <div className="inline-flex items-center gap-1" aria-label={`Nota ${score} de ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const v = score - i;
        return <Glass key={i} filled={v >= 1 ? 1 : v >= 0.5 ? 0.5 : 0} />;
      })}
      <span className="ml-1 text-sm font-semibold text-burgundy">{score.toFixed(1)}</span>
    </div>
  );
}
