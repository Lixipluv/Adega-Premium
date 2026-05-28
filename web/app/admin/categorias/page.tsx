"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../layout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CategoryStats = {
  slug: string;
  label: string;
  color: string;
  bgColor: string;
  count: number;
};

const CATEGORY_META: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  tinto: { label: "Tintos", color: "text-red-800", bgColor: "bg-red-50", icon: "🍷" },
  branco: { label: "Brancos", color: "text-amber-800", bgColor: "bg-amber-50", icon: "🥂" },
  rose: { label: "Rosé", color: "text-pink-800", bgColor: "bg-pink-50", icon: "🌸" },
  espumante: { label: "Espumantes", color: "text-yellow-800", bgColor: "bg-yellow-50", icon: "🍾" },
};

export default function CategoriasAdminPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const promises = Object.entries(CATEGORY_META).map(async ([slug, meta]) => {
        const res = await fetch(`${API}/wines?category=${slug}&page_size=1`);
        const data = await res.json();
        return {
          slug,
          label: meta.label,
          color: meta.color,
          bgColor: meta.bgColor,
          count: data.total || 0,
        };
      });
      const results = await Promise.all(promises);
      setCategories(results);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const totalWines = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-burgundy-deep">Categorias</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie as categorias de vinhos do catálogo</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Total de categorias ativas</p>
            <p className="text-3xl font-bold text-burgundy-deep">{categories.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de vinhos</p>
            <p className="text-3xl font-bold text-burgundy-deep">{totalWines}</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 px-5 rounded-lg bg-burgundy-deep text-cream text-sm font-medium flex items-center gap-2 hover:bg-burgundy transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Nova Categoria
          </button>
        </div>

        {showAddForm && (
          <div className="border-t border-gray-100 pt-5 mt-5">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome da categoria</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z]/g, "") })}
                  placeholder="Ex: Vinhos do Porto"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="slug"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <button className="h-10 px-5 rounded-lg bg-gold text-burgundy-deep text-sm font-semibold hover:bg-gold-light transition-colors">
                Salvar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <div
                key={cat.slug}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${cat.bgColor} flex items-center justify-center text-2xl`}>
                      {meta?.icon || "🍷"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-burgundy-deep text-lg">{cat.label}</h3>
                      <p className="text-sm text-gray-500">Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{cat.slug}</code></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-bold text-burgundy-deep">{cat.count}</p>
                      <p className="text-xs text-gray-500">vinhos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-burgundy-deep">
                        {totalWines > 0 ? Math.round((cat.count / totalWines) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-500">do catálogo</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cat.bgColor} ${cat.color}`}>
                    Ativa
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-burgundy rounded-full transition-all duration-500"
                    style={{ width: `${totalWines > 0 ? (cat.count / totalWines) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
