'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export default function AccesoRestringido({
  mensaje = 'Esta sección es de acceso restringido únicamente para el personal de cocina y administración.',
}: {
  mensaje?: string;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Acceso Restringido
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {mensaje}
        </p>
        <div className="flex flex-col gap-2 pt-3">
          <Link
            href="/login"
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión como Administrador
          </Link>
          <Link
            href="/"
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Catálogo de Almuerzos
          </Link>
        </div>
      </div>
    </div>
  );
}
