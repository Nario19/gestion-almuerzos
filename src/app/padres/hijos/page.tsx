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
import { SkeletonHijosPage, Skeleton } from '@/components/Skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

  // Recargar grados específicos del colegio seleccionado
  useEffect(() => {
    if (colegio) {
      let montado = true;
      dataService.obtenerGrados(colegio).then((grds) => {
        if (!montado) return;
        if (grds) {
          setListaGrados(grds);
          setGrado((prev) => (prev && grds.includes(prev) ? prev : grds[0] || ''));
        }
      });
      return () => {
        montado = false;
      };
    }
  }, [colegio]);

  if (cargandoAuth) {
    return <SkeletonHijosPage />;
  }

  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <Card className="p-6 text-center space-y-4">
          <GraduationCap className="w-12 h-12 text-zinc-300 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">
            Inicia sesión para gestionar a tus hijos
          </h2>
          <p className="text-xs text-zinc-500">
            Regístrate o ingresa a tu cuenta para asociar a tus hijos y pedir sus menús escolares.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition"
          >
            Iniciar Sesión / Registrarse
          </Link>
        </Card>
      </div>
    );
  }

  if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <Card className="p-6 text-center space-y-4">
          <GraduationCap className="w-12 h-12 text-zinc-900 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">
            Sesión de Administrador
          </h2>
          <p className="text-xs text-zinc-500">
            Esta sección es para que los padres gestionen a sus hijos estudiantes. Como administrador, puedes gestionar los menús, la cocina y los despachos.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition"
          >
            Ir a Gestión de Menú
          </Link>
        </Card>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="sr-only">Mis Hijos</h1>
          <p className="text-xs text-zinc-500 font-medium">
            Padre: {usuario.nombreCompleto} (DNI: {usuario.dni})
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#010101] hover:bg-zinc-800 text-yellow-400 text-xs font-bold rounded-lg shadow-xs transition self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-yellow-400" />
          Ir al Menú Escolar
        </Link>
      </div>

      {primeraVez && (
        <div className="mb-6 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Cuenta creada con éxito! Ahora agrega a tu primer hijo para comenzar.</span>
        </div>
      )}

      {mensajeExito && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA 1: FORMULARIO PARA AGREGAR HIJO */}
        <Card className="h-fit">
          <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-zinc-950">
              Registrar Nuevo Hijo
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleCrearHijo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nombres y Apellidos *
                </label>
                <input
                  type="text"
                  placeholder="Ej. DHANA QUISPE CRISTOBAL"
                  value={nombreHijo}
                  onChange={(e) => setNombreHijo(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 uppercase font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" /> Colegio *
                </label>
                {cargandoConfig ? (
                  <Skeleton className="h-9 w-full rounded-lg" />
                ) : listaColegios.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No hay colegios disponibles configurados por el administrador.
                  </div>
                ) : (
                  <select
                    value={colegio}
                    onChange={(e) => setColegio(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                    required
                  >
                    {listaColegios.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Grado y Sección *
                </label>
                {cargandoConfig ? (
                  <Skeleton className="h-9 w-full rounded-lg" />
                ) : listaGrados.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No hay grados configurados.
                  </div>
                ) : (
                  <select
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                    required
                  >
                    {listaGrados.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                type="submit"
                disabled={guardando || cargandoConfig || listaColegios.length === 0}
                className="w-full bg-[#010101] hover:bg-zinc-800 text-yellow-400 font-bold shadow-xs cursor-pointer"
              >
                {guardando ? 'Guardando...' : '+ Agregar Hijo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* COLUMNA 2: LISTA DE HIJOS REGISTRADOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Hijos Registrados ({usuario.hijos.length})
            </h2>
          </div>

          {usuario.hijos.length === 0 ? (
            <Card className="p-8 text-center">
              <User className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-800">Aún no has registrado a tus hijos</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Usa el formulario de la izquierda para agregar a tu primer hijo.
              </p>
            </Card>
          ) : (
            usuario.hijos.map((hijo) => (
              <Card key={hijo.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-sm">
                      {hijo.nombreCompleto.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950">{hijo.nombreCompleto}</h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        {hijo.colegioNombre} • <span className="text-zinc-900 font-semibold">{hijo.gradoSeccion}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setHijoAEliminar({ id: hijo.id, nombre: hijo.nombreCompleto })}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                    title="Eliminar hijo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/?hijoId=${hijo.id}`}
                  className="w-full py-1.5 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <span>Pedir almuerzo para {hijo.nombreCompleto.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
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
        titulo={`¿Eliminar a ${hijoAEliminar?.nombre || 'hijo'}?`}
        mensaje={
          <span>
            ¿Estás seguro de que deseas retirar a <strong>{hijoAEliminar?.nombre}</strong> del registro de tus hijos? No se afectarán los pedidos de almuerzos que ya hayas solicitado previamente.
          </span>
        }
        textoBotonConfirmar="Sí, eliminar hijo"
        tipo="peligro"
      />
    </div>
  );
}

export default function HijosPage() {
  return (
    <Suspense fallback={<SkeletonHijosPage />}>
      <HijosContent />
    </Suspense>
  );
}
