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

  const cargarPlatos = async (dia: DiaSemana) => {
    setCargando(true);
    const data = await dataService.obtenerPlatosPorDia(dia);
    setPlatos(data);
    setCargando(false);
  };

  useEffect(() => {
    if (esAdmin) {
      cargarPlatos(diaActivo);
    }
  }, [diaActivo, esAdmin]);

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
    </div>
  );
}
