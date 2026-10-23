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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
    <div className="space-y-5">
      {/* Header de colegio seleccionado (Exclusivo Superadmin) */}
      {esSuperAdmin && (
        <Card className="p-3.5 border-zinc-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Colegio Activo:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {colegios.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColegioMenuSeleccionado(col)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    colegioObjetivo === col
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Formulario nuevo grado */}
        <Card className="h-fit border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              Nuevo Grado / Sección
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Registra un grado o aula para organizar las entregas en el comedor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <form onSubmit={handleAgregarGrado} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Nombre del Grado / Sección *
                </label>
                <Input
                  type="text"
                  placeholder="Ej. 1.° Primaria B"
                  value={nuevoGrado}
                  onChange={(e) => setNuevoGrado(e.target.value)}
                  className="bg-white border-zinc-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded-lg transition shadow-xs cursor-pointer gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Grado / Sección
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de grados */}
        <Card className="md:col-span-2 border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-950">
                Grados y Secciones Activas ({grados.length}) — {colegioObjetivo || 'General'}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Aulas disponibles para asignar a los alumnos en sus loncheras.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {grados.length} {grados.length === 1 ? 'aula' : 'aulas'}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {grados.length === 0 ? (
              <div className="p-6 border border-dashed border-zinc-200 rounded-xl text-center space-y-1">
                <GraduationCap className="w-6 h-6 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-700">Sin grados registrados</p>
                <p className="text-[11px] text-zinc-500">Agrega el primer grado o sección con el formulario lateral.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grados.map((g) => (
                  <div
                    key={g}
                    className="p-3 bg-zinc-50/70 hover:bg-zinc-100/70 rounded-lg border border-zinc-200/80 flex items-center justify-between gap-2 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-900 truncate">{g}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSolicitarEliminarGrado(g)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Eliminar grado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECCIÓN: FILTROS DE GRADOS PARA DESPACHO */}
        <Card className="md:col-span-3 border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-zinc-950 tracking-tight">
                    Filtros de Grados para Despacho ({filtrosGrados.length}) — {colegioObjetivo || 'General'}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Crea grupos personalizados de grados (ej. &quot;Primaria&quot;, &quot;Secundaria&quot;, &quot;1.° a 3.°&quot;). Estos filtros aparecerán en Despacho para entregas rápidas.
                  </CardDescription>
                </div>
              </div>

              {filtroEditandoId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelarEditarFiltro}
                  className="text-xs font-semibold cursor-pointer self-start sm:self-auto"
                >
                  Cancelar Edición
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Formulario de Creación / Edición de Filtro */}
            <form onSubmit={handleGuardarFiltroGrados} className="bg-zinc-50/70 p-4 sm:p-5 rounded-xl border border-zinc-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-900 tracking-wider">
                  {filtroEditandoId ? '✏️ Editando Filtro de Grados' : '+ Crear Nuevo Filtro de Grados'}
                </span>
                {exitoFiltro && (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ¡Filtro guardado con éxito!
                  </span>
                )}
              </div>

              {errorFiltro && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorFiltro}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Nombre del Filtro *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ej. Primaria, Secundaria, 1.° a 3.° Primaria, Pabellón A..."
                    value={nombreFiltroGrados}
                    onChange={(e) => setNombreFiltroGrados(e.target.value)}
                    className="bg-white border-zinc-300 rounded-lg text-xs sm:text-sm font-medium"
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    disabled={guardandoFiltro}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs sm:text-sm h-10 transition shadow-xs cursor-pointer gap-1.5"
                  >
                    {guardandoFiltro ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{filtroEditandoId ? 'Actualizar Filtro' : 'Guardar Filtro'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Selección de Grados para el Filtro */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-700">
                    Selecciona los grados que incluirá este filtro ({gradosSeleccionadosFiltro.length} seleccionados):
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSeleccionarTodosGrados}
                      className="font-semibold text-zinc-900 hover:underline cursor-pointer"
                    >
                      Marcar todos
                    </button>
                    <span className="text-zinc-300">•</span>
                    <button
                      type="button"
                      onClick={handleDeseleccionarTodosGrados}
                      className="font-semibold text-zinc-500 hover:text-zinc-900 hover:underline cursor-pointer"
                    >
                      Desmarcar todos
                    </button>
                  </div>
                </div>

                {grados.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">
                    No hay grados activos en este colegio. Registra grados arriba primero.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {grados.map((g) => {
                      const seleccionado = gradosSeleccionadosFiltro.includes(g);
                      return (
                        <label
                          key={g}
                          className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                            seleccionado
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionado}
                            onChange={() => toggleGradoEnFiltro(g)}
                            className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-3.5 h-3.5 cursor-pointer accent-zinc-950"
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
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Filtros Disponibles para Despacho en {colegioObjetivo || 'este colegio'}:
              </h4>

              {filtrosGrados.length === 0 ? (
                <div className="bg-zinc-50 p-6 rounded-xl border border-dashed border-zinc-200 text-center space-y-1.5">
                  <Filter className="w-5 h-5 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-800">Aún no hay filtros de grados creados</p>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                    Crea tu primer filtro arriba para agrupar los grados (ej. Primaria o Secundaria) y poder filtrar rápidamente los almuerzos en Despacho.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtrosGrados.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border transition space-y-2.5 ${
                        filtroEditandoId === f.id
                          ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-zinc-950 shrink-0" />
                          <h5 className="text-sm font-bold text-zinc-950 tracking-tight truncate">
                            {f.nombre}
                          </h5>
                          <Badge variant="secondary" className="text-[10px] font-semibold shrink-0">
                            {f.grados.length} {f.grados.length === 1 ? 'grado' : 'grados'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleIniciarEditarFiltro(f)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition cursor-pointer"
                            title="Editar filtro"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSolicitarEliminarFiltro(f)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Eliminar filtro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Chips de grados incluidos */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-100">
                        {f.grados.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
