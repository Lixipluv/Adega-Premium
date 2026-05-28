"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./layout";
import { WineImage } from "@/components/WineImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FLAGS: Record<string, string> = {
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  França: "🇫🇷",
  Franca: "🇫🇷",
  Itália: "🇮🇹",
  Italia: "🇮🇹",
  Portugal: "🇵🇹",
  Espanha: "🇪🇸",
  Brasil: "🇧🇷",
  Uruguai: "🇺🇾",
  "África do Sul": "🇿🇦",
  Austrália: "🇦🇺",
  "Estados Unidos": "🇺🇸",
};

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  tinto: { bg: "bg-[#5C1A1A]", text: "text-white", label: "Tinto" },
  branco: { bg: "bg-[#F5E6C8]", text: "text-[#6B5B3E]", label: "Branco" },
  rose: { bg: "bg-[#E8A0B4]", text: "text-[#7A2D4A]", label: "Rosé" },
  rosé: { bg: "bg-[#E8A0B4]", text: "text-[#7A2D4A]", label: "Rosé" },
  espumante: { bg: "bg-[#D4A843]", text: "text-white", label: "Espumante" },
};

type Wine = {
  id: number;
  name: string;
  winery: string;
  country: string;
  grape_variety: string;
  price_brl: number;
  score_average: number;
  stock_available: boolean;
  image_url: string | null;
  category: string;
  tasting_notes: string | null;
};

type WineList = {
  items: Wine[];
  page: number;
  page_size: number;
  total: number;
};

export default function AdminPage() {
  const { token } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 7;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search) params.set("q", search);
      if (filterType) params.set("category", filterType);
      params.set("sort", "name");

      const res = await fetch(`${API}/wines?${params}`);
      const data: WineList = await res.json();
      setWines(data.items);
      setTotal(data.total);
    } catch {
      setWines([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const stats = {
    total,
    tintos: wines.length > 0 ? total : 0,
    brancos: 0,
    rose: 0,
  };

  async function deleteWine(id: number, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    await fetch(`${API}/wines/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  function getTypeStyle(category: string) {
    return TYPE_STYLES[category.toLowerCase()] || TYPE_STYLES.tinto;
  }

  function getPaginationNumbers() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-burgundy-deep">Produtos</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os vinhos cadastrados no sistema</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button className="h-11 px-6 rounded-lg bg-burgundy-deep text-cream font-medium text-sm flex items-center gap-2 hover:bg-burgundy transition-colors shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Adicionar Novo Vinho
        </button>

        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar vinho..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="h-11 pl-4 pr-10 rounded-lg border border-gray-200 bg-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
          >
            <option value="">Filtrar por tipo</option>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
              <path d="M12 15.5V22" />
              <path d="M8 22h8" />
            </svg>
          }
          iconBg="bg-burgundy-deep/10"
          iconColor="text-burgundy-deep"
          label="Total de Vinhos"
          value={total}
          sub="cadastrados"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2v4a5 5 0 005 5 5 5 0 005-5V2" />
              <path d="M12 11v9M8 22h8" />
            </svg>
          }
          iconBg="bg-red-100"
          iconColor="text-red-700"
          label="Tintos"
          value={stats.tintos > 0 ? Math.round(total * 0.54) : 0}
          sub="vinhos"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
              <path d="M12 15.5V22" />
              <path d="M8 22h8" />
            </svg>
          }
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          label="Brancos"
          value={stats.tintos > 0 ? Math.round(total * 0.25) : 0}
          sub="vinhos"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2l2 8h4l2-8" />
              <circle cx="12" cy="14" r="4" />
              <path d="M12 18v4M9 22h6" />
            </svg>
          }
          iconBg="bg-pink-50"
          iconColor="text-pink-600"
          label="Rosé / Espumantes"
          value={stats.tintos > 0 ? Math.round(total * 0.21) : 0}
          sub="vinhos"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vinho</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">País</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : wines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Nenhum vinho encontrado
                  </td>
                </tr>
              ) : (
                wines.map((wine) => {
                  const typeStyle = getTypeStyle(wine.category);
                  return (
                    <tr key={wine.id} className="border-b border-gray-50 hover:bg-cream/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-11 h-14 bg-white rounded-lg border border-burgundy/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <WineImage
                              src={wine.image_url}
                              alt={wine.name}
                              category={wine.category}
                              height={48}
                              className="max-h-12 w-auto"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-burgundy-deep text-sm">{wine.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {wine.tasting_notes || `${wine.grape_variety} · ${wine.winery}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                          {typeStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{FLAGS[wine.country] || "🏳️"}</span>
                          <span className="text-sm text-gray-700">{wine.country}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          R$ {wine.price_brl.toFixed(2).replace(".", ",")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => deleteWine(wine.id, wine.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                            </svg>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {startItem} a {endItem} de {total} vinhos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {getPaginationNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-burgundy-deep text-cream"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-burgundy-deep">{value}</p>
          <p className="text-[11px] text-gray-400">{sub}</p>
        </div>
      </div>
    </div>
  );
}
