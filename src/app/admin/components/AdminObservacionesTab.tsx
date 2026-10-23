'use client';

import React from 'react';
import {
  Tag,
  Plus,
  X,
  Building2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
        {/* Formulario nueva observacion */}
        <Card className="h-fit border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              Nueva Observación Rápida
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Estas etiquetas aparecen como botones rápidos para que los padres las seleccionen al ordenar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <form onSubmit={handleAgregarObservacion} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Etiqueta / Restricción *
                </label>
                <Input
                  type="text"
                  placeholder="Ej. Sin cebolla, Presa pecho..."
                  value={nuevaObservacion}
                  onChange={(e) => setNuevaObservacion(e.target.value)}
                  className="bg-white border-zinc-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded-lg transition shadow-xs cursor-pointer gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Etiqueta
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de observaciones */}
        <Card className="md:col-span-2 border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-950">
                Etiquetas Configuradas ({observaciones.length}) — {colegioObjetivo || 'General'}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Preferencias y restricciones frecuentes que los apoderados pueden marcar con un clic.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {observaciones.length} {observaciones.length === 1 ? 'etiqueta' : 'etiquetas'}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {observaciones.length === 0 ? (
              <div className="p-6 border border-dashed border-zinc-200 rounded-xl text-center space-y-1">
                <Tag className="w-6 h-6 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-700">Sin etiquetas configuradas</p>
                <p className="text-[11px] text-zinc-500">Agrega sugerencias como &quot;Sin sal&quot; o &quot;Sin ensalada&quot;.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {observaciones.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 text-zinc-800 text-xs font-semibold transition"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleSolicitarEliminarObservacion(tag)}
                      className="text-zinc-400 hover:text-rose-600 rounded-sm transition cursor-pointer"
                      title="Eliminar etiqueta"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
