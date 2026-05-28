"use client";
import { useState } from "react";
import Link from "next/link";
import { KioskHeader } from "@/components/KioskHeader";
import { WineCardKiosk } from "@/components/WineCardKiosk";
import type { Wine } from "@/lib/api";
import {
  QUIZ_STEPS,
  type QuizAnswers,
  answersToFilters,
  relaxedFilterVariants,
  filtersToQueryString,
  type PriceRange,
  type TastePref,
  type OccasionPref,
} from "@/lib/recommendationQuiz";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_ANSWERS: QuizAnswers = {
  food: null,
  priceRange: "any",
  taste: "unsure",
  occasion: "consumo",
};

export default function EscolherPage() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Wine[]>([]);
  const [done, setDone] = useState(false);

  async function fetchRecommendations(a: QuizAnswers) {
    setLoading(true);
    const variants = relaxedFilterVariants(answersToFilters(a));
    for (const filters of variants) {
      const qs = filtersToQueryString(filters);
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
    }
    const fallback = await fetch(`${API}/wines?page_size=3&sort=score`);
    const data = await fallback.json();
    setResults((data.items || []).slice(0, 3));
    setDone(true);
    setLoading(false);
  }

  function next() {
    if (step < QUIZ_STEPS.length - 1) setStep(step + 1);
    else fetchRecommendations(answers);
  }

  function back() {
    if (done) {
      setDone(false);
      setResults([]);
      setStep(QUIZ_STEPS.length - 1);
      return;
    }
    if (step <= 0) setStep(-1);
    else setStep(step - 1);
  }

  const progress = done ? 100 : step < 0 ? 0 : ((step + 1) / QUIZ_STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-charcoal kiosk-shell text-cream">
      <KioskHeader backHref="/inicio" title="Escolher vinho" variant="dark" />

      <div className="h-1 bg-white/10">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <section className="px-4 py-6 max-w-lg mx-auto min-h-[70vh] flex flex-col">
        {done ? (
          <ResultsView wines={results} onRestart={() => { setDone(false); setStep(-1); setResults([]); setAnswers(DEFAULT_ANSWERS); }} />
        ) : step === -1 ? (
          <IntroView onStart={() => setStep(0)} />
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-cream/70">Selecionando os melhores para você...</p>
          </div>
        ) : (
          <QuestionView
            stepIndex={step}
            answers={answers}
            setAnswers={setAnswers}
            onNext={next}
            onBack={back}
            isLast={step === QUIZ_STEPS.length - 1}
          />
        )}
      </section>
    </main>
  );
}

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center fade-in px-2">
      <div className="w-20 h-20 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
          <path d="M12 15.5V22M8 22h8" />
        </svg>
      </div>
      <h1 className="font-display text-3xl text-gold">Me ajude a escolher</h1>
      <p className="text-cream/60 mt-3 text-base max-w-xs">
        Responda 4 perguntas rápidas e mostramos 3 vinhos ideais para você.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="kiosk-tap mt-10 w-full max-w-xs min-h-[60px] rounded-2xl bg-gold text-charcoal font-bold text-lg shadow-lg shadow-gold/20"
      >
        Começar
      </button>
    </div>
  );
}

