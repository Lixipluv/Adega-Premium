"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { KioskHeader } from "@/components/KioskHeader";
import { WineCardKiosk } from "@/components/WineCardKiosk";
import type { Wine } from "@/lib/api";
import { answersToFilters, relaxedFilterVariants, filtersToQueryString } from "@/lib/recommendationQuiz";
import type { QuizAnswers } from "@/lib/recommendationQuiz";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type QuizOption = { value: string | null; label: string; emoji: string };
type QuizStep = { step_id: string; title: string; subtitle: string; options: QuizOption[] };

const DEFAULT_STEPS: QuizStep[] = [
  {
    step_id: "food",
    title: "Vai beber com comida?",
    subtitle: "Escolha o tipo de prato ou beber só o vinho",
    options: [
      { value: "carne", label: "Carnes vermelhas", emoji: "🥩" },
      { value: "massa", label: "Massas", emoji: "🍝" },
      { value: "peixe", label: "Peixes e frutos do mar", emoji: "🐟" },
      { value: "queijo", label: "Queijos e entradas", emoji: "🧀" },
      { value: null, label: "Só o vinho, sem comida", emoji: "🍷" },
    ],
  },
  {
    step_id: "price",
    title: "Qual faixa de preço?",
    subtitle: "Toque na opção que combina com você",
    options: [
      { value: "ate80", label: "Até R$ 80", emoji: "💚" },
      { value: "80-150", label: "R$ 80 – 150", emoji: "💛" },
      { value: "150-300", label: "R$ 150 – 300", emoji: "🧡" },
      { value: "any", label: "Sem limite de preço", emoji: "✨" },
    ],
  },
  {
    step_id: "taste",
    title: "Prefere suave ou seco?",
    subtitle: "Sem problema — te ajudamos a decidir",
    options: [
      { value: "seco", label: "Seco — pouca doçura", emoji: "🍂" },
      { value: "suave", label: "Suave — mais leve", emoji: "🌸" },
      { value: "unsure", label: "Não sei, me surpreenda", emoji: "✨" },
    ],
  },
  {
    step_id: "occasion",
    title: "É para presente ou consumo?",
    subtitle: "Última pergunta",
    options: [
      { value: "consumo", label: "Consumo próprio", emoji: "🏠" },
      { value: "presente", label: "Presente especial", emoji: "🎁" },
      { value: "jantar", label: "Jantar especial", emoji: "🕯️" },
    ],
  },
];

const DEFAULT_ANSWERS: QuizAnswers = {
  food: null, priceRange: "any", taste: "unsure", occasion: "consumo",
};

function stepsToAnswers(steps: QuizStep[], values: Record<string, string | null>): QuizAnswers {
  const get = (id: string, fallback: string | null) => id in values ? values[id] : fallback;
  return {
    food: get("food", null) as string | null,
    priceRange: (get("price", "any") || "any") as QuizAnswers["priceRange"],
    taste: (get("taste", "unsure") || "unsure") as QuizAnswers["taste"],
    occasion: (get("occasion", "consumo") || "consumo") as QuizAnswers["occasion"],
  };
}

export default function EscolherPage() {
  const [steps, setSteps] = useState<QuizStep[]>(DEFAULT_STEPS);
  const [step, setStep] = useState(-1);
  const [values, setValues] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [results, setResults] = useState<Wine[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`${API}/quiz/config`)
      .then(r => r.json())
      .then((data: QuizStep[]) => {
        if (Array.isArray(data) && data.length > 0) setSteps(data);
      })
      .catch(() => {})
      .finally(() => setConfigLoading(false));
  }, []);

  const totalSteps = steps.length;
  const progress = done ? 100 : step < 0 ? 0 : ((step + 1) / totalSteps) * 100;

  async function fetchRecommendations(answers: QuizAnswers) {
    setLoading(true);
    const variants = relaxedFilterVariants(answersToFilters(answers));
    for (const filters of variants) {
      const qs = filtersToQueryString(filters);
      try {
        const res = await fetch(`${API}/wines?${qs}`);
        if (!res.ok) continue;
        const data = await res.json();
        const items: Wine[] = data.items || [];
        if (items.length >= 1) {
          setResults(items.slice(0, 3));
          setDone(true);
          setLoading(false);
          return;
        }
      } catch { /* continue */ }
    }
    try {
      const fallback = await fetch(`${API}/wines?page_size=3&sort=score`);
      const data = await fallback.json();
      setResults((data.items || []).slice(0, 3));
    } catch { setResults([]); }
    setDone(true);
    setLoading(false);
  }

  function next() {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      const answers = stepsToAnswers(steps, values);
      fetchRecommendations(answers);
    }
  }

  function back() {
    if (done) { setDone(false); setResults([]); setStep(totalSteps - 1); return; }
    if (step <= 0) setStep(-1);
    else setStep(s => s - 1);
  }

  function restart() {
    setDone(false); setStep(-1); setResults([]); setValues({});
  }

  if (configLoading) {
    return (
      <main className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal kiosk-shell text-cream">
      <KioskHeader backHref="/inicio" title="Escolher vinho" variant="dark" />

      <div className="h-1 bg-white/10">
        <div className="h-full bg-gold transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <section className="px-4 py-6 max-w-lg mx-auto min-h-[70vh] flex flex-col">
        {done ? (
          <ResultsView wines={results} onRestart={restart} />
        ) : step === -1 ? (
          <IntroView onStart={() => setStep(0)} stepCount={totalSteps} />
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-cream/70 text-center">Selecionando os melhores para você...</p>
          </div>
        ) : (
          <QuestionView
            step={steps[step]}
            stepIndex={step}
            totalSteps={totalSteps}
            selectedValue={values[steps[step]?.step_id] ?? undefined}
            onSelect={(val) => setValues(v => ({ ...v, [steps[step].step_id]: val }))}
            onNext={next}
            onBack={back}
            isLast={step === totalSteps - 1}
          />
        )}
      </section>
    </main>
  );
}

