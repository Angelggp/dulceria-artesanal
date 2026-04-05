import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/conditional-header";
import ConditionalMain from "@/components/conditional-main";
import ConditionalFooter from "@/components/conditional-footer";
import ConditionalTicker from "@/components/conditional-ticker";
import BottomNav from "@/components/bottom-nav";
import ToastProvider from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dulcería Artesanal - La Cen",
  description:
    "Dulcería artesanal, ubicada en Castillo de Jagua, Cienfuegos, Cuba. Elaboramos dulces tradicionales con sabores únicos. Haz tu pedido fácilmente por WhatsApp.",
  keywords: [
    "dulcería", "dulces artesanales", "Cienfuegos", "Cuba",
    "Castillo de Jagua", "Ciudad Nuclear", "Confituras", "dulces",
    "combos", "regalos", "La Cen",
  ],
  authors: [{ name: "Angelggp" }],
  openGraph: {
    title: "Dulcería Artesanal — La Cen",
    description:
      "Dulcería artesanal, ubicada en Castillo de Jagua, Cienfuegos, Cuba. Elaboramos dulces tradicionales con sabores únicos. Haz tu pedido fácilmente por WhatsApp.",
    locale: "es_CU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-amber-50 text-zinc-800">
        <div className="sticky top-0 z-50">
          <ConditionalTicker />
          <ConditionalHeader />
        </div>
        <ConditionalMain>{children}</ConditionalMain>
        <ConditionalFooter />
        <BottomNav />
        <ToastProvider />
      </body>
    </html>
  );
}
