import Link from 'next/link';
import { UtensilsCrossed, Home, ShoppingBag, ArrowLeft, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Página no encontrada | Placeres Culinarios',
  description: 'Lo sentimos, el enlace o sección al que intentas acceder no existe o fue movido.',
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center relative overflow-hidden">
        {/* Adorno superior sutil */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Icono de plato / error */}
        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xs border border-orange-100">
          <UtensilsCrossed className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Badge de error 404 */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-full mb-3 tracking-wide">
          <ShieldAlert className="w-3.5 h-3.5" />
          ERROR 404
        </span>

        {/* Título y subtítulo en español */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Esta página no está en el menú de hoy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
          El enlace al que intentas acceder no existe, ha cambiado de lugar o la dirección fue escrita incorrectamente.
        </p>

        {/* Acciones principales */}
        <div className="mt-8 space-y-2.5">
          <Link
            href="/"
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Volver a la Carta Principal
          </Link>

          <Link
            href="/padres/pedidos"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
            Ver Mis Pedidos
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold pt-2 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            ¿Eres administrador? Ingresa al Panel Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
