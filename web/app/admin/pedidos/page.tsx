"use client";
import { useState } from "react";

type Order = {
  id: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";
  date: string;
  paymentMethod: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pendente: { bg: "bg-yellow-50", text: "text-yellow-800", dot: "bg-yellow-500" },
  confirmado: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500" },
  enviado: { bg: "bg-purple-50", text: "text-purple-800", dot: "bg-purple-500" },
  entregue: { bg: "bg-green-50", text: "text-green-800", dot: "bg-green-500" },
  cancelado: { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
};

const MOCK_ORDERS: Order[] = [
  {
    id: "PED-001",
    customer: "João Silva",
    items: [{ name: "Alamos Malbec", qty: 2, price: 129.9 }, { name: "Casillero del Diablo", qty: 1, price: 119.9 }],
    total: 379.7,
    status: "pendente",
    date: "2026-05-26T14:30:00",
    paymentMethod: "Cartão de crédito",
  },
  {
    id: "PED-002",
    customer: "Maria Oliveira",
    items: [{ name: "Chandon Brut", qty: 3, price: 109.9 }],
    total: 329.7,
    status: "confirmado",
    date: "2026-05-26T11:15:00",
    paymentMethod: "PIX",
  },
  {
    id: "PED-003",
    customer: "Carlos Santos",
    items: [{ name: "Gran Reserva Cabernet", qty: 1, price: 139.9 }, { name: "D.V. Catena Chardonnay", qty: 2, price: 99.9 }],
    total: 339.7,
    status: "enviado",
    date: "2026-05-25T16:45:00",
    paymentMethod: "Cartão de crédito",
  },
  {
    id: "PED-004",
    customer: "Ana Ferreira",
    items: [{ name: "Luigi Bosca Rosé", qty: 4, price: 89.9 }],
    total: 359.6,
    status: "entregue",
    date: "2026-05-24T09:20:00",
    paymentMethod: "PIX",
  },
  {
    id: "PED-005",
    customer: "Pedro Costa",
    items: [{ name: "Santa Carolina Reserva", qty: 1, price: 99.9 }],
    total: 99.9,
    status: "cancelado",
    date: "2026-05-24T08:00:00",
    paymentMethod: "Boleto",
  },
  {
    id: "PED-006",
    customer: "Lucia Mendes",
    items: [{ name: "Trivento Reserve Malbec", qty: 2, price: 109.9 }, { name: "Alamos Malbec", qty: 1, price: 129.9 }],
    total: 349.7,
    status: "confirmado",
    date: "2026-05-25T13:00:00",
    paymentMethod: "Cartão de débito",
  },
];

export default function PedidosPage() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  const stats = {
    total: orders.length,
    pendentes: orders.filter((o) => o.status === "pendente").length,
    revenue: orders.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total, 0),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-burgundy-deep">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe e gerencie os pedidos realizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total de Pedidos</p>
          <p className="text-2xl font-bold text-burgundy-deep mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendentes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Receita Total</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            R$ {stats.revenue.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "", label: "Todos" },
          { value: "pendente", label: "Pendentes" },
          { value: "confirmado", label: "Confirmados" },
          { value: "enviado", label: "Enviados" },
          { value: "entregue", label: "Entregues" },
          { value: "cancelado", label: "Cancelados" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === tab.value
                ? "bg-burgundy-deep text-cream"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const style = STATUS_STYLES[order.status];
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-burgundy-deep">{order.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      <br />
                      <span className="text-xs text-gray-400">
                        {new Date(order.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-800">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </span>
                      <br />
                      <span className="text-xs text-gray-400">{order.items.length} item(ns)</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {order.status === "pendente" && (
                          <button className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Confirmar">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-burgundy-deep">Pedido {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cliente</span>
                <span className="font-medium">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span>{new Date(selectedOrder.date).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pagamento</span>
                <span>{selectedOrder.paymentMethod}</span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Itens</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5">
                    <span className="text-gray-700">{item.qty}x {item.name}</span>
                    <span className="font-medium">R$ {(item.qty * item.price).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-semibold text-burgundy-deep">Total</span>
                <span className="font-bold text-lg text-burgundy-deep">
                  R$ {selectedOrder.total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
