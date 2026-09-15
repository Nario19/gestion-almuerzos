import type { Metadata } from "next";
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "Placeres Culinarios | Gestión de Almuerzos",
  description: "Placeres Culinarios - Sistema de gestión y pedidos de menús escolares",
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
          <HeaderNav />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

