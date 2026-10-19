'use client';

import React from 'react';
import {
  Tag,
  Plus,
  X,
  Building2,
} from 'lucide-react';

interface AdminObservacionesTabProps {
  esSuperAdmin: boolean;
  colegios: string[];
  colegioObjetivo: string;
  setColegioMenuSeleccionado: (col: string) => void;
  nuevaObservacion: string;
  setNuevaObservacion: (v: string) => void;
  handleAgregarObservacion: (e: React.FormEvent) => Promise<void>;
  observaciones: string[];
  handleSolicitarEliminarObservacion: (tag: string) => void;
}

export default function AdminObservacionesTab({
  esSuperAdmin,
  colegios,
  colegioObjetivo,
  setColegioMenuSeleccionado,
  nuevaObservacion,
  setNuevaObservacion,
  handleAgregarObservacion,
  observaciones,
  handleSolicitarEliminarObservacion,
}: AdminObservacionesTabProps) {
  return (
    <div className="space-y-4">
      {/* Header de colegio seleccionado (Exclusivo Superadmin) */}
      {esSuperAdmin && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Colegio Activo:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {colegios.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setColegioMenuSeleccionado(col)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  colegioObjetivo === col
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario nueva observacion */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs h-fit">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-500" />
            Nueva Observación Rápida
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Estas etiquetas aparecen como botones rápidos para que los padres las seleccionen al ordenar.
          </p>
          <form onSubmit={handleAgregarObservacion} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Etiqueta / Restricción *
              </label>
              <input
                type="text"
                placeholder="Ej. Sin cebolla, Presa pecho..."
                value={nuevaObservacion}
                onChange={(e) => setNuevaObservacion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Etiqueta
            </button>
          </form>
        </div>

        {/* Lista de observaciones */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900 mb-2">
            Etiquetas Configuradas ({observaciones.length}) — {colegioObjetivo || 'General'}
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Los padres verán estas opciones al realizar su pedido para agregar notas en un toque:
          </p>
          <div className="flex flex-wrap gap-2">
            {observaciones.map((tag) => (
              <div
                key={tag}
                className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold flex items-center gap-2 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleSolicitarEliminarObservacion(tag)}
                  className="p-0.5 text-orange-400 hover:text-rose-600 transition cursor-pointer"
                  title="Eliminar etiqueta"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
