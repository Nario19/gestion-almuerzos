'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loggear error en consola para depuración
    console.error('Error capturado por límite de página de Next.js:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center relative overflow-hidden">
        {/* Barra superior de acento */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
          <AlertCircle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-full mb-3 tracking-wide">
          AVISO DEL SISTEMA
        </span>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          No se pudo cargar esta página
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
          Ocurrió una interrupción temporal en la conexión o la vista solicitada. Puedes intentar recargar la página o volver a la carta principal.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Intentar Nuevamente</span>
          </button>

          <Link
            href="/"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Volver a la Carta Principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