function QuestionView({
  stepIndex,
  answers,
  setAnswers,
  onNext,
  onBack,
  isLast,
}: {
  stepIndex: number;
  answers: QuizAnswers;
  setAnswers: (a: QuizAnswers) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}) {
  const meta = QUIZ_STEPS[stepIndex];

  return (
    <div className="flex-1 flex flex-col fade-in">
      <p className="text-gold/80 text-xs font-semibold uppercase tracking-widest mb-1">
        Pergunta {stepIndex + 1} de {QUIZ_STEPS.length}
      </p>
      <h2 className="font-display text-2xl text-cream">{meta.title}</h2>
      <p className="text-cream/50 text-sm mt-1 mb-6">{meta.subtitle}</p>

      <div className="flex-1 space-y-3">
        {stepIndex === 0 && (
          <>
            <Option label="🥩 Carnes" selected={answers.food === "carne"} onClick={() => setAnswers({ ...answers, food: "carne" })} />
            <Option label="🍝 Massas" selected={answers.food === "massa"} onClick={() => setAnswers({ ...answers, food: "massa" })} />
            <Option label="🐟 Peixes / frutos do mar" selected={answers.food === "peixe"} onClick={() => setAnswers({ ...answers, food: "peixe" })} />
            <Option label="🧀 Queijos / entradas" selected={answers.food === "queijo"} onClick={() => setAnswers({ ...answers, food: "queijo" })} />
            <Option label="Só o vinho, sem comida" selected={answers.food === null} onClick={() => setAnswers({ ...answers, food: null })} />
          </>
        )}
        {stepIndex === 1 && (
          <>
            {(
              [
                ["ate80", "Até R$ 80"],
                ["80-150", "R$ 80 – 150"],
                ["150-300", "R$ 150 – 300"],
                ["any", "Sem limite de preço"],
              ] as [PriceRange, string][]
            ).map(([v, label]) => (
              <Option
                key={v}
                label={label}
                selected={answers.priceRange === v}
                onClick={() => setAnswers({ ...answers, priceRange: v })}
              />
            ))}
          </>
        )}
        {stepIndex === 2 && (
          <>
            {(
              [
                ["seco", "Seco — pouca doçura"],
                ["suave", "Suave — mais leve"],
                ["unsure", "Não sei / tanto faz"],
              ] as [TastePref, string][]
            ).map(([v, label]) => (
              <Option
                key={v}
                label={label}
                selected={answers.taste === v}
                onClick={() => setAnswers({ ...answers, taste: v })}
              />
            ))}
          </>
        )}
        {stepIndex === 3 && (
          <>
            {(
              [
                ["consumo", "Consumo próprio"],
                ["presente", "Presente"],
                ["jantar", "Jantar especial"],
              ] as [OccasionPref, string][]
            ).map(([v, label]) => (
              <Option
                key={v}
                label={label}
                selected={answers.occasion === v}
                onClick={() => setAnswers({ ...answers, occasion: v })}
              />
            ))}
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="kiosk-tap flex-1 min-h-[52px] rounded-xl border border-gold/30 text-cream font-medium"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="kiosk-tap flex-[2] min-h-[52px] rounded-xl bg-gold text-charcoal font-bold"
        >
          {isLast ? "Ver recomendações" : "Próxima"}
        </button>
      </div>
    </div>
  );
}

function Option({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`kiosk-tap w-full min-h-[56px] px-5 rounded-2xl text-left font-medium text-base transition-all border-2 ${
        selected
          ? "border-gold bg-gold/15 text-gold"
          : "border-white/10 bg-white/5 text-cream hover:border-gold/40"
      }`}
    >
      {label}
    </button>
  );
}

function ResultsView({ wines, onRestart }: { wines: Wine[]; onRestart: () => void }) {
  return (
    <div className="fade-in">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-gold">Nossa seleção para você</h2>
        <p className="text-cream/60 text-sm mt-1">3 opções com base nas suas respostas</p>
      </div>

      {wines.length === 0 ? (
        <p className="text-center text-cream/60 py-12">Nenhum vinho encontrado. Tente novamente.</p>
      ) : (
        <div className="space-y-4">
          {wines.map((w, i) => (
            <div key={w.id} className="relative">
              <span className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gold text-charcoal text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="bg-white rounded-2xl overflow-hidden">
                <WineCardKiosk wine={w} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8">
        <Link
          href="/inicio"
          className="kiosk-tap min-h-[52px] flex items-center justify-center rounded-xl bg-gold text-charcoal font-bold"
        >
          Voltar ao menu
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="kiosk-tap min-h-[48px] rounded-xl border border-gold/30 text-cream font-medium"
        >
          Refazer questionário
        </button>
      </div>
    </div>
  );
}
