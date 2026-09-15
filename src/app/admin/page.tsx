'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Database,
  Cloud,
  Laptop,
  Clock,
  Sparkles,
  Utensils,
  DollarSign,
  Building2,
  GraduationCap,
  Tag,
  X,
} from 'lucide-react';
import { dataService, DIAS_SEMANA, obtenerDiaActualSemana } from '@/lib/dataService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompression';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { Plato, DiaSemana, TipoPlato } from '@/types';

export default function AdminPage() {
  const { esAdmin, cargando: cargandoAuth } = useAuth();
  const [diaActivo, setDiaActivo] = useState<DiaSemana>(obtenerDiaActualSemana());
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Formulario de nuevo plato
  const [tipoNuevo, setTipoNuevo] = useState<TipoPlato>('SEGUNDO');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [descripcionNueva, setDescripcionNueva] = useState('');
  const [precioNuevo, setPrecioNuevo] = useState('12.00');
  const [imagenUrlNueva, setImagenUrlNueva] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [tabActiva, setTabActiva] = useState<'menu' | 'colegios' | 'grados' | 'observaciones'>('menu');

  // Colegios
  const [colegios, setColegios] = useState<string[]>([]);
  const [nuevoColegio, setNuevoColegio] = useState('');

  // Grados
  const [grados, setGrados] = useState<string[]>([]);
  const [nuevoGrado, setNuevoGrado] = useState('');

  // Observaciones
  const [observaciones, setObservaciones] = useState<string[]>([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  const cargarPlatos = async (dia: DiaSemana) => {
    setCargando(true);
    const data = await dataService.obtenerPlatosPorDia(dia);
    setPlatos(data);
    setCargando(false);
  };

  useEffect(() => {
    if (esAdmin) {
      cargarPlatos(diaActivo);
      dataService.obtenerColegios().then(setColegios);
      dataService.obtenerGrados().then(setGrados);
      dataService.obtenerObservaciones().then(setObservaciones);
    }
  }, [diaActivo, esAdmin]);

  const handleAgregarColegio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoColegio.trim()) return;
    const res = await dataService.agregarColegio(nuevoColegio.trim());
    setColegios(res);
    setNuevoColegio('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  const handleEliminarColegio = async (nombre: string) => {
    if (!confirm(`¿Eliminar ${nombre}?`)) return;
    const res = await dataService.eliminarColegio(nombre);
    setColegios(res);
  };

  const handleAgregarGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGrado.trim()) return;
    const res = await dataService.agregarGrado(nuevoGrado.trim());
    setGrados(res);
    setNuevoGrado('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  const handleEliminarGrado = async (nombre: string) => {
    if (!confirm(`¿Eliminar ${nombre}?`)) return;
    const res = await dataService.eliminarGrado(nombre);
    setGrados(res);
  };

  const handleAgregarObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObservacion.trim()) return;
    const res = await dataService.agregarObservacion(nuevaObservacion.trim());
    setObservaciones(res);
    setNuevaObservacion('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  const handleEliminarObservacion = async (tag: string) => {
    if (!confirm(`¿Eliminar la etiqueta "${tag}"?`)) return;
    const res = await dataService.eliminarObservacion(tag);
    setObservaciones(res);
  };

  // Manejador para comprimir foto del plato antes de guardarla
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      setImagenUrlNueva(res.compressedDataUrl);
    } catch (e) {
      console.error('Error procesando foto:', e);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleCrearPlato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;

    const nuevo = await dataService.agregarPlato({
      diaSemana: diaActivo,
      tipo: tipoNuevo,
      nombre: nombreNuevo.trim(),
      descripcion: descripcionNueva.trim() || undefined,
      precio: tipoNuevo === 'ENTRADA' ? 0 : parseFloat(precioNuevo) || 12.0,
      imagenUrl: imagenUrlNueva || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      disponible: true,
      orden: platos.length + 1,
    });

    setPlatos((prev) => [...prev, nuevo]);
    setNombreNuevo('');
    setDescripcionNueva('');
    setImagenUrlNueva('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Seguro que deseas retirar este plato del catálogo?')) return;
    await dataService.eliminarPlato(id);
    setPlatos((prev) => prev.filter((p) => p.id !== id));
  };

  const entradas = platos.filter((p) => p.tipo === 'ENTRADA');
  const segundos = platos.filter((p) => p.tipo === 'SEGUNDO');

  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando credenciales...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para la administración del menú de Placeres Culinarios." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-orange-500" />
            Gestión del Menú
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> Supabase Activo
          </span>
        </div>
      </div>

      {guardadoExitoso && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          ¡Plato guardado con éxito! Ya está visible en el catálogo de los padres.
        </div>
      )}

      {/* Pestañas de Gestión Administrativa */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTabActiva('menu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            tabActiva === 'menu'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Menú Semanal
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('colegios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            tabActiva === 'colegios'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Colegios ({colegios.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('grados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            tabActiva === 'grados'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Grados y Secciones ({grados.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('observaciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            tabActiva === 'observaciones'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          Observaciones ({observaciones.length})
        </button>
      </div>

      {tabActiva === 'menu' && (
        <>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Plato</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoNuevo('ENTRADA')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    tipoNuevo === 'ENTRADA'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTipoNuevo('SEGUNDO')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    tipoNuevo === 'SEGUNDO'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Segundo
                </button>
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

            {tipoNuevo === 'SEGUNDO' && (
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
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-500/20 transition mt-2"
            >
              + Publicar en el Menú de {diaActivo}
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: LISTA DE PLATOS DEL DÍA CON FOTOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* ENTRADAS */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                Entradas de {diaActivo} ({entradas.length})
              </h3>
            </div>

            {entradas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay entradas para este día.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entradas.map((plato) => (
                  <div
                    key={plato.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between bg-slate-50/50"
                  >
                    <div className="h-24 bg-slate-200 relative">
                      {plato.imagenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={plato.imagenUrl} alt={plato.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <button
                        onClick={() => handleEliminar(plato.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-black text-slate-900">{plato.nombre}</h4>
                      {plato.descripcion && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{plato.descripcion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEGUNDOS */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-rose-500" />
                Segundos / Platos de Fondo de {diaActivo} ({segundos.length})
              </h3>
            </div>

            {segundos.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay segundos para este día.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {segundos.map((plato) => (
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
                        onClick={() => handleEliminar(plato.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl shadow-xs transition"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                        S/ {plato.precio.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-black text-slate-900">{plato.nombre}</h4>
                      {plato.descripcion && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{plato.descripcion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )}

      {/* PESTAÑA: COLEGIOS */}
      {tabActiva === 'colegios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulario nuevo colegio */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs h-fit">
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              Nuevo Colegio
            </h2>
            <form onSubmit={handleAgregarColegio} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre del Colegio *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Colegio Innova Schools"
                  value={nuevoColegio}
                  onChange={(e) => setNuevoColegio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Colegio
              </button>
            </form>
          </div>

          {/* Lista de colegios */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">
              Colegios Disponibles ({colegios.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {colegios.map((col) => (
                <div key={col} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{col}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarColegio(col)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Eliminar colegio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: GRADOS Y SECCIONES */}
      {tabActiva === 'grados' && (
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
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Grado / Sección
              </button>
            </form>
          </div>

          {/* Lista de grados */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">
              Grados y Secciones Activas ({grados.length})
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
                    onClick={() => handleEliminarGrado(g)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Eliminar grado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: OBSERVACIONES / RESTRICCIONES */}
      {tabActiva === 'observaciones' && (
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
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Etiqueta
              </button>
            </form>
          </div>

          {/* Lista de observaciones */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-slate-900 mb-2">
              Etiquetas Configuradas ({observaciones.length})
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
                    onClick={() => handleEliminarObservacion(tag)}
                    className="p-0.5 text-orange-400 hover:text-rose-600 transition"
                    title="Eliminar etiqueta"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
