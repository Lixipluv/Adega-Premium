"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORY_COLORS: Record<string, string> = {
  tinto: "#5C1A1A", branco: "#C9A84C", rose: "#C06080", espumante: "#2d2d2d",
};
const CATEGORY_LABELS: Record<string, string> = {
  tinto: "Tinto", branco: "Branco", rose: "Rosé", espumante: "Espumante",
};

type TopWine = {
  id: number;
  name: string;
  views: number;
  country: string;
  category: string;
  price_brl?: number;
};

type Summary = {
  total_wines: number;
  total_events_30d: number;
  by_category: { category: string; count: number }[];
  by_event_type: { event_type: string; count: number }[];
  top_today: { id: number; name: string; category: string; views: number }[];
};

export default function RelatoriosPage() {
  const [topWines, setTopWines] = useState<TopWine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/analytics/top`).then(r => r.json()).catch(() => []),
      fetch(`${API}/analytics/summary`).then(r => r.json()).catch(() => null),
    ]).then(([top, sum]) => {
      setTopWines(top || []);
      setSummary(sum);
      setLoading(false);
    });
  }, []);

  const categoryData = summary?.by_category?.map(c => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    value: c.count,
    color: CATEGORY_COLORS[c.category] || "#9ca3af",
  })) ?? [
    { name: "Tintos", value: 54, color: "#5C1A1A" },
    { name: "Brancos", value: 25, color: "#C9A84C" },
    { name: "Rosé", value: 12, color: "#E8A0B4" },
    { name: "Espumantes", value: 9, color: "#2d2d2d" },
  ];

  const monthlyData = [
    { month: "Jan", visitas: 1200 },
    { month: "Fev", visitas: 1400 },
    { month: "Mar", visitas: 1100 },
    { month: "Abr", visitas: 1800 },
    { month: "Mai", visitas: 2200 },
    { month: "Jun", visitas: 1900 },
  ];

  const totalViews = summary?.total_events_30d ?? topWines.reduce((s, w) => s + (w.views || 0), 0);
  const qrScans = summary?.by_event_type?.find(e => e.event_type === "qr_scan")?.count ?? 0;
  const detailOpens = summary?.by_event_type?.find(e => e.event_type === "detail_open")?.count ?? 0;

  function exportPDF() {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

      // Header
      doc.setFillColor(42, 8, 8);
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ADEGA PREMIUM", pageWidth / 2, 16, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(250, 246, 239);
      doc.text("Relatório de Desempenho", pageWidth / 2, 24, { align: "center" });
      doc.setFontSize(8);
      doc.text(`Gerado em: ${dateStr} | Período: últimos 30 dias`, pageWidth / 2, 31, { align: "center" });

      // KPIs Section
      let y = 45;
      doc.setTextColor(42, 8, 8);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Indicadores Principais", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const kpis = [
        ["Total de Eventos (30d)", totalViews.toLocaleString("pt-BR"), "Interações no período"],
        ["Vinho Mais Visto", topWines.length > 0 ? topWines[0].name : "—", topWines.length > 0 ? `${topWines[0].views} views` : ""],
        ["QR Scaneados", String(qrScans), "QR codes escaneados"],
        ["Detalhes Abertos", String(detailOpens), "Fichas de produto"],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor", "Variação"]],
        body: kpis,
        theme: "grid",
        headStyles: { fillColor: [92, 26, 26], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [250, 246, 239] },
        margin: { left: 14, right: 14 },
      });

      // Top Wines Table
      y = (doc as any).lastAutoTable.finalY + 15;
      doc.setTextColor(42, 8, 8);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Top 10 Vinhos Mais Vistos", 14, y);
      y += 8;

      const wineRows = topWines.map((w, i) => [
        String(i + 1),
        w.name,
        w.country || "—",
        w.category || "—",
        String(w.views || 0),
      ]);

      autoTable(doc, {
        startY: y,
        head: [["#", "Vinho", "País", "Categoria", "Visualizações"]],
        body: wineRows,
        theme: "grid",
        headStyles: { fillColor: [92, 26, 26], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [250, 246, 239] },
        columnStyles: { 0: { cellWidth: 12 }, 4: { halign: "center" } },
        margin: { left: 14, right: 14 },
      });

      // Category Distribution
      y = (doc as any).lastAutoTable.finalY + 15;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(42, 8, 8);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição por Categoria", 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Categoria", "Percentual", "Representação"]],
        body: categoryData.map((c) => [c.name, `${c.value}%`, "█".repeat(Math.round(c.value / 5))]),
        theme: "grid",
        headStyles: { fillColor: [92, 26, 26], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [250, 246, 239] },
        margin: { left: 14, right: 14 },
      });

      // Monthly Data
      y = (doc as any).lastAutoTable.finalY + 15;
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(42, 8, 8);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Visitas e Pedidos Mensais", 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Mês", "Visitas", "Pedidos", "Conv. (%)"]],
        body: monthlyData.map((m) => [
          m.month,
          m.visitas.toLocaleString("pt-BR"),
          "—",
          "—",
        ]),
        theme: "grid",
        headStyles: { fillColor: [92, 26, 26], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [250, 246, 239] },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Adega Premium — Relatório gerado automaticamente | Página ${i} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`relatorio-adega-premium-${now.toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-burgundy-deep">Relatórios</h1>
          <p className="text-gray-500 text-sm mt-1">Análises e métricas do sistema</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={exportPDF}
            disabled={exporting || loading}
            className="h-9 px-4 rounded-lg bg-gold text-burgundy-deep text-sm font-semibold flex items-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-burgundy-deep/30 border-t-burgundy-deep rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Eventos totais (30d)" value={totalViews.toLocaleString("pt-BR")} sub="interações no período" />
        <KpiCard label="Vinhos no catálogo" value={String(summary?.total_wines ?? "—")} sub="cadastrados" />
        <KpiCard label="QR codes escaneados" value={String(qrScans)} sub="últimos 30 dias" />
        <KpiCard label="Fichas abertas" value={String(detailOpens)} sub="detalhes visualizados" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top 10 Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-burgundy-deep mb-4">Top 10 Vinhos Mais Vistos</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topWines.map((w) => ({ name: w.name.length > 14 ? w.name.slice(0, 14) + "…" : w.name, views: w.views || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }}
                  />
                  <Bar dataKey="views" fill="#5C1A1A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-burgundy-deep mb-4">Distribuição por Categoria</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }}
                  formatter={(value: number) => [`${value}%`, "Percentual"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-medium text-gray-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-burgundy-deep mb-4">Visitas e Pedidos Mensais</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="visitas" stroke="#5C1A1A" strokeWidth={2} dot={{ r: 4 }} name="Visitas" />
              <Line yAxisId="right" type="monotone" dataKey="pedidos" stroke="#C9A84C" strokeWidth={2} dot={{ r: 4 }} name="Pedidos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-burgundy-deep mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
