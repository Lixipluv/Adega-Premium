"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../layout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type QuizOption = {
  value: string | null;
  label: string;
  emoji: string;
};

type QuizStep = {
  step_id: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
};

const STEP_LABELS: Record<string, string> = {
  food: "Harmonização com comida",
  price: "Faixa de preço",
  taste: "Perfil de sabor",
  occasion: "Ocasião",
};

export default function QuizPage() {
  const { token } = useAuth();
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>("food");

  useEffect(() => {
    fetch(`${API}/quiz/config`)
      .then(r => r.json())
      .then(data => { setSteps(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/quiz/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(steps),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Erro ao salvar. Verifique o token admin.");
      }
    } finally {
      setSaving(false);
    }
  }

  function updateStep(stepId: string, field: "title" | "subtitle", value: string) {
    setSteps(prev => prev.map(s => s.step_id === stepId ? { ...s, [field]: value } : s));
  }

  function updateOption(stepId: string, optIdx: number, field: "label" | "emoji", value: string) {
    setSteps(prev => prev.map(s => s.step_id === stepId ? {
      ...s,
      options: s.options.map((o, i) => i === optIdx ? { ...o, [field]: value } : o),
    } : s));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Carregando questionário...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-burgundy-deep">Questionário de Recomendação</h1>
          <p className="text-gray-500 text-sm mt-1">
            Personalize as perguntas e opções exibidas no totem de escolha de vinhos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Salvo!
            </span>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-burgundy-deep text-cream text-sm font-semibold hover:bg-burgundy transition-colors disabled:opacity-50">
            {saving && <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">Como funciona</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Você pode editar os textos das perguntas e opções. Os valores internos (que filtram os vinhos) são fixos e garantem resultados precisos. Apenas emojis e rótulos são personalizáveis.
          </p>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
            <path d="M12 15.5V22M8 22h8" />
          </svg>
          <p className="font-medium">Nenhuma configuração encontrada</p>
          <p className="text-sm mt-1">O banco de dados pode estar sem dados de quiz. Execute a migração.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, stepIdx) => {
            const isOpen = expandedStep === step.step_id;
            return (
              <div key={step.step_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Step Header */}
                <button
                  onClick={() => setExpandedStep(isOpen ? null : step.step_id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-burgundy-deep/8 text-burgundy-deep flex items-center justify-center text-sm font-bold">
                      {stepIdx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-burgundy-deep">{step.title}</p>
                      <p className="text-xs text-gray-400">{STEP_LABELS[step.step_id] || step.step_id} · {step.options.length} opções</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {/* Question fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 mb-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Título da pergunta
                        </label>
                        <input
                          value={step.title}
                          onChange={e => updateStep(step.step_id, "title", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors"
                          placeholder="Título da pergunta..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Subtítulo / instrução
                        </label>
                        <input
                          value={step.subtitle}
                          onChange={e => updateStep(step.step_id, "subtitle", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors"
                          placeholder="Instrução adicional..."
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Opções de resposta
                    </p>
                    <div className="space-y-3">
                      {step.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          {/* Emoji */}
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Emoji</p>
                            <input
                              value={opt.emoji}
                              onChange={e => updateOption(step.step_id, optIdx, "emoji", e.target.value)}
                              className="w-14 text-center px-2 py-2 rounded-lg border border-gray-200 text-lg bg-white focus:outline-none focus:border-gold/60 transition-colors"
                            />
                          </div>

                          {/* Label */}
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Rótulo visível ao cliente</p>
                            <input
                              value={opt.label}
                              onChange={e => updateOption(step.step_id, optIdx, "label", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors"
                              placeholder="Rótulo da opção..."
                            />
                          </div>

                          {/* Value (read-only) */}
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Valor interno</p>
                            <span className="flex items-center h-9 px-3 rounded-lg bg-gray-100 text-xs text-gray-500 font-mono border border-gray-200">
                              {opt.value ?? "null"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preview */}
                    <div className="mt-5 p-4 bg-[#1A1A1A] rounded-xl">
                      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Pré-visualização no totem</p>
                      <p className="text-cream/60 text-xs mb-1">{step.subtitle}</p>
                      <p className="text-cream font-display text-lg mb-3">{step.title}</p>
                      <div className="space-y-2">
                        {step.options.slice(0, 3).map((opt, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-white/10 bg-white/5">
                            <span className="text-lg">{opt.emoji}</span>
                            <span className="text-cream text-sm">{opt.label}</span>
                          </div>
                        ))}
                        {step.options.length > 3 && (
                          <p className="text-center text-gray-500 text-xs">+ {step.options.length - 3} opções</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Save floating button on mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-burgundy-deep text-cream text-sm font-semibold shadow-2xl hover:bg-burgundy transition-colors disabled:opacity-50">
          {saving && <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />}
          Salvar
        </button>
      </div>
    </div>
  );
}
