'use client';

import React from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Utensils,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';
import { DIAS_SEMANA } from '@/lib/dataService';
import { Plato, DiaSemana } from '@/types';

interface AdminMenuSemanalTabProps {
  diaActivo: DiaSemana;
  setDiaActivo: (dia: DiaSemana) => void;
  esSuperAdmin: boolean;
  colegios: string[];
  colegioMenuSeleccionado: string;
  setColegioMenuSeleccionado: (col: string) => void;
  tiposDisponibles: string[];
  tipoNuevo: string;
  setTipoNuevo: (tipo: string) => void;
  mostrandoInputOtroTipo: boolean;
  setMostrandoInputOtroTipo: (v: boolean) => void;
  otroTipoInput: string;
  setOtroTipoInput: (v: string) => void;
  handleAgregarTipoPersonalizado: () => void;
  nombreNuevo: string;
  setNombreNuevo: (v: string) => void;
  descripcionNueva: string;
  setDescripcionNueva: (v: string) => void;
  precioNuevo: string;
  setPrecioNuevo: (v: string) => void;
  imagenUrlNueva: string;
  subiendoFoto: boolean;
  handleFotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCrearPlato: (e: React.FormEvent) => Promise<void>;
  guardandoPlato: boolean;
  platos: Plato[];
  categoriasOrdenadas: string[];
  platosPorCategoria: Record<string, Plato[]>;
  handleSolicitarEliminarPlato: (plato: Plato) => void;
}

export default function AdminMenuSemanalTab({
  diaActivo,
  setDiaActivo,
  esSuperAdmin,
  colegios,
  colegioMenuSeleccionado,
  setColegioMenuSeleccionado,
  tiposDisponibles,
  tipoNuevo,
  setTipoNuevo,
  mostrandoInputOtroTipo,
  setMostrandoInputOtroTipo,
  otroTipoInput,
  setOtroTipoInput,
  handleAgregarTipoPersonalizado,
  nombreNuevo,
  setNombreNuevo,
  descripcionNueva,
  setDescripcionNueva,
  precioNuevo,
  setPrecioNuevo,
  imagenUrlNueva,
  subiendoFoto,
  handleFotoUpload,
  handleCrearPlato,
  guardandoPlato,
  platos,
  categoriasOrdenadas,
  platosPorCategoria,
  handleSolicitarEliminarPlato,
}: AdminMenuSemanalTabProps) {
  return (
    <>
      {/* SELECTOR DE SEDE ESCOLAR PARA EL MENÚ (Exclusivo Superadmin) */}
      {esSuperAdmin && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Colegio del Menú:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setColegioMenuSeleccionado('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  colegioMenuSeleccionado === 'TODOS'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                General (Todos)
              </button>
              {colegios.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColegioMenuSeleccionado(col)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    colegioMenuSeleccionado === col
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SELECTOR DE DÍAS (LUNES A VIERNES) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-500" /> Selecciona el Día a Configurar:
          </h2>
          <span className="text-xs text-slate-400">Configurando {diaActivo}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia.key}
              onClick={() => setDiaActivo(dia.key)}
              className={`py-3 px-2 rounded-2xl text-center text-xs sm:text-sm font-bold transition-all ${
                diaActivo === dia.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {dia.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: FORMULARIO PARA AGREGAR NUEVO PLATO CON FOTO */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900">
              Agregar Plato para {diaActivo}
            </h2>
          </div>

          <form onSubmit={handleCrearPlato} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Tipo de Plato</label>
                {!mostrandoInputOtroTipo && (
                  <button
                    type="button"
                    onClick={() => setMostrandoInputOtroTipo(true)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    + Otro tipo...
                  </button>
                )}
              </div>

              {mostrandoInputOtroTipo && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-orange-50 rounded-xl border border-orange-200">
                  <input
                    type="text"
                    placeholder="Ej. Refrigerio, Snack, Bebida..."
                    value={otroTipoInput}
                    onChange={(e) => setOtroTipoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarTipoPersonalizado();
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAgregarTipoPersonalizado}
                    className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrandoInputOtroTipo(false);
                      setOtroTipoInput('');
                    }}
                    className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {tiposDisponibles.map((tipo) => {
                  const seleccionado =
                    tipoNuevo === tipo ||
                    (tipo === 'Sopa o postre' && tipoNuevo === 'ENTRADA') ||
                    (tipo === 'Segundo' && tipoNuevo === 'SEGUNDO');
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoNuevo(tipo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        seleccionado
                          ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tipo}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Plato *</label>
              <input
                type="text"
                placeholder="Ej. Seco de pollo con frijoles"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descripción (Opcional)</label>
              <textarea
                rows={2}
                placeholder="Ej. Con presa dorada, arroz graneado..."
                value={descripcionNueva}
                onChange={(e) => setDescripcionNueva(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {tipoNuevo !== 'Sopa o postre' && tipoNuevo !== 'ENTRADA' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Precio (S/)</label>
                <input
                  type="number"
                  step="0.50"
                  value={precioNuevo}
                  onChange={(e) => setPrecioNuevo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Subir Fotografía del Plato */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Fotografía del Plato
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoUpload}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 cursor-pointer"
              />
              {subiendoFoto && (
                <p className="text-[11px] text-orange-600 mt-1 animate-pulse">Optimizando imagen...</p>
              )}
              {imagenUrlNueva && (
                <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenUrlNueva} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={guardandoPlato}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-500/20 transition mt-2 cursor-pointer disabled:opacity-50"
            >
              {guardandoPlato ? 'Publicando...' : `+ Publicar en el Menú de ${diaActivo}`}
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: LISTA DE PLATOS DEL DÍA CON FOTOS POR CATEGORÍA */}
        <div className="lg:col-span-2 space-y-6">
          {platos.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay platos registrados para {diaActivo}</p>
              <p className="text-xs text-slate-400 mt-1">Usa el formulario a la izquierda para publicar platos en esta fecha.</p>
            </div>
          ) : (
            categoriasOrdenadas.map((cat: string) => {
              const platosDeCat = platosPorCategoria[cat] || [];
              if (platosDeCat.length === 0) return null;
              return (
                <div key={cat} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      {cat} de {diaActivo} ({platosDeCat.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {platosDeCat.map((plato: Plato) => (
                      <div
                        key={plato.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-slate-50/50"
                      >
                        <div className="h-28 bg-slate-200 relative">
                          {plato.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={plato.imagenUrl} alt={plato.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSolicitarEliminarPlato(plato)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                            title="Eliminar plato"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {plato.precio > 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                              S/ {plato.precio.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-xs font-black text-slate-900">{plato.nombre}</h4>
                            {plato.colegioNombre && (
                              <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[9px] font-bold shrink-0">
                                {plato.colegioNombre}
                              </span>
                            )}
                          </div>
                          {plato.descripcion && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">{plato.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
