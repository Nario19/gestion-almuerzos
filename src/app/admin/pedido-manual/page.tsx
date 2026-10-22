'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  FileText,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
  PackageCheck,
  ChefHat,
  Receipt,
  PlusCircle,
  Utensils,
  Salad,
  Search,
  History,
  X,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dataService, DIAS_SEMANA } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import {
  obtenerFechaHoyPeru,
  obtenerDiaActualSemanaPeru,
  formatearFechaLegiblePeru,
  obtenerFechaParaDiaSemana,
} from '@/lib/dateUtils';
import { Plato, MetodoPago, EstadoPago, DiaSemana, Pedido } from '@/types';

export interface AlumnoManualGuardado {
  id: string;
  nombreCompleto: string;
  gradoSeccion: string;
  colegioNombre: string;
  padreNombre?: string;
  telefonoContacto?: string;
  fechaUltimoPedido: string;
}

const STORAGE_KEY_ALUMNOS_MANUALES = 'alumnos_pedidos_manuales_v1';

export default function PedidoManualPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();
  const fechaHoy = useMemo(() => obtenerFechaHoyPeru(), []);

  // Listas maestras
  const [colegios, setColegios] = useState<string[]>([]);
  const [grados, setGrados] = useState<string[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Alumnos guardados SOLO de pedidos manuales de esta página
  const [alumnosGuardados, setAlumnosGuardados] = useState<AlumnoManualGuardado[]>([]);
  const [mostrarDropdownSugerencias, setMostrarDropdownSugerencias] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Formulario
  const [colegioSeleccionado, setColegioSeleccionado] = useState<string>('');
  const [fecha, setFecha] = useState<string>(fechaHoy);
  const [estudianteNombre, setEstudianteNombre] = useState('');
  const [gradoSeccion, setGradoSeccion] = useState('');
  const [gradoPersonalizado, setGradoPersonalizado] = useState(false);
  const [segundoNombre, setSegundoNombre] = useState('');
  const [platoPersonalizado, setPlatoPersonalizado] = useState(false);
  const [entradaNombre, setEntradaNombre] = useState('Sin entrada');
  const [ensaladaNombre, setEnsaladaNombre] = useState('Sin ensalada');
  const [observacion, setObservacion] = useState('');
  const [observacionesDisponibles, setObservacionesDisponibles] = useState<string[]>([]);
  const [padreNombre, setPadreNombre] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [monto, setMonto] = useState<number>(12);

  // Estados de proceso
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);

  // Cargar lista de alumnos guardados desde localStorage al montar
  useEffect(() => {
    try {
      const guardadosStr = localStorage.getItem(STORAGE_KEY_ALUMNOS_MANUALES);
      if (guardadosStr) {
        const parsed: AlumnoManualGuardado[] = JSON.parse(guardadosStr);
        if (Array.isArray(parsed)) {
          setAlumnosGuardados(parsed);
        }
      }
    } catch (e) {
      console.warn('Error al cargar alumnos manuales guardados:', e);
    }
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMostrarDropdownSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Día actual escolar de hoy en Perú
  const diaActualSemana = useMemo(() => obtenerDiaActualSemanaPeru(), []);

  // Estado del día escolar seleccionado (LUNES a VIERNES)
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>(() => {
    try {
      const d = new Date(`${fechaHoy}T12:00:00-05:00`);
      return obtenerDiaActualSemanaPeru(d);
    } catch (_) {
      return 'LUNES';
    }
  });

  // Manejador para cambio de fecha calendario (sincroniza el día automáticamente)
  const handleCambiarFecha = (nuevaFecha: string) => {
    setFecha(nuevaFecha);
    try {
      const d = new Date(`${nuevaFecha}T12:00:00-05:00`);
      setDiaSeleccionado(obtenerDiaActualSemanaPeru(d));
    } catch (_) {}
  };

  // Manejador para selección directa de día (sincroniza la fecha automáticamente)
  const handleSeleccionarDia = (dia: DiaSemana) => {
    setDiaSeleccionado(dia);
    const nuevaFecha = obtenerFechaParaDiaSemana(dia, fecha || fechaHoy);
    setFecha(nuevaFecha);
  };

  // Alias para mantener compatibilidad total con referencias existentes
  const diaSemanaCalculado = diaSeleccionado;

  // Cargar lista de colegios
  useEffect(() => {
    if (!esAdmin) return;
    let cancelado = false;

    if (esSuperAdmin) {
      dataService.obtenerColegios().then((cols) => {
        if (!cancelado && cols && cols.length > 0) {
          setColegios(cols);
          if (!colegioSeleccionado || !cols.includes(colegioSeleccionado)) {
            setColegioSeleccionado(cols[0]);
          }
        }
      });
    } else if (usuario?.colegioNombre) {
      setColegioSeleccionado(usuario.colegioNombre);
      setColegios([usuario.colegioNombre]);
    }

    return () => {
      cancelado = true;
    };
  }, [esAdmin, esSuperAdmin, usuario?.colegioNombre]);

  // Cargar grados y platos cuando cambia el colegio o el día escolar
  useEffect(() => {
    if (!colegioSeleccionado) return;
    let cancelado = false;
    setCargandoDatos(true);

    Promise.all([
      dataService.obtenerGrados(colegioSeleccionado),
      dataService.obtenerPlatosPorDia(diaSemanaCalculado, colegioSeleccionado),
      dataService.obtenerObservaciones(colegioSeleccionado),
    ])
      .then(([resGrados, resPlatos, resObs]) => {
        if (cancelado) return;
        setGrados(resGrados || []);
        setObservacionesDisponibles(resObs || []);
        if (resGrados && resGrados.length > 0 && !resGrados.includes(gradoSeccion) && !gradoPersonalizado) {
          setGradoSeccion(resGrados[0]);
        }

        const platosLista = resPlatos || [];
        setPlatos(platosLista);

        const segundos = platosLista.filter(
          (p) => (p.tipo || '').toUpperCase() === 'SEGUNDO' || !(p.tipo || '').toUpperCase().includes('ENTRADA')
        );

        // Si no hay segundo seleccionado o el actual ya no está en este día, pre-seleccionar el primero
        if (!platoPersonalizado) {
          if (segundos.length > 0) {
            const encontrado = segundos.find((s) => s.nombre === segundoNombre);
            if (!encontrado) {
              setSegundoNombre(segundos[0].nombre);
              setMonto(segundos[0].precio || 12);
            }
          } else {
            setSegundoNombre('');
          }
        }
      })
      .catch((e) => {
        console.error('Error cargando grados y platos del colegio:', e);
      })
      .finally(() => {
        if (!cancelado) setCargandoDatos(false);
      });

    return () => {
      cancelado = true;
    };
  }, [colegioSeleccionado, diaSemanaCalculado]);

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin) {
    return (
      <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal administrativo y Superadmin." />
    );
  }

  // Filtrar platos por tipo (Entrada, Segundo, Ensalada)
  const esPlatoEnsalada = (p: Plato) => {
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    return t === 'ensalada' || d.includes('[ensalada]') || n.includes('ensalada');
  };
  const esPlatoEntrada = (p: Plato) => {
    if (esPlatoEnsalada(p)) return false;
    const s = (p.tipo || '').toLowerCase().trim();
    return s === 'entrada' || s.includes('sopa') || s.includes('postre') || s.includes('caldo') || s.includes('crema');
  };
  const esPlatoSegundo = (p: Plato) => {
    if (esPlatoEnsalada(p)) return false;
    const s = (p.tipo || '').toLowerCase().trim();
    return s === 'segundo' || (!esPlatoEntrada(p) && s !== 'bebida');
  };

  const platosEnsaladas = platos.filter(esPlatoEnsalada);
  const platosEntradas = platos.filter(esPlatoEntrada);
  const platosSegundos = platos.filter(esPlatoSegundo);

  // Alumnos manuales filtrados por el colegio actual
  const alumnosDelColegio = alumnosGuardados.filter(
    (a) => !colegioSeleccionado || a.colegioNombre.trim().toLowerCase() === colegioSeleccionado.trim().toLowerCase()
  );

  // Sugerencias interactivas según lo que tipea el admin
  const sugerenciasAlumnos = estudianteNombre.trim()
    ? alumnosDelColegio.filter((a) =>
        a.nombreCompleto.toLowerCase().includes(estudianteNombre.trim().toLowerCase())
      )
    : alumnosDelColegio.slice(0, 5);

  const seleccionarAlumnoGuardado = (alumno: AlumnoManualGuardado) => {
    setEstudianteNombre(alumno.nombreCompleto);
    if (alumno.gradoSeccion) {
      setGradoSeccion(alumno.gradoSeccion);
      if (grados.length > 0 && !grados.includes(alumno.gradoSeccion)) {
        setGradoPersonalizado(true);
      } else {
        setGradoPersonalizado(false);
      }
    }
    if (alumno.padreNombre) setPadreNombre(alumno.padreNombre);
    if (alumno.telefonoContacto) setTelefonoContacto(alumno.telefonoContacto);
    setMostrarDropdownSugerencias(false);
  };

  const eliminarAlumnoManual = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtrados = alumnosGuardados.filter((a) => a.id !== id);
    setAlumnosGuardados(filtrados);
    try {
      localStorage.setItem(STORAGE_KEY_ALUMNOS_MANUALES, JSON.stringify(filtrados));
    } catch (_) {}
  };

  const guardarAlumnoManual = (nuevo: Omit<AlumnoManualGuardado, 'id' | 'fechaUltimoPedido'>) => {
    try {
      const id = `${nuevo.colegioNombre.trim().toLowerCase()}__${nuevo.nombreCompleto.trim().toLowerCase()}`;
      const copia = [...alumnosGuardados];
      const index = copia.findIndex((a) => a.id === id);
      const registro: AlumnoManualGuardado = {
        id,
        nombreCompleto: nuevo.nombreCompleto.trim().toUpperCase(),
        gradoSeccion: nuevo.gradoSeccion.trim(),
        colegioNombre: nuevo.colegioNombre.trim(),
        padreNombre: nuevo.padreNombre?.trim(),
        telefonoContacto: nuevo.telefonoContacto?.trim(),
        fechaUltimoPedido: new Date().toISOString(),
      };

      if (index >= 0) {
        copia[index] = registro;
      } else {
        copia.unshift(registro);
      }

      // Máximo 50 alumnos guardados para rendimiento óptimo
      const finalAlumnos = copia.slice(0, 50);
      setAlumnosGuardados(finalAlumnos);
      localStorage.setItem(STORAGE_KEY_ALUMNOS_MANUALES, JSON.stringify(finalAlumnos));
    } catch (e) {
      console.warn('Error guardando alumno manual:', e);
    }
  };

  const reiniciarFormulario = () => {
    setEstudianteNombre('');
    setObservacion('');
    setPadreNombre('');
    setTelefonoContacto('');
    setPedidoCreado(null);
    setError(null);
    setPlatoPersonalizado(false);
  };

  const formatearNombre = (texto: string) => {
    return texto
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const estudiante = estudianteNombre.trim();
    const grado = gradoSeccion.trim();
    const segundo = segundoNombre.trim();
    const colegio = colegioSeleccionado.trim();

    if (!estudiante) {
      setError('Por favor escribe el nombre de la alumna o alumno.');
      return;
    }
    if (!colegio) {
      setError('Por favor selecciona un colegio.');
      return;
    }
    if (!grado) {
      setError('Por favor selecciona o especifica el grado y sección.');
      return;
    }
    if (!segundo) {
      setError('Por favor selecciona o escribe el plato principal (segundo).');
      return;
    }

    setGuardando(true);
    try {
      const estadoPagoFinal: EstadoPago = metodoPago === 'Pagar luego' ? 'PENDIENTE' : 'PAGADO';

      const nuevoPedido = await dataService.crearPedido({
        colegioNombre: colegio,
        gradoSeccion: grado,
        estudianteNombre: estudiante.toUpperCase(),
        telefonoContacto: telefonoContacto.trim() || '999999999',
        entradaNombre: entradaNombre.trim() || 'Sin entrada',
        segundoNombre: segundo,
        ensaladaNombre: ensaladaNombre.trim() || 'Sin ensalada',
        observacion: observacion.trim() || undefined,
        metodoPago: metodoPago,
        estadoPago: estadoPagoFinal,
        monto: Number(monto) || 12,
        fecha: fecha,
        diaSemana: diaSemanaCalculado,
        padreNombre: padreNombre.trim() ? formatearNombre(padreNombre.trim()) : 'Atención en ventanilla / Tutor',
      });

      // GUARDAR EN STORAGE EXCLUSIVAMENTE PARA ESTA PÁGINA
      guardarAlumnoManual({
        nombreCompleto: estudiante.toUpperCase(),
        gradoSeccion: grado,
        colegioNombre: colegio,
        padreNombre: padreNombre.trim() ? formatearNombre(padreNombre.trim()) : undefined,
        telefonoContacto: telefonoContacto.trim() || undefined,
      });

      setPedidoCreado(nuevoPedido);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    } catch (err: unknown) {
      console.error('Error al registrar pedido manual:', err);
      const msg = err instanceof Error ? err.message : 'Error al registrar el pedido.';
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Cabecera */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Toma de Pedido Manual
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Registro directo de almuerzos escolares para ventanilla, familiares o personas mayores sin acceso al sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {esSuperAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Global
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Building2 className="w-3.5 h-3.5" /> {usuario?.colegioNombre || 'Colegio'}
            </span>
          )}
        </div>
      </div>

      {/* Pantalla de Confirmación de Éxito */}
      {pedidoCreado ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 text-center space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider mb-2">
              Pedido Registrado con Éxito
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              #{pedidoCreado.codigoPedido}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Almuerzo programado para el día{' '}
              <strong className="text-slate-900">
                {formatearFechaLegiblePeru(pedidoCreado.fecha || fecha)}
              </strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto text-left text-xs sm:text-sm space-y-2 border border-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Alumna / Alumno:</span>
              <strong className="text-slate-900 font-black uppercase">
                {pedidoCreado.estudianteNombre}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Colegio / Grado:</span>
              <span className="text-slate-800 font-bold">
                {pedidoCreado.colegioNombre} — {pedidoCreado.gradoSeccion}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Plato Principal:</span>
              <strong className="text-emerald-700 font-black">
                {pedidoCreado.segundoNombre}
              </strong>
            </div>
            {pedidoCreado.entradaNombre && pedidoCreado.entradaNombre !== 'Sin entrada' && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Sopa / Entrada:</span>
                <span className="text-slate-800 font-bold">
                  {pedidoCreado.entradaNombre}
                </span>
              </div>
            )}
            {pedidoCreado.ensaladaNombre && pedidoCreado.ensaladaNombre !== 'Sin ensalada' && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Ensalada:</span>
                <span className="text-slate-800 font-bold">
                  {pedidoCreado.ensaladaNombre}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Método de Pago:</span>
              <span className="inline-flex items-center gap-1 font-black text-slate-900">
                {pedidoCreado.metodoPago} ({pedidoCreado.estadoPago === 'PAGADO' ? 'Pagado' : 'Pendiente / Fiado'})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Total Cobrado:</span>
              <strong className="text-emerald-700 font-black text-base">
                S/ {Number(pedidoCreado.monto || 12).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={reiniciarFormulario}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Tomar Otro Pedido Manual
            </button>
            <Link
              href="/admin/despacho"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-blue-600" /> Ir a Despacho
            </Link>
            <Link
              href="/admin/cocina"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-amber-600" /> Ir a Cocina
            </Link>
          </div>
        </div>
      ) : (
        /* Formulario Principal de Pedido Manual */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SELECCIÓN DE COLEGIO, DÍA Y FECHA */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            {/* Fila 1: Colegio y Fecha Calendario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colegio */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Colegio / Institución *
                </label>
                {esSuperAdmin ? (
                  <select
                    value={colegioSeleccionado}
                    onChange={(e) => setColegioSeleccionado(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                    required
                  >
                    {colegios.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800">
                    {colegioSeleccionado || usuario?.colegioNombre || 'Colegio Asignado'}
                  </div>
                )}
              </div>

              {/* Fecha de Consumo */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Fecha del Almuerzo *
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 capitalize">
                    {diaSeleccionado.toLowerCase()} ({formatearFechaLegiblePeru(fecha)})
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => handleCambiarFecha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCambiarFecha(fechaHoy)}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                      fecha === fechaHoy
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Seleccionar fecha actual de hoy"
                  >
                    Hoy
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Selector Rápido de Días de la Semana Escolar (LUNES A VIERNES) */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Seleccionar Día de la Semana *
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Menú programado para el <strong className="text-emerald-700 uppercase">{diaSeleccionado}</strong>
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const activo = diaSeleccionado === dia.key;
                  const esHoy = diaActualSemana === dia.key;
                  return (
                    <button
                      key={dia.key}
                      type="button"
                      onClick={() => handleSeleccionarDia(dia.key)}
                      className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border ${
                        activo
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm leading-tight">{dia.label}</span>
                      {esHoy && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md mt-0.5 ${
                            activo ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Hoy
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. DATOS DE LA ALUMNA/O CON SUGERENCIAS DE PEDIDOS MANUALES PREVIOS */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input de Estudiante con Dropdown Inteligente de Guardados */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Nombre de la Alumna / Alumno *
                  </span>
                  {alumnosDelColegio.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> {alumnosDelColegio.length} guardado(s)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej. Sofía Valenzuela Mendoza"
                    value={estudianteNombre}
                    onChange={(e) => {
                      setEstudianteNombre(e.target.value.toUpperCase());
                      setMostrarDropdownSugerencias(true);
                    }}
                    onFocus={() => setMostrarDropdownSugerencias(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    required
                  />
                  {estudianteNombre && (
                    <button
                      type="button"
                      onClick={() => setEstudianteNombre('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown de Sugerencias de Alumnos Manuales Guardados */}
                {mostrarDropdownSugerencias && sugerenciasAlumnos.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border border-slate-200 shadow-lg p-2 max-h-56 overflow-y-auto animate-in fade-in">
                    <div className="text-[10px] font-black uppercase text-slate-400 px-2.5 py-1 flex items-center justify-between">
                      <span>Alumnos Registrados en Pedidos Manuales</span>
                      <span>Clic para autocompletar</span>
                    </div>
                    {sugerenciasAlumnos.map((alum) => (
                      <div
                        key={alum.id}
                        onClick={() => seleccionarAlumnoGuardado(alum)}
                        className="p-2 hover:bg-emerald-50 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 border border-transparent hover:border-emerald-200"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase">
                            {alum.nombreCompleto}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Grado: <strong>{alum.gradoSeccion}</strong></span>
                            {alum.padreNombre && <span>• Tutor: {alum.padreNombre}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => eliminarAlumnoManual(alum.id, e)}
                            className="p-1 text-slate-300 hover:text-rose-600 transition"
                            title="Quitar de la lista de alumnos manuales guardados"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grado y Sección */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Grado y Sección *
                  </label>
                  <button
                    type="button"
                    onClick={() => setGradoPersonalizado(!gradoPersonalizado)}
                    className="text-[11px] text-emerald-700 hover:underline font-bold"
                  >
                    {gradoPersonalizado ? 'Elegir de lista' : '+ Otro Grado'}
                  </button>
                </div>

                {gradoPersonalizado ? (
                  <input
                    type="text"
                    placeholder="Ej. 3.° Primaria B"
                    value={gradoSeccion}
                    onChange={(e) => setGradoSeccion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    required
                  />
                ) : (
                  <select
                    value={gradoSeccion}
                    onChange={(e) => setGradoSeccion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                  >
                    {grados.length === 0 && <option value="">Sin grados registrados</option>}
                    {grados.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Fila de Chips Rápidos con Alumnos de Pedidos Manuales Anteriores */}
            {alumnosDelColegio.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-emerald-600" /> Alumnos frecuentes en ventanilla (haz clic para rellenar datos):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {alumnosDelColegio.map((alum) => (
                    <button
                      key={alum.id}
                      type="button"
                      onClick={() => seleccionarAlumnoGuardado(alum)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        estudianteNombre.toUpperCase() === alum.nombreCompleto.toUpperCase()
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <span>{alum.nombreCompleto}</span>
                      <span className="text-[10px] opacity-75">({alum.gradoSeccion})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. SELECCIÓN DE ALMUERZO: CARTA IDÉNTICA AL MENÚ SEMANAL */}
          <div className="space-y-6 pb-4 border-b border-slate-100">
            {/* Encabezado de la Carta del Día */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" /> Carta del Menú Escolar ({diaSemanaCalculado})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Platos programados para el colegio {colegioSeleccionado} en el día {diaSemanaCalculado.toLowerCase()}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlatoPersonalizado(!platoPersonalizado)}
                className="text-xs text-emerald-700 hover:underline font-bold"
              >
                {platoPersonalizado ? 'Elegir del Menú' : '+ Plato Especial'}
              </button>
            </div>

            {/* SECCIÓN 1: SOPA O POSTRE (ENTRADA) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" /> 1. Sopa o Postre (Entrada)
                </label>
                <span className="text-[11px] font-bold text-slate-500">Incluida en el menú</span>
              </div>

              {cargandoDatos ? (
                <div className="text-xs text-slate-400 py-4 text-center">Cargando opciones de entrada...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Opción Sin Entrada */}
                  <button
                    type="button"
                    onClick={() => setEntradaNombre('Sin entrada')}
                    className={`text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      entradaNombre === 'Sin entrada'
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opción</span>
                        {entradaNombre === 'Sin entrada' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-black text-xs sm:text-sm text-slate-800 mt-1">Sin entrada / sopa</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Solo plato de fondo</p>
                    </div>
                  </button>

                  {/* Entradas del Día */}
                  {platosEntradas.map((ent) => {
                    const seleccionada = entradaNombre === ent.nombre;
                    return (
                      <button
                        key={ent.id}
                        type="button"
                        onClick={() => setEntradaNombre(ent.nombre)}
                        className={`text-left rounded-2xl border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                          seleccionada
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="h-24 w-full bg-slate-100 relative">
                          {ent.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ent.imagenUrl} alt={ent.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Utensils className="w-6 h-6" />
                            </div>
                          )}
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            Sopa o postre
                          </span>
                          {seleccionada && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{ent.nombre}</div>
                            {ent.descripcion && (
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{ent.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: PLATO DE FONDO (SEGUNDO) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" /> 2. Plato de Fondo (Segundo) *
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  S/ {monto.toFixed(2)}
                </span>
              </div>

              {platoPersonalizado ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900">
                    Escribir Plato Especial / Personalizado:
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Tallarines Verdes con Bistec"
                    value={segundoNombre}
                    onChange={(e) => setSegundoNombre(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600">Precio (S/):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={monto}
                      onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              ) : cargandoDatos ? (
                <div className="text-xs text-slate-400 py-6 text-center">Cargando platos de fondo...</div>
              ) : platosSegundos.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  No hay platos de fondo configurados para el {diaSemanaCalculado.toLowerCase()} en {colegioSeleccionado}. Puedes escribir uno personalizado con el botón superior.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {platosSegundos.map((seg) => {
                    const seleccionado = segundoNombre === seg.nombre;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => {
                          setSegundoNombre(seg.nombre);
                          setMonto(seg.precio || 12);
                        }}
                        className={`text-left rounded-2xl border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                          seleccionado
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="h-28 w-full bg-slate-100 relative">
                          {seg.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={seg.imagenUrl} alt={seg.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <UtensilsCrossed className="w-8 h-8" />
                            </div>
                          )}
                          <span className="absolute top-1.5 left-1.5 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            Segundo
                          </span>
                          {seleccionado && (
                            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{seg.nombre}</div>
                            {seg.descripcion && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {seg.descripcion}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-700">
                              S/ {(seg.precio || 12).toFixed(2)}
                            </span>
                            {seleccionado && (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                Seleccionado
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: ENSALADA */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Salad className="w-3.5 h-3.5 text-emerald-600" /> 3. Ensalada
                </label>
                <span className="text-[11px] font-bold text-slate-500">Incluida en el menú</span>
              </div>

              {cargandoDatos ? (
                <div className="text-xs text-slate-400 py-4 text-center">Cargando opciones de ensalada...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Opción Sin Ensalada */}
                  <button
                    type="button"
                    onClick={() => setEnsaladaNombre('Sin ensalada')}
                    className={`text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      ensaladaNombre === 'Sin ensalada'
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opción</span>
                        {ensaladaNombre === 'Sin ensalada' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-black text-xs sm:text-sm text-slate-800 mt-1">Sin ensalada</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Omitir ensalada</p>
                    </div>
                  </button>

                  {/* Ensaladas del Día */}
                  {platosEnsaladas.map((ens) => {
                    const seleccionada = ensaladaNombre === ens.nombre;
                    return (
                      <button
                        key={ens.id}
                        type="button"
                        onClick={() => setEnsaladaNombre(ens.nombre)}
                        className={`text-left rounded-2xl border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                          seleccionada
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="h-24 w-full bg-slate-100 relative">
                          {ens.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ens.imagenUrl} alt={ens.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Salad className="w-6 h-6 text-emerald-500" />
                            </div>
                          )}
                          <span className="absolute top-1.5 left-1.5 bg-emerald-800/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            Ensalada
                          </span>
                          {seleccionada && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{ens.nombre}</div>
                            {ens.descripcion && (
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{ens.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Observaciones y Alergias */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Observaciones / Alergias del Alumno
                </label>
                {observacionesDisponibles.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Etiquetas de {colegioSeleccionado}
                  </span>
                )}
              </div>

              {/* Chips de Observaciones Rápidas del Colegio */}
              {observacionesDisponibles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {observacionesDisponibles.map((tag) => {
                    const partes = observacion
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const seleccionado = partes.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (seleccionado) {
                            setObservacion(partes.filter((s) => s !== tag).join(', '));
                          } else {
                            setObservacion(partes.length > 0 ? `${partes.join(', ')}, ${tag}` : tag);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none ${
                          seleccionado
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span>{tag}</span>
                        {seleccionado && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <input
                type="text"
                placeholder="Ej. Alérgica al maní, poco arroz, sin ensalada..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* 4. DATOS DEL SOLICITANTE / APODERADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Tutor / Familiar Solicitante
              </label>
              <input
                type="text"
                placeholder="Ej. Abuelita Carmen / Papá Pedro"
                value={padreNombre}
                onChange={(e) => setPadreNombre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Celular de Contacto (WhatsApp)
              </label>
              <input
                type="tel"
                placeholder="Ej. 987654321"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* 5. MÉTODO DE PAGO */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Método de Pago *
              </span>
              <span className="text-emerald-700 font-bold text-xs">
                Total: S/ {monto.toFixed(2)}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Efectivo', 'Yape', 'Plin', 'Pagar luego'] as MetodoPago[]).map((metodo) => {
                const activo = metodoPago === metodo;
                return (
                  <button
                    key={metodo}
                    type="button"
                    onClick={() => setMetodoPago(metodo)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      activo
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 font-bold text-xs'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{metodo}</div>
                    <div className={`text-[10px] mt-0.5 ${activo ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {metodo === 'Pagar luego' ? 'Fiado' : 'Cobro inmediato'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm sm:text-base transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registrando Pedido Manual...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar y Guardar Pedido Manual (S/ {monto.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
