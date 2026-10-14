'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ModalConfirmacionProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void | Promise<void>;
  titulo?: string;
  mensaje?: React.ReactNode;
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
  tipo?: 'peligro' | 'advertencia';
  cargando?: boolean;
}

export default function ModalConfirmacion({
  abierto,
  onCerrar,
  onConfirmar,
  titulo = '¿Estás seguro de eliminar?',
  mensaje = 'Esta acción no se puede deshacer. ¿Deseas continuar?',
  textoBotonConfirmar = 'Sí, eliminar',
  textoBotonCancelar = 'Cancelar',
  tipo = 'peligro',
  cargando = false,
}: ModalConfirmacionProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !cargando) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, cargando, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacion-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !cargando) {
          onCerrar();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-150 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera con Icono y Botón Cerrar */}
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
              tipo === 'peligro'
                ? 'bg-rose-50 text-rose-600 ring-8 ring-rose-50/50'
                : 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50'
            }`}
          >
            {tipo === 'peligro' ? (
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Título y Mensaje */}
        <div className="space-y-2">
          <h3
            id="modal-confirmacion-titulo"
            className="text-lg font-black text-slate-900 tracking-tight leading-snug"
          >
            {titulo}
          </h3>
          <div className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {mensaje}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition cursor-pointer disabled:opacity-50 text-center"
          >
            {textoBotonCancelar}
          </button>

          <button
            type="button"
            onClick={() => onConfirmar()}
            disabled={cargando}
            className={`w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 ${
              tipo === 'peligro'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 active:scale-95'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25 active:scale-95'
            }`}
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>{textoBotonConfirmar}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
