"use client";
import { useState } from "react";

export default function ConfigPage() {
  const [settings, setSettings] = useState({
    storeName: "Adega Premium",
    storeEmail: "contato@adegapremium.com.br",
    storePhone: "(11) 99999-0000",
    address: "Rua dos Vinhos, 123 - São Paulo, SP",
    adminToken: "change-me-in-production",
    idleTimeout: 3,
    currency: "BRL",
    language: "pt-BR",
    enableKiosk: true,
    enableQrCode: true,
    enableAnalytics: true,
    enablePWA: true,
    maxUploadSize: 5,
    cacheTimeout: 5,
    itemsPerPage: 7,
  });

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-burgundy-deep">Configurações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as configurações gerais do sistema</p>
        </div>
        <button
          onClick={handleSave}
          className={`h-10 px-6 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-burgundy-deep text-cream hover:bg-burgundy"
          }`}
        >
          {saved ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Salvo!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* General Info */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-burgundy-deep text-lg mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 9h6M9 13h4" />
            </svg>
            Informações da Loja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome da loja</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email de contato</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Telefone</label>
              <input
                type="text"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Endereço</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-burgundy-deep text-lg mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Segurança
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Token de Admin (API)</label>
              <input
                type="password"
                value={settings.adminToken}
                onChange={(e) => setSettings({ ...settings, adminToken: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Usado para autenticar operações no backend</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Timeout de inatividade (min)</label>
              <input
                type="number"
                value={settings.idleTimeout}
                onChange={(e) => setSettings({ ...settings, idleTimeout: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Tempo até o kiosk voltar à tela inicial</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-burgundy-deep text-lg mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Funcionalidades
          </h2>
          <div className="space-y-4">
            {[
              { key: "enableKiosk", label: "Modo Kiosk", desc: "Tela cheia, sem scroll e auto-retorno à home" },
              { key: "enableQrCode", label: "QR Code", desc: "Gerar QR codes para cada vinho" },
              { key: "enableAnalytics", label: "Analytics", desc: "Rastrear visualizações e interações" },
              { key: "enablePWA", label: "PWA / Offline", desc: "Service Worker para funcionamento offline" },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [feature.key]: !(settings as any)[feature.key] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    (settings as any)[feature.key] ? "bg-burgundy-deep" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      (settings as any)[feature.key] ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Performance */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-burgundy-deep text-lg mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Cache (minutos)</label>
              <input
                type="number"
                value={settings.cacheTimeout}
                onChange={(e) => setSettings({ ...settings, cacheTimeout: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Max upload (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Itens por página (admin)</label>
              <input
                type="number"
                value={settings.itemsPerPage}
                onChange={(e) => setSettings({ ...settings, itemsPerPage: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
