'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

export default function AccesoRestringido({
  titulo = 'No tienes acceso a esta página',
  mensaje = 'No tienes permisos para ver este contenido o no has iniciado sesión. Ingresa con una cuenta autorizada para continuar.',
  textoBotonLogin = 'Iniciar Sesión',
  urlLogin = '/login',
}: {
  titulo?: string;
  mensaje?: string;
  textoBotonLogin?: string;
  urlLogin?: string;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4 relative overflow-hidden">
        {/* Barra superior de acento */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500" />

        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-full tracking-wide">
          ACCESO RESTRINGIDO
        </span>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {titulo}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {mensaje}
        </p>

        <div className="flex flex-col gap-2.5 pt-4">
          <Link
            href={urlLogin}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-orange-500/25 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{textoBotonLogin}</span>
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Carta Principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
