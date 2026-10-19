import type { Metadata } from "next";
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import BottomNav from "@/components/BottomNav";
import FaviconUpdater from "@/components/FaviconUpdater";
import ClientMetadataManager from "@/components/ClientMetadataManager";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "Placeres Culinarios | Gestión de Almuerzos Escolares",
  description: "Placeres Culinarios - Sistema de gestión y pedidos de menús escolares saludables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <AuthProvider>
          <FaviconUpdater />
          <ClientMetadataManager />
          <HeaderNav />
          <main className="flex-1 pb-24 md:pb-20">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

