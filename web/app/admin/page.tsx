"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./layout";
import { WineImage } from "@/components/WineImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FLAGS: Record<string, string> = {
  Argentina: "🇦🇷", Chile: "🇨🇱", França: "🇫🇷", Franca: "🇫🇷",
  Itália: "🇮🇹", Italia: "🇮🇹", Portugal: "🇵🇹", Espanha: "🇪🇸",
  Brasil: "🇧🇷", Uruguai: "🇺🇾", "Estados Unidos": "🇺🇸",
};

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  tinto:     { bg: "bg-[#5C1A1A]",   text: "text-white",       label: "Tinto" },
  branco:    { bg: "bg-[#F5E6C8]",   text: "text-[#6B5B3E]",   label: "Branco" },
  rose:      { bg: "bg-[#E8A0B4]",   text: "text-[#7A2D4A]",   label: "Rosé" },
  rosé:      { bg: "bg-[#E8A0B4]",   text: "text-[#7A2D4A]",   label: "Rosé" },
  espumante: { bg: "bg-[#D4A843]",   text: "text-white",       label: "Espumante" },
};

const FOOD_OPTIONS = [
  { value: "carne",      label: "Carnes vermelhas",       emoji: "🥩" },
  { value: "frango",     label: "Aves / Frango",           emoji: "🍗" },
  { value: "peixe",      label: "Peixes e frutos do mar",  emoji: "🐟" },
  { value: "massa",      label: "Massas",                  emoji: "🍝" },
  { value: "queijo",     label: "Queijos",                 emoji: "🧀" },
  { value: "entrada",    label: "Entradas e aperitivos",   emoji: "🫒" },
  { value: "sobremesa",  label: "Sobremesas",              emoji: "🍰" },
  { value: "vegetariano",label: "Vegetariano",             emoji: "🥗" },
];

const BADGE_OPTIONS = [
  { value: "presente",       label: "Bom para presente" },
  { value: "jantar",         label: "Ideal para jantar" },
  { value: "custo-beneficio",label: "Custo-benefício" },
  { value: "premiado",       label: "Premiado" },
  { value: "reserva",        label: "Reserva" },
  { value: "organico",       label: "Orgânico" },
];

type Wine = {
  id: number;
  name: string;
  winery: string;
  region: string | null;
  country: string;
  grape_variety: string;
  vintage_year: number | null;
  price_brl: number;
  alcohol_pct: number | null;
  score_average: number;
  stock_available: boolean;
  on_promotion: boolean;
  image_url: string | null;
  category: string;
  sweetness_level: string;
  body: string;
  knowledge_level: string;
  tasting_notes: string | null;
  pairing_suggestions: string | null;
  badges: string[];
  food_pairings: string[];
};

const EMPTY_WINE: Omit<Wine, "id"> = {
  name: "", winery: "", region: "", country: "", grape_variety: "",
  vintage_year: null, price_brl: 0, alcohol_pct: null, score_average: 0,
  stock_available: true, on_promotion: false, image_url: "", category: "tinto",
  sweetness_level: "seco", body: "medio", knowledge_level: "intermediario",
  tasting_notes: "", pairing_suggestions: "", badges: [], food_pairings: [],
};