function IntroView({ onStart, stepCount }: { onStart: () => void; stepCount: number }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center fade-in px-2">
      <div className="w-24 h-24 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center mb-8">
        <svg className="w-12 h-12 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
          <path d="M12 15.5V22M8 22h8" />
        </svg>
      </div>
      <h1 className="font-display text-3xl text-gold">Me ajude a escolher</h1>
      <p className="text-cream/60 mt-4 text-base max-w-xs leading-relaxed">
        Responda {stepCount} perguntas rápidas e encontramos os vinhos ideais para você.
      </p>
      <div className="flex items-center gap-4 mt-8 text-cream/40 text-sm">
        {Array.from({ length: stepCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gold/40" />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="kiosk-tap mt-8 w-full max-w-xs min-h-[60px] rounded-2xl bg-gold text-charcoal font-bold text-lg shadow-lg shadow-gold/20 active:scale-[0.97] transition-all"
      >
        Começar
      </button>
    </div>
  );
}

function QuestionView({
  step, stepIndex, totalSteps, selectedValue, onSelect, onNext, onBack, isLast,
}: {
  step: QuizStep;
  stepIndex: number;
  totalSteps: number;
  selectedValue?: string | null;
  onSelect: (val: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="mb-6">
        <p className="text-gold/70 text-xs font-semibold uppercase tracking-widest mb-2">
          Pergunta {stepIndex + 1} de {totalSteps}
        </p>
        <h2 className="font-display text-2xl text-cream leading-snug">{step.title}</h2>
        {step.subtitle && <p className="text-cream/50 text-sm mt-2">{step.subtitle}</p>}
      </div>

      <div className="flex-1 space-y-2.5">
        {step.options.map((opt, i) => {
          const selected = selectedValue !== undefined
            ? selectedValue === opt.value
            : false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`kiosk-tap w-full min-h-[60px] px-5 rounded-2xl text-left font-medium text-base transition-all border-2 flex items-center gap-4 active:scale-[0.98] ${
                selected
                  ? "border-gold bg-gold/15 text-gold shadow-lg shadow-gold/10"
                  : "border-white/10 bg-white/5 text-cream hover:border-gold/40 hover:bg-white/8"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
              <span>{opt.label}</span>
              {selected && (
                <svg className="w-5 h-5 text-gold ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6 pt-4">
        <button type="button" onClick={onBack}
          className="kiosk-tap flex-1 min-h-[52px] rounded-xl border border-white/20 text-cream/80 font-medium active:scale-[0.97] transition-all hover:border-white/40">
          ← Voltar
        </button>
        <button type="button" onClick={onNext}
          className="kiosk-tap flex-[2] min-h-[52px] rounded-xl bg-gold text-charcoal font-bold active:scale-[0.97] transition-all shadow-lg shadow-gold/20">
          {isLast ? "Ver recomendações →" : "Próxima →"}
        </button>
      </div>
    </div>
  );
}

function ResultsView({ wines, onRestart }: { wines: Wine[]; onRestart: () => void }) {
  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-gold">Nossa seleção para você</h2>
        <p className="text-cream/50 text-sm mt-2">
          {wines.length > 0 ? `${wines.length} vinho${wines.length > 1 ? "s" : ""} selecionado${wines.length > 1 ? "s" : ""} com base nas suas respostas` : "Nenhum resultado encontrado"}
        </p>
      </div>

      {wines.length === 0 ? (
        <p className="text-center text-cream/50 py-12">Tente refazer o questionário com outras preferências.</p>
      ) : (
        <div className="space-y-4">
          {wines.map((w, i) => (
            <div key={w.id} className="relative">
              <div className={`absolute -top-2.5 -left-1 z-10 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shadow-lg ${i === 0 ? "bg-gold text-charcoal" : "bg-white/20 text-cream"}`}>
                {i + 1}
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <WineCardKiosk wine={w} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8">
        <Link href="/inicio"
          className="kiosk-tap min-h-[54px] flex items-center justify-center rounded-xl bg-gold text-charcoal font-bold text-base shadow-lg shadow-gold/20">
          Voltar ao menu
        </Link>
        <button type="button" onClick={onRestart}
          className="kiosk-tap min-h-[48px] rounded-xl border border-white/20 text-cream/80 font-medium hover:border-white/40 transition-all">
          Refazer questionário
        </button>
      </div>
    </div>
  );
}
