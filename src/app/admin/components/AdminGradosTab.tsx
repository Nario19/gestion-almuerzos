'use client';

import React from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { FiltroGrados } from '@/types';

interface AdminGradosTabProps {
  esSuperAdmin: boolean;
  colegios: string[];
  colegioObjetivo: string;
  setColegioMenuSeleccionado: (col: string) => void;
  nuevoGrado: string;
  setNuevoGrado: (v: string) => void;
  handleAgregarGrado: (e: React.FormEvent) => Promise<void>;
  grados: string[];
  handleSolicitarEliminarGrado: (nombre: string) => void;
  filtrosGrados: FiltroGrados[];
  filtroEditandoId: string | null;
  nombreFiltroGrados: string;
  setNombreFiltroGrados: (v: string) => void;
  gradosSeleccionadosFiltro: string[];
  guardandoFiltro: boolean;
  errorFiltro: string | null;
  exitoFiltro: boolean;
  handleGuardarFiltroGrados: (e: React.FormEvent) => Promise<void>;
  handleCancelarEditarFiltro: () => void;
  handleIniciarEditarFiltro: (filtro: FiltroGrados) => void;
  handleSolicitarEliminarFiltro: (filtro: FiltroGrados) => void;
  toggleGradoEnFiltro: (g: string) => void;
  handleSeleccionarTodosGrados: () => void;
  handleDeseleccionarTodosGrados: () => void;
}

export default function AdminGradosTab({
  esSuperAdmin,
  colegios,
  colegioObjetivo,
  setColegioMenuSeleccionado,
  nuevoGrado,
  setNuevoGrado,
  handleAgregarGrado,
  grados,
  handleSolicitarEliminarGrado,
  filtrosGrados,
  filtroEditandoId,
  nombreFiltroGrados,
  setNombreFiltroGrados,
  gradosSeleccionadosFiltro,
  guardandoFiltro,
  errorFiltro,
  exitoFiltro,
  handleGuardarFiltroGrados,
  handleCancelarEditarFiltro,
  handleIniciarEditarFiltro,
  handleSolicitarEliminarFiltro,
  toggleGradoEnFiltro,
  handleSeleccionarTodosGrados,
  handleDeseleccionarTodosGrados,
}: AdminGradosTabProps) {
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
        {/* Formulario nuevo grado */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs h-fit">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-orange-500" />
            Nuevo Grado / Sección
          </h2>
          <form onSubmit={handleAgregarGrado} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre del Grado / Sección *
              </label>
              <input
                type="text"
                placeholder="Ej. 1.° Primaria B"
                value={nuevoGrado}
                onChange={(e) => setNuevoGrado(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Grado / Sección
            </button>
          </form>
        </div>

        {/* Lista de grados */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900 mb-2">
            Grados y Secciones Activas ({grados.length}) — {colegioObjetivo || 'General'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {grados.map((g) => (
              <div key={g} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{g}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSolicitarEliminarGrado(g)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Eliminar grado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN: FILTROS DE GRADOS PARA DESPACHO */}
        <div className="md:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Filtros de Grados para Despacho ({filtrosGrados.length}) — {colegioObjetivo || 'General'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Crea grupos personalizados de grados (ej. &quot;Primaria&quot;, &quot;Secundaria&quot;, &quot;1.° a 3.°&quot;). Estos filtros aparecerán en Despacho para entregas rápidas.
                </p>
              </div>
            </div>

            {filtroEditandoId && (
              <button
                type="button"
                onClick={handleCancelarEditarFiltro}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer self-start sm:self-auto"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          {/* Formulario de Creación / Edición de Filtro */}
          <form onSubmit={handleGuardarFiltroGrados} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                {filtroEditandoId ? '✏️ Editando Filtro de Grados' : '+ Crear Nuevo Filtro de Grados'}
              </span>
              {exitoFiltro && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  ✓ ¡Filtro guardado con éxito!
                </span>
              )}
            </div>

            {errorFiltro && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorFiltro}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre del Filtro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Primaria, Secundaria, 1.° a 3.° Primaria, Pabellón A..."
                  value={nombreFiltroGrados}
                  onChange={(e) => setNombreFiltroGrados(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={guardandoFiltro}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {guardandoFiltro ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{filtroEditandoId ? 'Actualizar Filtro' : 'Guardar Filtro'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selección de Grados para el Filtro */}
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Selecciona los grados que incluirá este filtro ({gradosSeleccionadosFiltro.length} seleccionados):
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSeleccionarTodosGrados}
                    className="font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Marcar todos
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeseleccionarTodosGrados}
                    className="font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Desmarcar todos
                  </button>
                </div>
              </div>

              {grados.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No hay grados activos en este colegio. Registra grados arriba primero.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {grados.map((g) => {
                    const seleccionado = gradosSeleccionadosFiltro.includes(g);
                    return (
                      <label
                        key={g}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                          seleccionado
                            ? 'bg-orange-50 text-orange-950 border-orange-300 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => toggleGradoEnFiltro(g)}
                          className="rounded text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="truncate">{g}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </form>

          {/* Lista de Filtros de Grados Creados */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Filtros Disponibles para Despacho en {colegioObjetivo || 'este colegio'}:
            </h4>

            {filtrosGrados.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center space-y-1.5">
                <Filter className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Aún no hay filtros de grados creados</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Crea tu primer filtro arriba para agrupar los grados (ej. Primaria o Secundaria) y poder filtrar rápidamente los almuerzos en Despacho.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtrosGrados.map((f) => (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border transition space-y-2.5 ${
                      filtroEditandoId === f.id
                        ? 'bg-orange-50/60 border-orange-300 ring-2 ring-orange-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                        <h5 className="text-sm font-black text-slate-900 tracking-tight">
                          {f.nombre}
                        </h5>
                        <span className="text-[10px] font-black uppercase text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                          {f.grados.length} {f.grados.length === 1 ? 'grado' : 'grados'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleIniciarEditarFiltro(f)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                          title="Editar filtro"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSolicitarEliminarFiltro(f)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Eliminar filtro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chips de grados incluidos */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                      {f.grados.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
