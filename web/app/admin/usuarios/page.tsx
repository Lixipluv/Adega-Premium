"use client";
import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "ativo" | "inativo";
  lastLogin: string;
  avatar?: string;
};

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-burgundy-deep/10", text: "text-burgundy-deep" },
  editor: { bg: "bg-blue-50", text: "text-blue-700" },
  viewer: { bg: "bg-gray-100", text: "text-gray-600" },
};

const MOCK_USERS: User[] = [
  { id: 1, name: "Admin Principal", email: "admin@adega.com", role: "admin", status: "ativo", lastLogin: "2026-05-26T15:00:00" },
  { id: 2, name: "Carlos Editor", email: "carlos@adega.com", role: "editor", status: "ativo", lastLogin: "2026-05-26T10:30:00" },
  { id: 3, name: "Maria Viewer", email: "maria@adega.com", role: "viewer", status: "ativo", lastLogin: "2026-05-25T08:15:00" },
  { id: 4, name: "João Estoque", email: "joao@adega.com", role: "editor", status: "ativo", lastLogin: "2026-05-24T14:20:00" },
  { id: 5, name: "Ana Consulta", email: "ana@adega.com", role: "viewer", status: "inativo", lastLogin: "2026-05-10T09:00:00" },
];

export default function UsuariosPage() {
  const [users] = useState<User[]>(MOCK_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "viewer" as User["role"] });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-burgundy-deep">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o acesso ao painel administrativo</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-5 rounded-lg bg-burgundy-deep text-cream text-sm font-medium flex items-center gap-2 hover:bg-burgundy transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Novo Usuário
        </button>
      </div>

      {/* Role legend */}
      <div className="flex gap-4 mb-6">
        {Object.entries(ROLE_STYLES).map(([role, style]) => (
          <div key={role} className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Função</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Último Acesso</th>
              <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleStyle = ROLE_STYLES[user.role];
              return (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-burgundy-deep/10 flex items-center justify-center text-burgundy-deep font-semibold text-sm">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === "ativo" ? "text-green-700" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ativo" ? "bg-green-500" : "bg-gray-300"}`} />
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(user.lastLogin).toLocaleDateString("pt-BR")}
                    <br />
                    <span className="text-xs text-gray-400">
                      {new Date(user.lastLogin).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Editar">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {user.role !== "admin" && (
                        <button className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Remover">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-burgundy-deep">Novo Usuário</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@adega.com"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Função</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="w-full h-10 rounded-lg bg-burgundy-deep text-cream font-medium text-sm hover:bg-burgundy transition-colors mt-4">
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
