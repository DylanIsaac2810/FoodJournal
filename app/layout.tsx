import type { Metadata } from "next";
import { Nunito, Playfair_Display, DM_Mono } from "next/font/google";
import "./globals.css";

// ─── CONFIGURACIÓN DE FUENTES GOOGLE ──────────────────────────────────────
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

// ─── METADATOS DEL PROYECTO ───────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Food Journey | Anyone Can Cook!",
  description: "Plataforma inteligente de gestión de alacena y recomendación de recetas para reducir el desperdicio de comida.",
  icons: {
    icon: '/img/logo.png', // Esto pondrá tu logo en la pestaña del navegador
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${playfair.variable} ${dmMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFFAE6] text-[#335C67]">
        {children}
      </body>
    </html>
  );
}