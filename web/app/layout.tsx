import "./globals.css";
import type { Metadata, Viewport } from "next";
import { IdleRedirect } from "@/components/IdleRedirect";
import { SwRegister } from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "Adega Premium — Catálogo de Vinhos",
  description: "Descubra os melhores vinhos selecionados para você.",
  applicationName: "Adega Premium",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5C1A1A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="kiosk-no-scroll min-h-screen">
        <IdleRedirect />
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