export default function AdminPage() {
  const { token } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [editWine, setEditWine] = useState<Wine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Wine, "id">>(EMPTY_WINE);
  const [activeTab, setActiveTab] = useState<"basic" | "desc" | "chars">("basic");
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set("q", search);
      if (filterType) params.set("category", filterType);
      params.set("sort", "name");
      const res = await fetch(`${API}/wines?${params}`);
      const data = await res.json();
      setWines(data.items);
      setTotal(data.total);
    } catch { setWines([]); }
    finally { setLoading(false); }
  }, [page, search, filterType]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  function openCreate() {
    setEditWine(null);
    setFormData(EMPTY_WINE);
    setActiveTab("basic");
    setShowForm(true);
  }

  function openEdit(wine: Wine) {
    setEditWine(wine);
    setFormData({ ...wine });
    setActiveTab("basic");
    setShowForm(true);
  }

  async function saveWine() {
    if (!formData.name || !formData.winery || !formData.country || !formData.grape_variety) {
      alert("Preencha os campos obrigatórios: Nome, Vinícola, País e Uva.");
      return;
    }
    setSaving(true);
    try {
      const url = editWine ? `${API}/wines/${editWine.id}` : `${API}/wines`;
      const method = editWine ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, price_brl: Number(formData.price_brl) }),
      });
      if (!res.ok) { alert("Erro ao salvar. Verifique o token admin."); return; }
      setShowForm(false);
      load();
    } catch { alert("Erro de rede."); }
    finally { setSaving(false); }
  }

  async function deleteWine(id: number, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`${API}/wines/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  function toggleChip(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  const getTypeStyle = (cat: string) => TYPE_STYLES[cat.toLowerCase()] || TYPE_STYLES.tinto;

  function getPaginationNumbers() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-burgundy-deep">Produtos</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os vinhos cadastrados no sistema</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={openCreate}
          className="h-11 px-6 rounded-lg bg-burgundy-deep text-cream font-medium text-sm flex items-center gap-2 hover:bg-burgundy transition-colors shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Novo Vinho
        </button>
        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Buscar vinho..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors" />
        </div>
        <div className="relative">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="h-11 pl-4 pr-10 rounded-lg border border-gray-200 bg-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30">
            <option value="">Todos os tipos</option>
            <option value="tinto">Tinto</option>
            <option value="branco">Branco</option>
            <option value="rose">Rosé</option>
            <option value="espumante">Espumante</option>
          </select>
          <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: total, color: "text-burgundy-deep", bg: "bg-burgundy-deep/8" },
          { label: "Tintos", value: wines.filter(w => w.category === "tinto").length || "—", color: "text-red-700", bg: "bg-red-50" },
          { label: "Brancos", value: wines.filter(w => w.category === "branco").length || "—", color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Rosé/Esp.", value: wines.filter(w => ["rose", "espumante"].includes(w.category)).length || "—", color: "text-pink-700", bg: "bg-pink-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vinho</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">País</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                </td></tr>
              ) : wines.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
                    <path d="M12 15.5V22M8 22h8" />
                  </svg>
                  <p>Nenhum vinho encontrado</p>
                </td></tr>
              ) : wines.map((wine) => {
                const ts = getTypeStyle(wine.category);
                return (
                  <tr key={wine.id} className="border-b border-gray-50 hover:bg-cream/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-14 bg-white rounded-lg border border-burgundy/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <WineImage src={wine.image_url} alt={wine.name} category={wine.category} height={48} className="max-h-12 w-auto" />
                        </div>
                        <div>
                          <p className="font-semibold text-burgundy-deep text-sm">{wine.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{wine.winery} · {wine.grape_variety}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ts.bg} ${ts.text}`}>{ts.label}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{FLAGS[wine.country] || ""} {wine.country}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-800">R$ {wine.price_brl.toFixed(2).replace(".", ",")}</span>
                      {wine.on_promotion && <span className="ml-2 text-[10px] text-red-600 font-bold">PROMO</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(wine)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Editar
                        </button>
                        <button onClick={() => deleteWine(wine.id, wine.name)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                          </svg>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Mostrando {startItem}–{endItem} de {total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {getPaginationNumbers().map((p, i) =>
                p === "..." ? <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-burgundy-deep text-cream" : "text-gray-600 hover:bg-gray-100"}`}>
                    {p}
                  </button>
              )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-display text-xl text-burgundy-deep">
                  {editWine ? "Editar Vinho" : "Novo Vinho"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{editWine ? editWine.name : "Preencha os dados do produto"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {(["basic", "desc", "chars"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab ? "border-burgundy-deep text-burgundy-deep" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {tab === "basic" ? "Dados básicos" : tab === "desc" ? "Descrição" : "Características"}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === "basic" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="form-label">Nome do vinho *</label>
                      <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        className="form-input" placeholder="Ex: Alamos Malbec" />
                    </div>
                    <div>
                      <label className="form-label">Vinícola *</label>
                      <input value={formData.winery} onChange={e => setFormData(f => ({ ...f, winery: e.target.value }))}
                        className="form-input" placeholder="Ex: Bodega Catena Zapata" />
                    </div>
                    <div>
                      <label className="form-label">Região</label>
                      <input value={formData.region ?? ""} onChange={e => setFormData(f => ({ ...f, region: e.target.value }))}
                        className="form-input" placeholder="Ex: Mendoza" />
                    </div>
                    <div>
                      <label className="form-label">País *</label>
                      <select value={formData.country} onChange={e => setFormData(f => ({ ...f, country: e.target.value }))} className="form-input">
                        <option value="">Selecione...</option>
                        {["Argentina","Chile","França","Itália","Portugal","Espanha","Brasil","Uruguai","Estados Unidos","Austrália"].map(c => (
                          <option key={c} value={c}>{FLAGS[c] || ""} {c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Uva *</label>
                      <input value={formData.grape_variety} onChange={e => setFormData(f => ({ ...f, grape_variety: e.target.value }))}
                        className="form-input" placeholder="Ex: Malbec" />
                    </div>
                    <div>
                      <label className="form-label">Categoria</label>
                      <div className="grid grid-cols-4 gap-1.5 mt-1">
                        {["tinto","branco","rose","espumante"].map(cat => (
                          <button key={cat} type="button" onClick={() => setFormData(f => ({ ...f, category: cat }))}
                            className={`py-2 rounded-lg text-xs font-medium border-2 transition-all ${formData.category === cat ? "border-burgundy-deep bg-burgundy-deep/8 text-burgundy-deep" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                            {TYPE_STYLES[cat]?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Safra</label>
                      <input type="number" value={formData.vintage_year ?? ""} onChange={e => setFormData(f => ({ ...f, vintage_year: e.target.value ? Number(e.target.value) : null }))}
                        className="form-input" placeholder="2021" min="1900" max="2030" />
                    </div>
                    <div>
                      <label className="form-label">Preço (R$) *</label>
                      <input type="number" step="0.01" value={formData.price_brl} onChange={e => setFormData(f => ({ ...f, price_brl: Number(e.target.value) }))}
                        className="form-input" placeholder="129.90" min="0" />
                    </div>
                    <div>
                      <label className="form-label">Teor alcoólico (%)</label>
                      <input type="number" step="0.1" value={formData.alcohol_pct ?? ""} onChange={e => setFormData(f => ({ ...f, alcohol_pct: e.target.value ? Number(e.target.value) : null }))}
                        className="form-input" placeholder="13.5" min="0" max="25" />
                    </div>
                    <div>
                      <label className="form-label">Nota (0–5)</label>
                      <input type="number" step="0.1" value={formData.score_average} onChange={e => setFormData(f => ({ ...f, score_average: Number(e.target.value) }))}
                        className="form-input" placeholder="4.4" min="0" max="5" />
                    </div>
                    <div>
                      <label className="form-label">URL da imagem</label>
                      <input value={formData.image_url ?? ""} onChange={e => setFormData(f => ({ ...f, image_url: e.target.value }))}
                        className="form-input" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <Toggle label="Disponível em estoque" checked={formData.stock_available}
                      onChange={v => setFormData(f => ({ ...f, stock_available: v }))} />
                    <Toggle label="Em promoção" checked={formData.on_promotion}
                      onChange={v => setFormData(f => ({ ...f, on_promotion: v }))} />
                  </div>
                </>
              )}

              {activeTab === "desc" && (
                <>
                  <div>
                    <label className="form-label">Notas de degustação</label>
                    <textarea value={formData.tasting_notes ?? ""} onChange={e => setFormData(f => ({ ...f, tasting_notes: e.target.value }))}
                      className="form-input resize-none" rows={4} placeholder="Descreva os aromas, sabores e finalização do vinho..." />
                  </div>
                  <div>
                    <label className="form-label">Sugestões de harmonização (texto livre)</label>
                    <textarea value={formData.pairing_suggestions ?? ""} onChange={e => setFormData(f => ({ ...f, pairing_suggestions: e.target.value }))}
                      className="form-input resize-none" rows={3} placeholder="Ex: Ideal com carnes vermelhas, queijos curados..." />
                  </div>
                </>
              )}

              {activeTab === "chars" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Corpo</label>
                      <select value={formData.body} onChange={e => setFormData(f => ({ ...f, body: e.target.value }))} className="form-input">
                        <option value="leve">Leve</option>
                        <option value="medio">Médio</option>
                        <option value="encorpado">Encorpado</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Doçura</label>
                      <select value={formData.sweetness_level} onChange={e => setFormData(f => ({ ...f, sweetness_level: e.target.value }))} className="form-input">
                        <option value="seco">Seco</option>
                        <option value="meio-seco">Meio-seco</option>
                        <option value="meio-doce">Meio-doce</option>
                        <option value="doce">Doce</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Nível de conhecimento</label>
                      <select value={formData.knowledge_level} onChange={e => setFormData(f => ({ ...f, knowledge_level: e.target.value }))} className="form-input">
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Harmonização (selecione as opções)</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {FOOD_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => setFormData(f => ({ ...f, food_pairings: toggleChip(f.food_pairings, opt.value) }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-all ${formData.food_pairings.includes(opt.value) ? "border-gold bg-gold/15 text-burgundy-deep font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Destaques / Badges</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {BADGE_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => setFormData(f => ({ ...f, badges: toggleChip(f.badges, opt.value) }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-all ${formData.badges.includes(opt.value) ? "border-burgundy-deep bg-burgundy-deep/8 text-burgundy-deep font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors">
                Cancelar
              </button>
              <div className="flex items-center gap-3">
                {activeTab !== "basic" && (
                  <button onClick={() => setActiveTab(activeTab === "chars" ? "desc" : "basic")}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors">
                    Anterior
                  </button>
                )}
                {activeTab !== "chars" ? (
                  <button onClick={() => setActiveTab(activeTab === "basic" ? "desc" : "chars")}
                    className="px-5 py-2.5 rounded-lg bg-burgundy-deep text-cream text-sm font-medium hover:bg-burgundy transition-colors">
                    Próximo
                  </button>
                ) : (
                  <button onClick={saveWine} disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-burgundy-deep text-cream text-sm font-semibold hover:bg-burgundy transition-colors disabled:opacity-50 flex items-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />}
                    {editWine ? "Salvar alterações" : "Criar vinho"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .form-label { @apply block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5; }
        .form-input { @apply w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors; }
      `}</style>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all ${checked ? "bg-burgundy-deep" : "bg-gray-200"} relative flex-shrink-0 cursor-pointer`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
