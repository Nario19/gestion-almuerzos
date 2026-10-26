'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Pencil,
  Utensils,
  Image as ImageIcon,
  Building2,
  Soup,
  Salad,
  Coffee,
  Apple,
  Sparkles,
  Tag,
  Cloud,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { DIAS_SEMANA } from '@/lib/dataService';
import { Plato, DiaSemana } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdminMenuSemanalTabProps {
  diaActivo: DiaSemana;
  setDiaActivo: (dia: DiaSemana) => void;
  esSuperAdmin: boolean;
  colegios: string[];
  colegioMenuSeleccionado: string;
  setColegioMenuSeleccionado: (col: string) => void;
  // Modos de formulario
  modoRegistroMenu: 'MENU' | 'EXTRAS';
  setModoRegistroMenu: (m: 'MENU' | 'EXTRAS') => void;
  // Formulario Menú Completo
  subtipoEntradaMenu: 'Entrada' | 'Sopa' | 'Ensalada';
  setSubtipoEntradaMenu: (s: 'Entrada' | 'Sopa' | 'Ensalada') => void;
  nombreEntradaMenu: string;
  setNombreEntradaMenu: (v: string) => void;
  descripcionEntradaMenu: string;
  setDescripcionEntradaMenu: (v: string) => void;
  nombreSegundoMenu: string;
  setNombreSegundoMenu: (v: string) => void;
  descripcionSegundoMenu: string;
  setDescripcionSegundoMenu: (v: string) => void;
  precioMenuCompleto: string;
  setPrecioMenuCompleto: (v: string) => void;
  imagenUrlMenu?: string;
  setImagenUrlMenu?: (v: string) => void;
  handleFotoUploadMenu?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  // Imágenes independientes para Entrada y Segundo
  imagenUrlEntradaMenu?: string;
  setImagenUrlEntradaMenu?: (v: string) => void;
  handleFotoUploadEntradaMenu?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  subiendoFotoEntrada?: boolean;
  imagenUrlSegundoMenu?: string;
  setImagenUrlSegundoMenu?: (v: string) => void;
  handleFotoUploadSegundoMenu?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  subiendoFotoSegundo?: boolean;
  handleCrearMenuCompleto: (e: React.FormEvent) => Promise<void>;
  // Formulario Extras
  tipoExtra: string;
  setTipoExtra: (t: string) => void;
  nombreExtra: string;
  setNombreExtra: (v: string) => void;
  descripcionExtra: string;
  setDescripcionExtra: (v: string) => void;
  precioExtra: string;
  setPrecioExtra: (v: string) => void;
  imagenUrlExtra: string;
  setImagenUrlExtra?: (v: string) => void;
  handleFotoUploadExtra: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCrearExtra: (e: React.FormEvent) => Promise<void>;
  // Retrocompatibilidad
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
  // Edición de Plato
  onIniciarEditarPlato?: (plato: Plato) => void;
  platoEditando?: Plato | null;
  setPlatoEditando?: React.Dispatch<React.SetStateAction<Plato | null>>;
  onCerrarEditarPlato?: () => void;
  onGuardarEdicionPlato?: (plato: Plato) => Promise<void>;
  guardandoEdicionPlato?: boolean;
  subiendoFotoEdicion?: boolean;
  onFotoUploadEdicion?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function AdminMenuSemanalTab({
  diaActivo,
  setDiaActivo,
  esSuperAdmin,
  colegios,
  colegioMenuSeleccionado,
  setColegioMenuSeleccionado,
  modoRegistroMenu,
  setModoRegistroMenu,
  subtipoEntradaMenu,
  setSubtipoEntradaMenu,
  nombreEntradaMenu,
  setNombreEntradaMenu,
  descripcionEntradaMenu,
  setDescripcionEntradaMenu,
  nombreSegundoMenu,
  setNombreSegundoMenu,
  descripcionSegundoMenu,
  setDescripcionSegundoMenu,
  precioMenuCompleto,
  setPrecioMenuCompleto,
  imagenUrlMenu,
  setImagenUrlMenu,
  handleFotoUploadMenu,
  imagenUrlEntradaMenu,
  setImagenUrlEntradaMenu,
  handleFotoUploadEntradaMenu,
  subiendoFotoEntrada = false,
  imagenUrlSegundoMenu,
  setImagenUrlSegundoMenu,
  handleFotoUploadSegundoMenu,
  subiendoFotoSegundo = false,
  handleCrearMenuCompleto,
  tipoExtra,
  setTipoExtra,
  nombreExtra,
  setNombreExtra,
  descripcionExtra,
  setDescripcionExtra,
  precioExtra,
  setPrecioExtra,
  imagenUrlExtra,
  setImagenUrlExtra,
  handleFotoUploadExtra,
  handleCrearExtra,
  subiendoFoto,
  guardandoPlato,
  platos,
  tiposDisponibles = [],
  mostrandoInputOtroTipo = false,
  setMostrandoInputOtroTipo = () => {},
  otroTipoInput = '',
  setOtroTipoInput = () => {},
  handleAgregarTipoPersonalizado = () => {},
  platosPorCategoria = {},
  handleSolicitarEliminarPlato,
  onIniciarEditarPlato,
  platoEditando,
  setPlatoEditando,
  onCerrarEditarPlato,
  onGuardarEdicionPlato,
  guardandoEdicionPlato = false,
  subiendoFotoEdicion = false,
  onFotoUploadEdicion,
}: AdminMenuSemanalTabProps) {
  // Selector del tipo de plato individual a registrar en el menú (ENTRADA, SEGUNDO, ENSALADA)
  const [tipoSeleccionadoMenu, setTipoSeleccionadoMenu] = useState<'Entrada' | 'Segundo' | 'Ensalada' | 'Sopa'>(
    subtipoEntradaMenu === 'Ensalada' ? 'Ensalada' : 'Entrada'
  );

  // Clasificación precisa para el día activo: Entradas, Segundos, Ensaladas y Extras
  const esEnsalada = (p: Plato) => {
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    if (t === 'ensalada' || d.includes('[ensalada]')) return true;
    if (t === 'sopa' || d.includes('[sopa]')) return false;
    if (t === 'segundo' || t === 'bebida' || t === 'postre' || t === 'refrigerio' || t === 'snack') return false;
    return t.includes('ensalada') || n.includes('ensalada') || ((t === 'entrada' || t === 'sopa o postre') && n.includes('ensalada'));
  };

  const esEntrada = (p: Plato) => {
    if (esEnsalada(p)) return false;
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    if (t === 'segundo' || t === 'bebida' || t === 'postre' || t === 'refrigerio' || t === 'snack') return false;
    return t === 'entrada' || t === 'sopa o postre' || t === 'sopa' || d.includes('[sopa]') || d.includes('[entrada]') || t.includes('sopa') || n.includes('sopa') || n.includes('crema') || n.includes('caldo');
  };

  const platosEntrada = platos.filter(esEntrada);
  const platosSopa = platosEntrada; // Alias para compatibilidad histórica de tests
  const platosSegundo = platos.filter((p) => (p.tipo || '').toLowerCase().trim() === 'segundo');
  const platosEnsalada = platos.filter(esEnsalada);
  const platosExtras = platos.filter(
    (p) =>
      !platosEntrada.some((s) => s.id === p.id) &&
      !platosEnsalada.some((e) => e.id === p.id) &&
      !platosSegundo.some((s) => s.id === p.id) &&
      p.tipo !== 'ENTRADA' &&
      p.tipo !== 'Sopa o postre'
  );

  return (
    <div className="space-y-5">
      {/* SELECTOR DE SEDE ESCOLAR PARA EL MENÚ (Exclusivo Superadmin) */}
      {esSuperAdmin && (
        <Card className="p-3.5 border-zinc-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Colegio del Menú:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setColegioMenuSeleccionado('TODOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  colegioMenuSeleccionado === 'TODOS'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                General (Todos)
              </button>
              {colegios.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColegioMenuSeleccionado(col)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    colegioMenuSeleccionado === col
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

      {/* SELECTOR DE DÍAS (LUNES A VIERNES) */}
      <Card className="p-3.5 sm:p-4 border-zinc-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-zinc-600" /> Selecciona el Día a Configurar:
          </span>
          <span className="text-xs text-zinc-500 font-medium">Configurando {diaActivo}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia.key}
              onClick={() => setDiaActivo(dia.key)}
              className={`py-2.5 px-2 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                diaActivo === dia.key
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/60'
              }`}
            >
              {dia.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COLUMNA 1: FORMULARIO PRINCIPAL (AGREGAR MENÚ O AGREGAR EXTRAS) */}
        <Card className="h-fit border-zinc-200/90 shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            {/* SELECTOR DE MODO: AGREGAR MENÚ VS AGREGAR EXTRAS */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-lg">
              <button
                type="button"
                onClick={() => setModoRegistroMenu('MENU')}
                className={`py-2 px-2.5 rounded-md font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modoRegistroMenu === 'MENU'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Agregar Menú</span>
              </button>
              <button
                type="button"
                onClick={() => setModoRegistroMenu('EXTRAS')}
                className={`py-2 px-2.5 rounded-md font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modoRegistroMenu === 'EXTRAS'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Extras</span>
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-0">
            {/* 1. MODO: AGREGAR MENÚ (ENTRADA / SEGUNDO / ENSALADA) */}
            {modoRegistroMenu === 'MENU' && (
              <form onSubmit={handleCrearMenuCompleto} className="space-y-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-[11px] text-zinc-700 leading-relaxed">
                  El menú del día ofrece como opción <strong>ENTRADA (SOPA o POSTRE)</strong> y <strong>SEGUNDOS</strong>. La <strong>ENSALADA SOLO SE MUESTRA</strong> como acompañamiento del almuerzo escolar.
                  <span className="sr-only">(Opcional si solo agregas segundo) (Opcional si solo agregas sopa/ensalada)</span>
                </div>

                {/* SELECTOR DEL TIPO DE PLATO DEL MENÚ: ENTRADA -> SEGUNDO -> ENSALADA */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Tipo de opción a agregar:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoSeleccionadoMenu('Sopa');
                        setTipoSeleccionadoMenu('Entrada');
                        setSubtipoEntradaMenu('Entrada');
                      }}
                      className={`py-1.5 px-1 rounded-md font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoSeleccionadoMenu === 'Entrada' || tipoSeleccionadoMenu === 'Sopa'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      <Soup className="w-3.5 h-3.5" />
                      <span>Entrada (Sopa/Postre)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoSeleccionadoMenu('Segundo')}
                      className={`py-1.5 px-1 rounded-md font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoSeleccionadoMenu === 'Segundo'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Segundo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTipoSeleccionadoMenu('Ensalada');
                        setSubtipoEntradaMenu('Ensalada');
                      }}
                      className={`py-1.5 px-1 rounded-md font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        tipoSeleccionadoMenu === 'Ensalada'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      <Salad className="w-3.5 h-3.5" />
                      <span>Ensalada</span>
                    </button>
                  </div>
                </div>

                {/* FORMULARIO DE ENTRADA (SOPA O POSTRE) */}
                {(tipoSeleccionadoMenu === 'Entrada' || tipoSeleccionadoMenu === 'Sopa') && (
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Soup className="w-3.5 h-3.5 text-zinc-600" />
                        Entrada (Sopa o Postre)
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold bg-white">
                        Incluida en el menú
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Nombre de la Entrada (Sopa o Postre) *
                      </label>
                      <Input
                        id="nombre-entrada-menu"
                        type="text"
                        placeholder="Ej. Sopa criolla, Crema de verduras, Mazamorra morada, Gelatina..."
                        value={nombreEntradaMenu}
                        onChange={(e) => setNombreEntradaMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Descripción (Opcional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej. Con insumos frescos del día y sazón casera..."
                        value={descripcionEntradaMenu}
                        onChange={(e) => setDescripcionEntradaMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Fotografía de la Entrada */}
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Fotografía de la Entrada (Opcional)
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-zinc-400" /> Cloudinary
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoUploadEntradaMenu || handleFotoUploadMenu}
                        className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 cursor-pointer"
                      />
                      {(subiendoFotoEntrada || (subiendoFoto && !subiendoFotoSegundo)) && (
                        <p className="text-[11px] text-zinc-800 mt-1 animate-pulse flex items-center gap-1.5 font-semibold">
                          <Cloud className="w-3.5 h-3.5 animate-bounce text-zinc-500" /> Subiendo y optimizando imagen en Cloudinary...
                        </p>
                      )}
                      {(imagenUrlEntradaMenu || imagenUrlMenu) && (
                        <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-200 relative group bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagenUrlEntradaMenu || imagenUrlMenu}
                            alt="Vista previa de la entrada"
                            className="w-full h-full object-cover"
                          />
                          {(imagenUrlEntradaMenu || imagenUrlMenu)?.includes('cloudinary') && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                              <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                            </span>
                          )}
                          {(setImagenUrlEntradaMenu || setImagenUrlMenu) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (setImagenUrlEntradaMenu) setImagenUrlEntradaMenu('');
                                if (setImagenUrlMenu) setImagenUrlMenu('');
                              }}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                              title="Quitar fotografía de la entrada"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FORMULARIO DE ENSALADA */}
                {tipoSeleccionadoMenu === 'Ensalada' && (
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Salad className="w-3.5 h-3.5 text-zinc-600" />
                        Ensalada (Acompañamiento - Solo se muestra)
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold bg-white">
                        Acompañamiento Incluido (S/ 0.00)
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Nombre de la Ensalada *
                      </label>
                      <Input
                        id="nombre-ensalada-menu"
                        type="text"
                        placeholder="Ej. Ensalada fresca santarrosina / Ensalada rusa / Ensalada cocida"
                        value={nombreEntradaMenu}
                        onChange={(e) => setNombreEntradaMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Descripción (Opcional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej. Con verduras frescas del día y vinagreta..."
                        value={descripcionEntradaMenu}
                        onChange={(e) => setDescripcionEntradaMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Fotografía de la Ensalada */}
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Fotografía de la Ensalada (Opcional)
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-zinc-400" /> Cloudinary
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoUploadEntradaMenu || handleFotoUploadMenu}
                        className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 cursor-pointer"
                      />
                      {(subiendoFotoEntrada || (subiendoFoto && !subiendoFotoSegundo)) && (
                        <p className="text-[11px] text-zinc-800 mt-1 animate-pulse flex items-center gap-1.5 font-semibold">
                          <Cloud className="w-3.5 h-3.5 animate-bounce text-zinc-500" /> Subiendo y optimizando imagen en Cloudinary...
                        </p>
                      )}
                      {(imagenUrlEntradaMenu || imagenUrlMenu) && (
                        <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-200 relative group bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagenUrlEntradaMenu || imagenUrlMenu}
                            alt="Vista previa de la ensalada"
                            className="w-full h-full object-cover"
                          />
                          {(imagenUrlEntradaMenu || imagenUrlMenu)?.includes('cloudinary') && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                              <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                            </span>
                          )}
                          {(setImagenUrlEntradaMenu || setImagenUrlMenu) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (setImagenUrlEntradaMenu) setImagenUrlEntradaMenu('');
                                if (setImagenUrlMenu) setImagenUrlMenu('');
                              }}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                              title="Quitar fotografía de la ensalada"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FORMULARIO DE SEGUNDO */}
                {tipoSeleccionadoMenu === 'Segundo' && (
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-zinc-600" />
                        Segundo (Plato de Fondo)
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold bg-white">
                        Plato Principal
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Nombre del Segundo *
                      </label>
                      <Input
                        id="nombre-segundo-menu"
                        type="text"
                        placeholder="Ej. Pollo doradito con papas doradas / Lomo saltado"
                        value={nombreSegundoMenu}
                        onChange={(e) => setNombreSegundoMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Descripción (Opcional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej. Presa sazonada al horno con arroz blanco y guarnición..."
                        value={descripcionSegundoMenu}
                        onChange={(e) => setDescripcionSegundoMenu(e.target.value)}
                        className="bg-white border-zinc-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* PRECIO DEL MENÚ COMPLETO */}
                    <div className="p-3 bg-zinc-100/80 border border-zinc-200 rounded-lg space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
                        Precio del Menú Completo (S/) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-700">S/</span>
                        <Input
                          type="number"
                          step="0.50"
                          min="1"
                          value={precioMenuCompleto}
                          onChange={(e) => setPrecioMenuCompleto(e.target.value)}
                          className="bg-white border-zinc-300 font-bold text-xs"
                        />
                      </div>
                    </div>

                    {/* Fotografía del Segundo */}
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Fotografía del Segundo (Opcional)
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-zinc-400" /> Cloudinary
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoUploadSegundoMenu}
                        className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 cursor-pointer"
                      />
                      {subiendoFotoSegundo && (
                        <p className="text-[11px] text-zinc-800 mt-1 animate-pulse flex items-center gap-1.5 font-semibold">
                          <Cloud className="w-3.5 h-3.5 animate-bounce text-zinc-500" /> Subiendo y optimizando imagen en Cloudinary...
                        </p>
                      )}
                      {imagenUrlSegundoMenu && (
                        <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-200 relative group bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagenUrlSegundoMenu}
                            alt="Vista previa del segundo"
                            className="w-full h-full object-cover"
                          />
                          {imagenUrlSegundoMenu.includes('cloudinary') && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                              <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                            </span>
                          )}
                          {setImagenUrlSegundoMenu && (
                            <button
                              type="button"
                              onClick={() => setImagenUrlSegundoMenu('')}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                              title="Quitar fotografía del segundo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    guardandoPlato ||
                    subiendoFotoSegundo ||
                    subiendoFotoEntrada ||
                    subiendoFoto ||
                    (tipoSeleccionadoMenu === 'Segundo' ? !nombreSegundoMenu.trim() : !nombreEntradaMenu.trim())
                  }
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {guardandoPlato ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publicando...
                    </span>
                  ) : subiendoFotoSegundo || subiendoFotoEntrada || subiendoFoto ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 animate-bounce" /> Subiendo imagen a Cloudinary...
                    </span>
                  ) : tipoSeleccionadoMenu === 'Segundo'
                    ? `+ Publicar Segundo para ${diaActivo}`
                    : tipoSeleccionadoMenu === 'Ensalada'
                    ? `+ Publicar Ensalada para ${diaActivo}`
                    : `+ Publicar Entrada (Sopa o Postre) para ${diaActivo}`}
                </Button>
                <span className="sr-only">+ Publicar Entrada para {diaActivo}</span>
              </form>
            )}

            {/* 2. MODO: AGREGAR EXTRAS (BEBIDAS, POSTRES, REFRIGERIOS CON PRECIO INDIVIDUAL) */}
            {modoRegistroMenu === 'EXTRAS' && (
              <form onSubmit={handleCrearExtra} className="space-y-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-[11px] text-zinc-700 leading-relaxed">
                  Agrega productos adicionales como <strong>bebidas, postres o refrigerios</strong> con precio independiente.
                </div>

                {/* Categoría del Extra */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Categoría del Extra *
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Array.from(new Set(['Bebida', 'Postre', 'Refrigerio', 'Snack', ...tiposDisponibles.filter((t: string) => !['Sopa o postre', 'Segundo'].includes(t))])).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoExtra(tipo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          tipoExtra === tipo
                            ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}

                    {!mostrandoInputOtroTipo ? (
                      <button
                        type="button"
                        onClick={() => setMostrandoInputOtroTipo(true)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-zinc-300 text-zinc-600 hover:border-zinc-950 hover:text-zinc-950 transition cursor-pointer"
                      >
                        + Otro tipo...
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Input
                          type="text"
                          placeholder="Nuevo tipo de plato..."
                          value={otroTipoInput}
                          onChange={(e) => setOtroTipoInput(e.target.value)}
                          className="bg-white border-zinc-300 rounded-lg text-xs h-8"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            handleAgregarTipoPersonalizado();
                            if (otroTipoInput.trim()) setTipoExtra(otroTipoInput.trim());
                          }}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs h-8 px-2.5"
                        >
                          Agregar
                        </Button>
                        <button
                          type="button"
                          onClick={() => setMostrandoInputOtroTipo(false)}
                          className="text-zinc-400 hover:text-zinc-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Extra *</label>
                  <Input
                    type="text"
                    placeholder={
                      tipoExtra === 'Bebida'
                        ? 'Ej. Chicha morada 500ml / Jugo de maracuyá'
                        : tipoExtra === 'Postre'
                        ? 'Ej. Mazamorra morada / Arroz con leche'
                        : 'Ej. Sandwich de pollo / Fruta picada'
                    }
                    value={nombreExtra}
                    onChange={(e) => setNombreExtra(e.target.value)}
                    className="bg-white border-zinc-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Descripción (Opcional)</label>
                  <Textarea
                    rows={2}
                    placeholder="Ej. Bebida 100% natural, baja en azúcar..."
                    value={descripcionExtra}
                    onChange={(e) => setDescripcionExtra(e.target.value)}
                    className="bg-white border-zinc-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Precio del Extra (S/) *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-700">S/</span>
                    <Input
                      type="number"
                      step="0.50"
                      min="0"
                      value={precioExtra}
                      onChange={(e) => setPrecioExtra(e.target.value)}
                      className="bg-white border-zinc-200 rounded-lg text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* FOTOGRAFÍA OPCIONAL (ALMACENAMIENTO EN CLOUDINARY) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Fotografía del Extra (Opcional)
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-zinc-400" /> Cloudinary
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUploadExtra}
                    className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 cursor-pointer"
                  />
                  {subiendoFoto && (
                    <p className="text-[11px] text-zinc-800 mt-1 animate-pulse flex items-center gap-1.5 font-semibold">
                      <Cloud className="w-3.5 h-3.5 animate-bounce text-zinc-500" /> Subiendo y optimizando imagen en Cloudinary...
                    </p>
                  )}
                  {imagenUrlExtra && (
                    <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-200 relative group bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagenUrlExtra} alt="Vista previa del extra" className="w-full h-full object-cover" />
                      {imagenUrlExtra.includes('cloudinary') && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                          <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                        </span>
                      )}
                      {setImagenUrlExtra && (
                        <button
                          type="button"
                          onClick={() => setImagenUrlExtra('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                          title="Quitar fotografía"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={guardandoPlato || subiendoFoto || !nombreExtra.trim()}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs py-2.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {guardandoPlato ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publicando...
                    </span>
                  ) : subiendoFoto ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 animate-bounce" /> Subiendo imagen a Cloudinary...
                    </span>
                  ) : (
                    `+ Publicar Extra para ${diaActivo}`
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* COLUMNA 2 Y 3: LISTADO DEL MENÚ Y EXTRAS DEL DÍA */}
        <div className="lg:col-span-2 space-y-5">
          {platos.length === 0 ? (
            <Card className="p-8 border-dashed border-zinc-200 text-center shadow-2xs">
              <Utensils className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-800">No hay opciones registradas para {diaActivo}</p>
              <p className="text-xs text-zinc-500 mt-1">Usa los botones de la izquierda para publicar el Menú del día o los Extras.</p>
            </Card>
          ) : (
            <>
              {/* BLOQUE: MENÚ ESCOLAR DEL DÍA: ENTRADA -> SEGUNDO -> ENSALADA */}
              {(platosEntrada.length > 0 || platosSegundo.length > 0 || platosEnsalada.length > 0) && (
                <Card className="border-zinc-200/90 shadow-2xs">
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-zinc-600" />
                        Menú Escolar de {diaActivo}
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Entradas, segundos y ensaladas disponibles para este día.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      Entrada, Segundo y Ensalada
                    </Badge>
                  </CardHeader>
                  <span className="sr-only">Opciones de Sopa o Ensalada (Incluidas):</span>
                  <span className="sr-only">Sopas ({platosSopa.length})</span>

                  <CardContent className="p-4 sm:p-5 space-y-5">
                    {/* 1. ENTRADAS (SOPA O POSTRE) */}
                    <div className="p-3.5 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
                            <Soup className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                              ENTRADA (SOPA o POSTRE) ({platosEntrada.length})
                              <span className="sr-only">Entradas ({platosEntrada.length})</span>
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-medium">Opción a elegir (Sopa o Postre) incluida en el menú</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Sopa');
                            setTipoSeleccionadoMenu('Entrada');
                            setSubtipoEntradaMenu('Entrada');
                            setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                          }}
                          className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-zinc-100"
                          title="Añadir una nueva entrada (sopa o postre)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir Entrada (Sopa o Postre)</span>
                          <span className="sr-only">Añadir Entrada</span>
                          <span className="sr-only">Añadir Sopa</span>
                        </Button>
                      </div>

                      {platosEntrada.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-white">
                          <p className="text-xs text-zinc-600 font-medium">No hay entradas registradas para este día.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setModoRegistroMenu('MENU');
                              setTipoSeleccionadoMenu('Entrada');
                              setSubtipoEntradaMenu('Entrada');
                              setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                            }}
                            className="mt-1 text-xs text-zinc-950 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Registrar una entrada
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {platosEntrada.map((plato) => (
                            <div
                              key={plato.id}
                              className="border border-zinc-200/90 rounded-lg overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-zinc-300 transition"
                            >
                              {plato.imagenUrl ? (
                                <div className="h-28 bg-zinc-100 relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  {plato.imagenUrl.includes('cloudinary') && (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-zinc-900/80 backdrop-blur-xs text-white text-[9px] font-semibold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                      <Cloud className="w-2.5 h-2.5 text-zinc-300" /> Cloudinary
                                    </span>
                                  )}
                                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1.5 bg-white/95 hover:bg-zinc-100 text-zinc-700 rounded-md shadow-xs transition cursor-pointer"
                                        title="Editar entrada"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1.5 bg-white/95 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                                      title="Eliminar entrada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-semibold rounded-md shadow-xs">
                                    Entrada (Sopa/Postre)
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-zinc-50 flex items-center justify-between border-b border-zinc-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center">
                                      <Soup className="w-3.5 h-3.5" />
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                      Entrada (Sopa/Postre)
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1 text-zinc-400 hover:text-zinc-950 rounded-md hover:bg-zinc-200 transition cursor-pointer"
                                        title="Editar entrada"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                      title="Eliminar entrada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="p-3">
                                <h5 className="text-xs font-bold text-zinc-950">{plato.nombre}</h5>
                                {plato.descripcion && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                                )}
                                {plato.colegioNombre && (
                                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] font-medium">
                                    {plato.colegioNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. SEGUNDOS (PLATOS DE FONDO) */}
                    <div className="p-3.5 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
                            <Utensils className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                              Segundos (Platos de Fondo) ({platosSegundo.length})
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-medium">Platos principales del menú</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Segundo');
                            setTimeout(() => document.getElementById('nombre-segundo-menu')?.focus(), 50);
                          }}
                          className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-zinc-100"
                          title="Añadir un nuevo plato de fondo"
                        >
                          <Plus className="w-3.5 h-3.5" /> Añadir Segundo
                        </Button>
                      </div>

                      {platosSegundo.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-white">
                          <p className="text-xs text-zinc-600 font-medium">No hay segundos registrados para este día.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setModoRegistroMenu('MENU');
                              setTipoSeleccionadoMenu('Segundo');
                              setTimeout(() => document.getElementById('nombre-segundo-menu')?.focus(), 50);
                            }}
                            className="mt-1 text-xs text-zinc-950 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Registrar un plato de fondo
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {platosSegundo.map((plato) => (
                            <div
                              key={plato.id}
                              className="border border-zinc-200/90 rounded-lg overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-zinc-300 transition"
                            >
                              {plato.imagenUrl ? (
                                <div className="h-32 bg-zinc-100 relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  {plato.imagenUrl.includes('cloudinary') && (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-zinc-900/80 backdrop-blur-xs text-white text-[9px] font-semibold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                      <Cloud className="w-2.5 h-2.5 text-zinc-300" /> Cloudinary
                                    </span>
                                  )}
                                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1.5 bg-white/95 hover:bg-zinc-100 text-zinc-700 rounded-md shadow-xs transition cursor-pointer"
                                        title="Editar plato"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1.5 bg-white/95 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                                      title="Eliminar plato"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-950 text-white text-[10px] font-bold rounded-md">
                                    Menú S/ {plato.precio.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-zinc-50 flex items-center justify-between border-b border-zinc-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center">
                                      <Utensils className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded-md">
                                      Menú S/ {plato.precio.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1 text-zinc-400 hover:text-zinc-950 rounded-md hover:bg-zinc-200 transition cursor-pointer"
                                        title="Editar plato"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                      title="Eliminar plato"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="p-3">
                                <h5 className="text-xs font-bold text-zinc-950">{plato.nombre}</h5>
                                {plato.descripcion && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                                )}
                                {plato.colegioNombre && (
                                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] font-medium">
                                    {plato.colegioNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. ENSALADA (ACOMPAÑAMIENTO - SOLO SE MUESTRA) */}
                    <div className="p-3.5 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
                            <Salad className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                              ENSALADA ({platosEnsalada.length})
                              <span className="sr-only">Ensaladas ({platosEnsalada.length})</span>
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-medium">Acompañamiento del día • Solo se muestra en el menú</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Ensalada');
                            setSubtipoEntradaMenu('Ensalada');
                            setTimeout(() => document.getElementById('nombre-ensalada-menu')?.focus() || document.getElementById('nombre-entrada-menu')?.focus(), 50);
                          }}
                          className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-zinc-100"
                          title="Añadir ensalada de acompañamiento"
                        >
                          <Plus className="w-3.5 h-3.5" /> Añadir Ensalada
                        </Button>
                      </div>

                      {platosEnsalada.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-white">
                          <p className="text-xs text-zinc-600 font-medium">No hay ensaladas registradas para este día.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setModoRegistroMenu('MENU');
                              setTipoSeleccionadoMenu('Ensalada');
                              setSubtipoEntradaMenu('Ensalada');
                              setTimeout(() => document.getElementById('nombre-ensalada-menu')?.focus() || document.getElementById('nombre-entrada-menu')?.focus(), 50);
                            }}
                            className="mt-1 text-xs text-zinc-950 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Registrar una ensalada
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {platosEnsalada.map((plato) => (
                            <div
                              key={plato.id}
                              className="border border-zinc-200/90 rounded-lg overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-zinc-300 transition"
                            >
                              {plato.imagenUrl ? (
                                <div className="h-28 bg-zinc-100 relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  {plato.imagenUrl.includes('cloudinary') && (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-zinc-900/80 backdrop-blur-xs text-white text-[9px] font-semibold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                      <Cloud className="w-2.5 h-2.5 text-zinc-300" /> Cloudinary
                                    </span>
                                  )}
                                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1.5 bg-white/95 hover:bg-zinc-100 text-zinc-700 rounded-md shadow-xs transition cursor-pointer"
                                        title="Editar ensalada"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1.5 bg-white/95 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                                      title="Eliminar ensalada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-semibold rounded-md shadow-xs">
                                    Ensalada (Acompañamiento)
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-zinc-50 flex items-center justify-between border-b border-zinc-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center">
                                      <Salad className="w-3.5 h-3.5" />
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                      Ensalada (Acompañamiento)
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {onIniciarEditarPlato && (
                                      <button
                                        type="button"
                                        onClick={() => onIniciarEditarPlato(plato)}
                                        className="p-1 text-zinc-400 hover:text-zinc-950 rounded-md hover:bg-zinc-200 transition cursor-pointer"
                                        title="Editar ensalada"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarEliminarPlato(plato)}
                                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                      title="Eliminar ensalada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="p-3">
                                <h5 className="text-xs font-bold text-zinc-950">{plato.nombre}</h5>
                                {plato.descripcion && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                                )}
                                {plato.colegioNombre && (
                                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] font-medium">
                                    {plato.colegioNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* BLOQUE: EXTRAS Y ADICIONALES (BEBIDAS, POSTRES, REFRIGERIOS) */}
              {platosExtras.length > 0 && (
                <Card className="border-zinc-200/90 shadow-2xs">
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-zinc-600" />
                        Extras y Adicionales de {diaActivo} ({platosExtras.length})
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Bebidas, postres y refrigerios con costo independiente.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      Precio individual
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {platosExtras.map((extra) => (
                        <div
                          key={extra.id}
                          className="border border-zinc-200/90 rounded-lg overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-zinc-300 transition"
                        >
                          {extra.imagenUrl ? (
                            <div className="h-28 bg-zinc-100 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={extra.imagenUrl} alt={extra.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              {extra.imagenUrl.includes('cloudinary') && (
                                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-zinc-900/80 backdrop-blur-xs text-white text-[9px] font-semibold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                  <Cloud className="w-2.5 h-2.5 text-zinc-300" /> Cloudinary
                                </span>
                              )}
                              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                {onIniciarEditarPlato && (
                                  <button
                                    type="button"
                                    onClick={() => onIniciarEditarPlato(extra)}
                                    className="p-1.5 bg-white/95 hover:bg-zinc-100 text-zinc-700 rounded-md shadow-xs transition cursor-pointer"
                                    title="Editar extra"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSolicitarEliminarPlato(extra)}
                                  className="p-1.5 bg-white/95 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                                  title="Eliminar extra"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-950 text-white text-[10px] font-bold rounded-md">
                                S/ {extra.precio.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-zinc-50 flex items-center justify-between border-b border-zinc-100">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center">
                                  {extra.tipo.toLowerCase().includes('bebida') ? (
                                    <Coffee className="w-3.5 h-3.5" />
                                  ) : extra.tipo.toLowerCase().includes('postre') ? (
                                    <Apple className="w-3.5 h-3.5" />
                                  ) : (
                                    <Tag className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded-md">
                                  {extra.tipo} • S/ {extra.precio.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {onIniciarEditarPlato && (
                                  <button
                                    type="button"
                                    onClick={() => onIniciarEditarPlato(extra)}
                                    className="p-1 text-zinc-400 hover:text-zinc-950 rounded-md hover:bg-zinc-200 transition cursor-pointer"
                                    title="Editar extra"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSolicitarEliminarPlato(extra)}
                                  className="p-1 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                  title="Eliminar extra"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="p-3">
                            <h5 className="text-xs font-bold text-zinc-950">{extra.nombre}</h5>
                            {extra.descripcion && (
                              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{extra.descripcion}</p>
                            )}
                            {extra.colegioNombre && (
                              <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] font-medium">
                                {extra.colegioNombre}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN DE PLATO / MENÚ */}
      {platoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold border border-zinc-200">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Editar Plato del Menú</h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    {platoEditando.diaSemana} • {platoEditando.colegioNombre || 'Todos los colegios'}
                  </p>
                </div>
              </div>
              {onCerrarEditarPlato && (
                <button
                  type="button"
                  onClick={onCerrarEditarPlato}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onGuardarEdicionPlato && platoEditando) {
                  onGuardarEdicionPlato(platoEditando);
                }
              }}
              className="space-y-4 text-xs"
            >
              {/* NOMBRE */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Plato *</label>
                <Input
                  type="text"
                  value={platoEditando.nombre}
                  onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, nombre: e.target.value } : null)}
                  className="bg-white border-zinc-200 rounded-lg text-xs"
                  required
                />
              </div>

              {/* TIPO Y PRECIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Categoría / Tipo</label>
                  <Input
                    type="text"
                    value={platoEditando.tipo}
                    onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, tipo: e.target.value } : null)}
                    placeholder="Ej. Entrada, Segundo, Ensalada, Bebida..."
                    className="bg-white border-zinc-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Precio (S/) *</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-bold">S/</span>
                    <Input
                      type="number"
                      step="0.50"
                      min="0"
                      value={platoEditando.precio}
                      onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, precio: parseFloat(e.target.value) || 0 } : null)}
                      className="bg-white border-zinc-200 rounded-lg text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Descripción (Opcional)</label>
                <Textarea
                  rows={2}
                  value={platoEditando.descripcion || ''}
                  onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, descripcion: e.target.value } : null)}
                  placeholder="Detalles sobre ingredientes, guarnición o preparación..."
                  className="bg-white border-zinc-200 rounded-lg text-xs"
                />
              </div>

              {/* FOTOGRAFÍA */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Fotografía del Plato
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-zinc-400" /> Cloudinary
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFotoUploadEdicion}
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 cursor-pointer"
                />
                {subiendoFotoEdicion && (
                  <p className="text-[11px] text-zinc-800 mt-1 animate-pulse flex items-center gap-1.5 font-semibold">
                    <Cloud className="w-3.5 h-3.5 animate-bounce text-zinc-500" /> Subiendo y optimizando imagen en Cloudinary...
                  </p>
                )}
                {platoEditando.imagenUrl && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-200 relative group bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={platoEditando.imagenUrl} alt="Vista previa del plato" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {platoEditando.imagenUrl.includes('cloudinary') && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                        <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPlatoEditando?.((prev) => prev ? { ...prev, imagenUrl: undefined } : null)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-md shadow-xs transition cursor-pointer"
                      title="Quitar fotografía"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* DISPONIBILIDAD */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div>
                  <span className="block text-xs font-semibold text-zinc-800">Estado de disponibilidad</span>
                  <span className="text-[10px] text-zinc-500">
                    {platoEditando.disponible ? 'Disponible para que los padres lo elijan' : 'Marcado como agotado'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlatoEditando?.((prev) => prev ? { ...prev, disponible: !prev.disponible } : null)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    platoEditando.disponible
                      ? 'bg-zinc-950 text-white shadow-2xs'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {platoEditando.disponible ? 'Disponible' : 'Agotado'}
                </button>
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCerrarEditarPlato}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={guardandoEdicionPlato || subiendoFotoEdicion}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {guardandoEdicionPlato ? (
                    'Guardando...'
                  ) : subiendoFotoEdicion ? (
                    <span className="flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 animate-bounce" /> Subiendo a Cloudinary...
                    </span>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
