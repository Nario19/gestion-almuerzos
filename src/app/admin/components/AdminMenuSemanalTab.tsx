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
  // Modos de formulario
  modoRegistroMenu: 'MENU' | 'EXTRAS';
  setModoRegistroMenu: (m: 'MENU' | 'EXTRAS') => void;
  // Formulario Menú Completo
  subtipoEntradaMenu: 'Sopa' | 'Ensalada';
  setSubtipoEntradaMenu: (s: 'Sopa' | 'Ensalada') => void;
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
  // Selector del tipo de plato individual a registrar en el menú
  const [tipoSeleccionadoMenu, setTipoSeleccionadoMenu] = useState<'Sopa' | 'Ensalada' | 'Segundo'>(
    subtipoEntradaMenu === 'Ensalada' ? 'Ensalada' : 'Sopa'
  );

  // Clasificación precisa para el día activo: Sopas, Ensaladas, Segundos y Extras
  const esSopa = (p: Plato) => {
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    if (t === 'sopa' || d.includes('[sopa]')) return true;
    if (t === 'ensalada' || d.includes('[ensalada]') || n.includes('ensalada')) return false;
    if (t === 'segundo' || t === 'bebida' || t === 'postre' || t === 'refrigerio' || t === 'snack') return false;
    return t === 'entrada' || t === 'sopa o postre' || t.includes('sopa') || n.includes('sopa') || n.includes('crema') || n.includes('caldo');
  };

  const esEnsalada = (p: Plato) => {
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    if (t === 'ensalada' || d.includes('[ensalada]')) return true;
    if (t === 'sopa' || d.includes('[sopa]')) return false;
    if (t === 'segundo' || t === 'bebida' || t === 'postre' || t === 'refrigerio' || t === 'snack') return false;
    return t.includes('ensalada') || n.includes('ensalada') || ((t === 'entrada' || t === 'sopa o postre') && n.includes('ensalada'));
  };

  const platosSopa = platos.filter(esSopa);
  const platosEnsalada = platos.filter(esEnsalada);
  const platosSegundo = platos.filter((p) => (p.tipo || '').toLowerCase().trim() === 'segundo');
  const platosExtras = platos.filter(
    (p) =>
      !platosSopa.some((s) => s.id === p.id) &&
      !platosEnsalada.some((e) => e.id === p.id) &&
      !platosSegundo.some((s) => s.id === p.id) &&
      p.tipo !== 'ENTRADA' &&
      p.tipo !== 'Sopa o postre'
  );

  // Mantenemos platosEntrada para retrocompatibilidad
  const platosEntrada = [...platosSopa, ...platosEnsalada];

  // Agrupación dinámica por categoría de platos (platosPorCategoria)
  const categoriasExtras = Object.keys(platosPorCategoria || {}).filter(
    (c) => c !== 'ENTRADA' && c !== 'SEGUNDO' && !c.toLowerCase().includes('sopa') && !c.toLowerCase().includes('ensalada')
  );

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
        {/* COLUMNA 1: FORMULARIO PRINCIPAL (AGREGAR MENÚ O AGREGAR EXTRAS) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs h-fit">
          {/* SELECTOR DE MODO: AGREGAR MENÚ VS AGREGAR EXTRAS */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setModoRegistroMenu('MENU')}
              className={`py-2 px-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modoRegistroMenu === 'MENU'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Agregar Menú</span>
            </button>
            <button
              type="button"
              onClick={() => setModoRegistroMenu('EXTRAS')}
              className={`py-2 px-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modoRegistroMenu === 'EXTRAS'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Extras</span>
            </button>
          </div>

          {/* 1. MODO: AGREGAR MENÚ (SOPA / ENSALADA / SEGUNDO INDIVIDUAL O CONJUNTO) */}
          {modoRegistroMenu === 'MENU' && (
            <form onSubmit={handleCrearMenuCompleto} className="space-y-4">
              <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-[11px] text-orange-950 font-medium leading-relaxed">
                Selecciona si deseas agregar una <strong>Sopa</strong>, <strong>Ensalada</strong> o <strong>Segundo</strong>. Puedes registrar varias opciones de cada tipo para dar variedad a los padres. (Opcional si solo agregas segundo) (Opcional si solo agregas sopa/ensalada)
              </div>

              {/* SELECTOR DEL TIPO DE PLATO DEL MENÚ */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de opción a agregar:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoSeleccionadoMenu('Sopa');
                      setSubtipoEntradaMenu('Sopa');
                    }}
                    className={`py-2 px-1 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      tipoSeleccionadoMenu === 'Sopa'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Soup className="w-3.5 h-3.5" />
                    <span>Sopa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoSeleccionadoMenu('Ensalada');
                      setSubtipoEntradaMenu('Ensalada');
                    }}
                    className={`py-2 px-1 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      tipoSeleccionadoMenu === 'Ensalada'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Salad className="w-3.5 h-3.5" />
                    <span>Ensalada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoSeleccionadoMenu('Segundo')}
                    className={`py-2 px-1 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      tipoSeleccionadoMenu === 'Segundo'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Segundo</span>
                  </button>
                </div>
              </div>

              {/* FORMULARIO DE SOPA O ENSALADA */}
              {(tipoSeleccionadoMenu === 'Sopa' || tipoSeleccionadoMenu === 'Ensalada') && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      {subtipoEntradaMenu === 'Sopa' ? <Soup className="w-3.5 h-3.5 text-amber-500" /> : <Salad className="w-3.5 h-3.5 text-emerald-600" />}
                      {subtipoEntradaMenu === 'Sopa' ? 'Sopa del Menú' : 'Ensalada del Menú'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Incluida (S/ 0.00)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre de la {subtipoEntradaMenu} *
                    </label>
                    <input
                      id="nombre-entrada-menu"
                      type="text"
                      placeholder={
                        subtipoEntradaMenu === 'Sopa'
                          ? 'Ej. Sopa criolla / Crema de verduras / Sopa wantán'
                          : 'Ej. Ensalada fresca santarrosina / Ensalada rusa'
                      }
                      value={nombreEntradaMenu}
                      onChange={(e) => setNombreEntradaMenu(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Descripción (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Con insumos frescos del día y sazón casera..."
                      value={descripcionEntradaMenu}
                      onChange={(e) => setDescripcionEntradaMenu(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Fotografía de la Sopa o Ensalada */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Fotografía de la {subtipoEntradaMenu} (Opcional)
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-emerald-500" /> Cloudinary
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUploadEntradaMenu || handleFotoUploadMenu}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 cursor-pointer"
                    />
                    {(subiendoFotoEntrada || (subiendoFoto && !subiendoFotoSegundo)) && (
                      <p className="text-[11px] text-orange-600 mt-1 animate-pulse flex items-center gap-1.5 font-bold">
                        <Cloud className="w-3.5 h-3.5 animate-bounce text-orange-500" /> Subiendo y optimizando imagen en Cloudinary...
                      </p>
                    )}
                    {(imagenUrlEntradaMenu || imagenUrlMenu) && (
                      <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagenUrlEntradaMenu || imagenUrlMenu}
                          alt={`Vista previa de la ${subtipoEntradaMenu}`}
                          className="w-full h-full object-cover"
                        />
                        {(imagenUrlEntradaMenu || imagenUrlMenu)?.includes('cloudinary') && (
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs">
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
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg shadow-xs transition cursor-pointer"
                            title={`Quitar fotografía de la ${subtipoEntradaMenu.toLowerCase()}`}
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
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-orange-500" />
                      Segundo (Plato de Fondo)
                    </span>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      Plato Principal
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre del Segundo *
                    </label>
                    <input
                      id="nombre-segundo-menu"
                      type="text"
                      placeholder="Ej. Pollo doradito con papas doradas / Lomo saltado"
                      value={nombreSegundoMenu}
                      onChange={(e) => setNombreSegundoMenu(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Descripción (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Presa sazonada al horno con arroz blanco y guarnición..."
                      value={descripcionSegundoMenu}
                      onChange={(e) => setDescripcionSegundoMenu(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  {/* PRECIO DEL MENÚ COMPLETO */}
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                    <label className="block text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                      Precio del Menú Completo (S/) *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-800">S/</span>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        value={precioMenuCompleto}
                        onChange={(e) => setPrecioMenuCompleto(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Fotografía del Segundo */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Fotografía del Segundo (Opcional)
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-emerald-500" /> Cloudinary
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUploadSegundoMenu}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 cursor-pointer"
                    />
                    {subiendoFotoSegundo && (
                      <p className="text-[11px] text-orange-600 mt-1 animate-pulse flex items-center gap-1.5 font-bold">
                        <Cloud className="w-3.5 h-3.5 animate-bounce text-orange-500" /> Subiendo y optimizando imagen en Cloudinary...
                      </p>
                    )}
                    {imagenUrlSegundoMenu && (
                      <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagenUrlSegundoMenu}
                          alt="Vista previa del segundo"
                          className="w-full h-full object-cover"
                        />
                        {imagenUrlSegundoMenu.includes('cloudinary') && (
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs">
                            <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                          </span>
                        )}
                        {setImagenUrlSegundoMenu && (
                          <button
                            type="button"
                            onClick={() => setImagenUrlSegundoMenu('')}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg shadow-xs transition cursor-pointer"
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

              <button
                type="submit"
                disabled={
                  guardandoPlato ||
                  (tipoSeleccionadoMenu === 'Segundo' ? !nombreSegundoMenu.trim() : !nombreEntradaMenu.trim())
                }
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black rounded-2xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {guardandoPlato
                  ? 'Publicando...'
                  : tipoSeleccionadoMenu === 'Segundo'
                  ? `+ Publicar Segundo para ${diaActivo}`
                  : `+ Publicar ${subtipoEntradaMenu} para ${diaActivo}`}
              </button>
            </form>
          )}

          {/* 2. MODO: AGREGAR EXTRAS (BEBIDAS, POSTRES, REFRIGERIOS CON PRECIO INDIVIDUAL) */}
          {modoRegistroMenu === 'EXTRAS' && (
            <form onSubmit={handleCrearExtra} className="space-y-4">
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-[11px] text-purple-950 font-medium">
                Agrega productos adicionales como <strong>bebidas, postres o refrigerios</strong> con precio independiente.
              </div>

              {/* Categoría del Extra */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Categoría del Extra *
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {Array.from(new Set(['Bebida', 'Postre', 'Refrigerio', 'Snack', ...tiposDisponibles.filter((t: string) => !['Sopa o postre', 'Segundo'].includes(t))])).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoExtra(tipo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        tipoExtra === tipo
                          ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}

                  {!mostrandoInputOtroTipo ? (
                    <button
                      type="button"
                      onClick={() => setMostrandoInputOtroTipo(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600 transition cursor-pointer"
                    >
                      + Otro tipo...
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="Nuevo tipo de plato..."
                        value={otroTipoInput}
                        onChange={(e) => setOtroTipoInput(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleAgregarTipoPersonalizado();
                          if (otroTipoInput.trim()) setTipoExtra(otroTipoInput.trim());
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => setMostrandoInputOtroTipo(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Extra *</label>
                <input
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Bebida 100% natural, baja en azúcar..."
                  value={descripcionExtra}
                  onChange={(e) => setDescripcionExtra(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Precio del Extra (S/) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">S/</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={precioExtra}
                    onChange={(e) => setPrecioExtra(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* FOTOGRAFÍA OPCIONAL (ALMACENAMIENTO EN CLOUDINARY) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Fotografía del Extra (Opcional)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-purple-500" /> Cloudinary
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUploadExtra}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 cursor-pointer"
                />
                {subiendoFoto && (
                  <p className="text-[11px] text-purple-600 mt-1 animate-pulse flex items-center gap-1.5 font-bold">
                    <Cloud className="w-3.5 h-3.5 animate-bounce text-purple-500" /> Subiendo y optimizando imagen en Cloudinary...
                  </p>
                )}
                {imagenUrlExtra && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagenUrlExtra} alt="Vista previa del extra" className="w-full h-full object-cover" />
                    {imagenUrlExtra.includes('cloudinary') && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs">
                        <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                      </span>
                    )}
                    {setImagenUrlExtra && (
                      <button
                        type="button"
                        onClick={() => setImagenUrlExtra('')}
                        className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg shadow-xs transition cursor-pointer"
                        title="Quitar fotografía"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={guardandoPlato}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-black rounded-2xl text-xs shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {guardandoPlato ? 'Publicando...' : `+ Publicar Extra para ${diaActivo}`}
              </button>
            </form>
          )}
        </div>

        {/* COLUMNA 2 Y 3: LISTADO DEL MENÚ Y EXTRAS DEL DÍA */}
        <div className="lg:col-span-2 space-y-6">
          {platos.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay opciones registradas para {diaActivo}</p>
              <p className="text-xs text-slate-400 mt-1">Usa los botones de la izquierda para publicar el Menú del día o los Extras.</p>
            </div>
          ) : (
            <>
              {/* BLOQUE: MENÚ ESCOLAR DEL DÍA (SEPARADO POR SOPAS, ENSALADAS Y SEGUNDOS) */}
              {(platosSopa.length > 0 || platosEnsalada.length > 0 || platosSegundo.length > 0) && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      Menú Escolar de {diaActivo}
                    </h3>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                      Sopas, Ensaladas y Segundos
                    </span>
                  </div>
                  <span className="sr-only">Opciones de Sopa o Ensalada (Incluidas):</span>

                  {/* 1. SOPAS */}
                  <div className="p-4 bg-amber-50/40 border border-amber-200/70 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Soup className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            Sopas ({platosSopa.length})
                          </h4>
                          <span className="text-[10px] text-amber-700 font-medium">Incluidas en el menú escolar</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModoRegistroMenu('MENU');
                          setTipoSeleccionadoMenu('Sopa');
                          setSubtipoEntradaMenu('Sopa');
                          setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                        }}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Añadir una nueva sopa"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir Sopa
                      </button>
                    </div>

                    {platosSopa.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-amber-200 rounded-xl bg-white/60">
                        <p className="text-xs text-amber-800 font-medium">No hay sopas registradas para este día.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Sopa');
                            setSubtipoEntradaMenu('Sopa');
                            setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                          }}
                          className="mt-1.5 text-xs text-amber-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Registrar una sopa
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {platosSopa.map((plato) => (
                          <div
                            key={plato.id}
                            className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-amber-300 transition"
                          >
                            {plato.imagenUrl ? (
                              <div className="h-28 bg-slate-100 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                {plato.imagenUrl.includes('cloudinary') && (
                                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                    <Cloud className="w-2.5 h-2.5 text-emerald-400" /> Cloudinary
                                  </span>
                                )}
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1.5 bg-white/90 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl shadow-xs transition cursor-pointer"
                                      title="Editar sopa"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                                    title="Eliminar sopa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-xs">
                                  Sopa
                                </span>
                              </div>
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                    <Soup className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                    Sopa
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-white transition cursor-pointer"
                                      title="Editar sopa"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
                                    title="Eliminar sopa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="p-3">
                              <h5 className="text-xs font-black text-slate-900">{plato.nombre}</h5>
                              {plato.descripcion && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                              )}
                              {plato.colegioNombre && (
                                <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                                  {plato.colegioNombre}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. ENSALADAS */}
                  <div className="p-4 bg-emerald-50/40 border border-emerald-200/70 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Salad className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            Ensaladas ({platosEnsalada.length})
                          </h4>
                          <span className="text-[10px] text-emerald-700 font-medium">Incluidas en el menú escolar</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModoRegistroMenu('MENU');
                          setTipoSeleccionadoMenu('Ensalada');
                          setSubtipoEntradaMenu('Ensalada');
                          setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Añadir una nueva ensalada"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir Ensalada
                      </button>
                    </div>

                    {platosEnsalada.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-emerald-200 rounded-xl bg-white/60">
                        <p className="text-xs text-emerald-800 font-medium">No hay ensaladas registradas para este día.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Ensalada');
                            setSubtipoEntradaMenu('Ensalada');
                            setTimeout(() => document.getElementById('nombre-entrada-menu')?.focus(), 50);
                          }}
                          className="mt-1.5 text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Registrar una ensalada
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {platosEnsalada.map((plato) => (
                          <div
                            key={plato.id}
                            className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-emerald-300 transition"
                          >
                            {plato.imagenUrl ? (
                              <div className="h-28 bg-slate-100 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                {plato.imagenUrl.includes('cloudinary') && (
                                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                    <Cloud className="w-2.5 h-2.5 text-emerald-400" /> Cloudinary
                                  </span>
                                )}
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1.5 bg-white/90 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl shadow-xs transition cursor-pointer"
                                      title="Editar ensalada"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                                    title="Eliminar ensalada"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-xs">
                                  Ensalada
                                </span>
                              </div>
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <Salad className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                    Ensalada
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white transition cursor-pointer"
                                      title="Editar ensalada"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
                                    title="Eliminar ensalada"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="p-3">
                              <h5 className="text-xs font-black text-slate-900">{plato.nombre}</h5>
                              {plato.descripcion && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                              )}
                              {plato.colegioNombre && (
                                <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                                  {plato.colegioNombre}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. SEGUNDOS (PLATOS DE FONDO) */}
                  <div className="p-4 bg-orange-50/40 border border-orange-200/70 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            Segundos (Platos de Fondo) ({platosSegundo.length})
                          </h4>
                          <span className="text-[10px] text-orange-700 font-medium">Platos principales del menú</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModoRegistroMenu('MENU');
                          setTipoSeleccionadoMenu('Segundo');
                          setTimeout(() => document.getElementById('nombre-segundo-menu')?.focus(), 50);
                        }}
                        className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Añadir un nuevo plato de fondo"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir Segundo
                      </button>
                    </div>

                    {platosSegundo.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-orange-200 rounded-xl bg-white/60">
                        <p className="text-xs text-orange-800 font-medium">No hay segundos registrados para este día.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setModoRegistroMenu('MENU');
                            setTipoSeleccionadoMenu('Segundo');
                            setTimeout(() => document.getElementById('nombre-segundo-menu')?.focus(), 50);
                          }}
                          className="mt-1.5 text-xs text-orange-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Registrar un plato de fondo
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {platosSegundo.map((plato) => (
                          <div
                            key={plato.id}
                            className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-orange-300 transition"
                          >
                            {plato.imagenUrl ? (
                              <div className="h-32 bg-slate-100 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={plato.imagenUrl} alt={plato.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                {plato.imagenUrl.includes('cloudinary') && (
                                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                    <Cloud className="w-2.5 h-2.5 text-emerald-400" /> Cloudinary
                                  </span>
                                )}
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1.5 bg-white/90 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl shadow-xs transition cursor-pointer"
                                      title="Editar plato"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                                    title="Eliminar plato"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black rounded-lg">
                                  Menú S/ {plato.precio.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                                    <Utensils className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                    Menú S/ {plato.precio.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {onIniciarEditarPlato && (
                                    <button
                                      type="button"
                                      onClick={() => onIniciarEditarPlato(plato)}
                                      className="p-1 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-white transition cursor-pointer"
                                      title="Editar plato"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSolicitarEliminarPlato(plato)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
                                    title="Eliminar plato"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="p-3">
                              <h5 className="text-xs font-black text-slate-900">{plato.nombre}</h5>
                              {plato.descripcion && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{plato.descripcion}</p>
                              )}
                              {plato.colegioNombre && (
                                <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                                  {plato.colegioNombre}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BLOQUE: EXTRAS Y ADICIONALES (BEBIDAS, POSTRES, REFRIGERIOS) */}
              {platosExtras.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-purple-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Extras y Adicionales de {diaActivo} ({platosExtras.length})
                    </h3>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      Precio individual
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {platosExtras.map((extra) => (
                      <div
                        key={extra.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-purple-200 transition"
                      >
                        {extra.imagenUrl ? (
                          <div className="h-28 bg-slate-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={extra.imagenUrl} alt={extra.nombre} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            {extra.imagenUrl.includes('cloudinary') && (
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded flex items-center gap-1" title="Alojada en Cloudinary">
                                <Cloud className="w-2.5 h-2.5 text-emerald-400" /> Cloudinary
                              </span>
                            )}
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                              {onIniciarEditarPlato && (
                                <button
                                  type="button"
                                  onClick={() => onIniciarEditarPlato(extra)}
                                  className="p-1.5 bg-white/90 hover:bg-purple-50 text-slate-600 hover:text-purple-600 rounded-xl shadow-xs transition cursor-pointer"
                                  title="Editar extra"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSolicitarEliminarPlato(extra)}
                                className="p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                                title="Eliminar extra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-700 text-white text-[10px] font-black rounded-lg">
                              S/ {extra.precio.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-gradient-to-r from-purple-50 to-slate-50 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                {extra.tipo.toLowerCase().includes('bebida') ? (
                                  <Coffee className="w-4 h-4" />
                                ) : extra.tipo.toLowerCase().includes('postre') ? (
                                  <Apple className="w-4 h-4" />
                                ) : (
                                  <Tag className="w-4 h-4" />
                                )}
                              </div>
                              <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                                {extra.tipo} • S/ {extra.precio.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {onIniciarEditarPlato && (
                                <button
                                  type="button"
                                  onClick={() => onIniciarEditarPlato(extra)}
                                  className="p-1 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-white transition cursor-pointer"
                                  title="Editar extra"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSolicitarEliminarPlato(extra)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
                                title="Eliminar extra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="p-3">
                          <h5 className="text-xs font-black text-slate-900">{extra.nombre}</h5>
                          {extra.descripcion && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{extra.descripcion}</p>
                          )}
                          {extra.colegioNombre && (
                            <span className="inline-block mt-2 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                              {extra.colegioNombre}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN DE PLATO / MENÚ */}
      {platoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Editar Plato del Menú</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {platoEditando.diaSemana} • {platoEditando.colegioNombre || 'Todos los colegios'}
                  </p>
                </div>
              </div>
              {onCerrarEditarPlato && (
                <button
                  type="button"
                  onClick={onCerrarEditarPlato}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Plato *</label>
                <input
                  type="text"
                  value={platoEditando.nombre}
                  onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, nombre: e.target.value } : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* TIPO Y PRECIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría / Tipo</label>
                  <input
                    type="text"
                    value={platoEditando.tipo}
                    onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, tipo: e.target.value } : null)}
                    placeholder="Ej. Sopa, Ensalada, Segundo, Bebida..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio (S/) *</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">S/</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={platoEditando.precio}
                      onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, precio: parseFloat(e.target.value) || 0 } : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  value={platoEditando.descripcion || ''}
                  onChange={(e) => setPlatoEditando?.((prev) => prev ? { ...prev, descripcion: e.target.value } : null)}
                  placeholder="Detalles sobre ingredientes, guarnición o preparación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              {/* FOTOGRAFÍA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Fotografía del Plato
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-500" /> Cloudinary
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFotoUploadEdicion}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 cursor-pointer"
                />
                {subiendoFotoEdicion && (
                  <p className="text-[11px] text-orange-600 mt-1 animate-pulse flex items-center gap-1.5 font-bold">
                    <Cloud className="w-3.5 h-3.5 animate-bounce text-orange-500" /> Subiendo y optimizando imagen en Cloudinary...
                  </p>
                )}
                {platoEditando.imagenUrl && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={platoEditando.imagenUrl} alt="Vista previa del plato" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {platoEditando.imagenUrl.includes('cloudinary') && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs">
                        <Cloud className="w-3 h-3 text-white" /> En Cloudinary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPlatoEditando?.((prev) => prev ? { ...prev, imagenUrl: undefined } : null)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg shadow-xs transition cursor-pointer"
                      title="Quitar fotografía"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* DISPONIBILIDAD */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Estado de disponibilidad</span>
                  <span className="text-[10px] text-slate-500">
                    {platoEditando.disponible ? 'Disponible para que los padres lo elijan' : 'Marcado como agotado'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlatoEditando?.((prev) => prev ? { ...prev, disponible: !prev.disponible } : null)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    platoEditando.disponible
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {platoEditando.disponible ? 'Disponible' : 'Agotado'}
                </button>
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCerrarEditarPlato}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionPlato}
                  className="px-5 py-2 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {guardandoEdicionPlato ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
