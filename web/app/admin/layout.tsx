"use client";
import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IMAGES } from "@/lib/media";
import { BrandLogo } from "@/components/BrandLogo";

type AuthCtx = { token: string; setToken: (t: string) => void };
export const AuthContext = createContext<AuthCtx>({ token: "", setToken: () => {} });
export const useAuth = () => useContext(AuthContext);

const NAV_ITEMS = [
  { label: "Produtos", href: "/admin", icon: "wine" },
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { label: "Questionário", href: "/admin/quiz", icon: "quiz" },
  { label: "Configurações", href: "/admin/config", icon: "settings" },
];

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || "w-5 h-5";
  switch (icon) {
    case "wine":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
          <path d="M12 15.5V22" />
          <path d="M8 22h8" />
        </svg>
      );
    case "grid":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 1h6v4H9z" />
          <path d="M9 10h6M9 14h4" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          <circle cx="17" cy="7" r="2.5" />
          <path d="M21 21v-1.5a3 3 0 00-2-2.83" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
        </svg>
      );
    case "quiz":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
        </svg>
      );
    case "logout":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#2A0808] to-[#1a0505] flex flex-col z-50 shadow-2xl">
      <div className="px-6 pt-8 pb-6 text-center border-b border-gold/20">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2h8l-1 10a4 4 0 01-3 3.5A4 4 0 019 12L8 2z" />
              <path d="M12 15.5V22" />
              <path d="M8 22h8" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-xl tracking-[0.3em] text-gold">ADEGA</h1>
        <p className="font-display text-[10px] tracking-[0.5em] text-cream/60">PREMIUM</p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-gold/60 font-medium">Administrativo</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gold/15 text-gold shadow-lg shadow-gold/5 border border-gold/20"
                  : "text-cream/70 hover:text-cream hover:bg-white/5"
              }`}
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="relative h-28 rounded-xl overflow-hidden mb-3 opacity-90">
          <Image src={IMAGES.adminSidebar} alt="" fill className="object-cover" sizes="256px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-transparent to-transparent" />
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cream/50 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
        >
          <NavIcon icon="logout" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
    if (!senha) return;
    onLogin(senha);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <Image src={IMAGES.bgLogin} alt="" fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0808]/90 via-[#0a0404]/85 to-[#0a0404]/95" />

      <div className="relative z-10 w-full max-w-sm px-6 fade-in">
        <div className="mb-8">
          <BrandLogo size="md" />
        </div>

        <h2 className="font-display text-2xl text-cream text-center">Área Administrativa</h2>
        <p className="text-center text-cream/40 text-sm mt-2">Faça login para acessar o sistema</p>

        {/* Form */}
        <div className="mt-8 space-y-5">
          {/* Usuário */}
          <div>
            <label className="block text-gold/80 uppercase text-[11px] tracking-wider font-medium mb-2">Usuário</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a6 6 0 0112 0v1" />
                </svg>
              </div>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-transparent border border-gold/30 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-gold/80 uppercase text-[11px] tracking-wider font-medium mb-2">Senha</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </div>
              <input
                type={showPass ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Digite sua senha"
                className="w-full h-13 pl-12 pr-12 rounded-xl bg-transparent border border-gold/30 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/70 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showPass ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M1 1l22 22" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full mt-8 h-14 rounded-xl bg-[#5C1A1A] border border-gold/20 text-cream font-bold text-base tracking-wider flex items-center justify-center gap-3 hover:bg-[#6d2020] hover:border-gold/40 transition-all duration-200 shadow-lg shadow-burgundy/30 active:scale-[0.98]"
        >
          <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          ENTRAR
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="flex-1 h-[1px] bg-cream/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
            <div className="flex-1 h-[1px] bg-cream/10" />
          </div>
          <div className="flex items-center justify-center gap-2 text-cream/30 text-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Acesso restrito e seguro</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={(t) => {
          setToken(t);
          setLoggedIn(true);
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <div className="min-h-screen bg-[#FAF6EF]">
        <Sidebar />
        <div className="ml-64">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <div />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-burgundy-deep flex items-center justify-center">
                <svg className="w-5 h-5 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a6 6 0 0112 0v1" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-burgundy-deep">Administrador</p>
                <p className="text-[11px] text-gray-500">admin@adega.com</p>
              </div>
            </div>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
