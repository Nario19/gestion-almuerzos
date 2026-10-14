'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Plus,
  Trash2,
  Building2,
  AlertTriangle,
  ArrowRight,
  User,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { dataService } from '@/lib/dataService';
import ModalConfirmacion from '@/components/ModalConfirmacion';

function HijosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const primeraVez = searchParams.get('primera_vez') === 'true';

  const { usuario, agregarHijo, eliminarHijo, cargando: cargandoAuth } = useAuth();

  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [nombreHijo, setNombreHijo] = useState('');
  const [listaColegios, setListaColegios] = useState<string[]>([]);
  const [listaGrados, setListaGrados] = useState<string[]>([]);
  const [colegio, setColegio] = useState('');
  const [grado, setGrado] = useState('');
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [hijoAEliminar, setHijoAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [eliminandoHijo, setEliminandoHijo] = useState(false);

  const confirmarEliminarHijo = async () => {
    if (!hijoAEliminar) return;
    setEliminandoHijo(true);
    try {
      await eliminarHijo(hijoAEliminar.id);
      setHijoAEliminar(null);
    } finally {
      setEliminandoHijo(false);
    }
  };

  useEffect(() => {
    let montado = true;
    const cargarConfiguraciones = async () => {
      try {
        const [cols, grds] = await Promise.all([
          dataService.obtenerColegios(),
          dataService.obtenerGrados(),
        ]);
        if (!montado) return;
        if (cols) {
          setListaColegios(cols);
          setColegio((prev) => (prev && cols.includes(prev) ? prev : cols[0] || ''));
        }
        if (grds) {
          setListaGrados(grds);
          setGrado((prev) => (prev && grds.includes(prev) ? prev : grds[0] || ''));
        }
      } finally {
        if (montado) setCargandoConfig(false);
      }
    };

    cargarConfiguraciones();
    const desuscribir = dataService.suscribirCambios(() => {
      cargarConfiguraciones();
    });

    return () => {
      montado = false;
      desuscribir();
    };
  }, []);

  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">
            Inicia sesión para gestionar a tus hijos
          </h2>
          <p className="text-xs text-slate-500">
            Regístrate o ingresa a tu cuenta para asociar a tus hijos y pedir sus menús escolares.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition"
          >
            Iniciar Sesión / Registrarse
          </Link>
        </div>
      </div>
    );
  }

  if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <GraduationCap className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">
            Sesión de Administrador
          </h2>
          <p className="text-xs text-slate-500">
            Esta sección es para que los padres gestionen a sus hijos estudiantes. Como administrador, puedes gestionar los menús, la cocina y los despachos.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
          >
            Ir a Gestión de Menú
          </Link>
        </div>
      </div>
    );
  }

  const handleCrearHijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreHijo.trim()) return;

    if (!colegio) {
      alert('Por favor selecciona un colegio válido.');
      return;
    }
    if (!grado) {
      alert('Por favor selecciona un grado válido.');
      return;
    }

    setGuardando(true);
    const res = await agregarHijo({
      nombreCompleto: nombreHijo.trim(),
      colegioNombre: colegio,
      gradoSeccion: grado,
    });
    setGuardando(false);

    if (res.ok) {
      setNombreHijo('');
      setMensajeExito('¡Hijo(a) registrado(a) con éxito!');
      setTimeout(() => setMensajeExito(null), 3000);
    } else {
      alert(res.error || 'Error al guardar');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-orange-500" />
            Estudiantes Registrados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Padre: {usuario.nombreCompleto} (DNI: {usuario.dni})
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-sm transition self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Ir al Menú Escolar
        </Link>
      </div>

      {primeraVez && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Cuenta creada con éxito! Ahora agrega a tu primer hijo para comenzar.</span>
        </div>
      )}

      {mensajeExito && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA 1: FORMULARIO PARA AGREGAR HIJO */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900">
              Registrar Nuevo Estudiante
            </h2>
          </div>

          <form onSubmit={handleCrearHijo} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombres y Apellidos *
              </label>
              <input
                type="text"
                placeholder="Ej. Dhana Quispe Cristobal"
                value={nombreHijo}
                onChange={(e) => setNombreHijo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Colegio *
              </label>
              {cargandoConfig ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 animate-pulse flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Cargando colegios disponibles...
                </div>
              ) : listaColegios.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  No hay colegios disponibles configurados por el administrador.
                </div>
              ) : (
                <select
                  value={colegio}
                  onChange={(e) => setColegio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  required
                >
                  {listaColegios.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grado y Sección *
              </label>
              {cargandoConfig ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 animate-pulse flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Cargando grados...
                </div>
              ) : listaGrados.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  No hay grados configurados.
                </div>
              ) : (
                <select
                  value={grado}
                  onChange={(e) => setGrado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  required
                >
                  {listaGrados.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={guardando || cargandoConfig || listaColegios.length === 0}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 transition disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : '+ Guardar Hijo'}
            </button>
          </form>
        </div>

        {/* COLUMNA 2: LISTA DE HIJOS REGISTRADOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Estudiantes Registrados ({usuario.hijos.length})
            </h2>
          </div>

          {usuario.hijos.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Aún no has registrado a tus hijos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Usa el formulario de la izquierda para agregar a tu primer hijo.
              </p>
            </div>
          ) : (
            usuario.hijos.map((hijo) => (
              <div
                key={hijo.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                      {hijo.nombreCompleto.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{hijo.nombreCompleto}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {hijo.colegioNombre} • <span className="text-orange-600 font-bold">{hijo.gradoSeccion}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setHijoAEliminar({ id: hijo.id, nombre: hijo.nombreCompleto })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Eliminar estudiante"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/?hijoId=${hijo.id}`}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <span>Pedir almuerzo para {hijo.nombreCompleto.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Alerta de Confirmación de Eliminación */}
      <ModalConfirmacion
        abierto={Boolean(hijoAEliminar)}
        onCerrar={() => setHijoAEliminar(null)}
        onConfirmar={confirmarEliminarHijo}
        cargando={eliminandoHijo}
        titulo={`¿Eliminar a ${hijoAEliminar?.nombre || 'estudiante'}?`}
        mensaje={
          <span>
            ¿Estás seguro de que deseas retirar a <strong>{hijoAEliminar?.nombre}</strong> del registro de tus hijos? No se afectarán los pedidos de almuerzos que ya hayas solicitado previamente.
          </span>
        }
        textoBotonConfirmar="Sí, eliminar estudiante"
        tipo="peligro"
      />
    </div>
  );
}

export default function HijosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando...</div>}>
      <HijosContent />
    </Suspense>
  );
}
