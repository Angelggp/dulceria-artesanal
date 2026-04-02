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
  title: "Dulceria Artesanal",
  description: "Tienda de dulces con pedidos por WhatsApp",
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
        <ConditionalHeader />
        <ConditionalMain>{children}</ConditionalMain>
        <ConditionalTicker />
        <ConditionalFooter />
        <BottomNav />
        <ToastProvider />
      </body>
    </html>
  );
}
