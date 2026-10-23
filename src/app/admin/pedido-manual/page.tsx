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
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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

  // Manejador reactivo cuando el usuario hace clic en los botones de días de la semana
  const handleSeleccionarDia = (dia: DiaSemana) => {
    setDiaSeleccionado(dia);
    const nuevaFecha = obtenerFechaParaDiaSemana(dia, fechaHoy);
    setFecha(nuevaFecha);
  };

  // Sincronizar el selector de días si el usuario cambia el input nativo de fecha
  const handleCambiarFecha = (nuevaFecha: string) => {
    setFecha(nuevaFecha);
    try {
      const d = new Date(`${nuevaFecha}T12:00:00-05:00`);
      const diaCalculado = obtenerDiaActualSemanaPeru(d);
      setDiaSeleccionado(diaCalculado);
    } catch (_) {}
  };

  // Inicializar colegio asignado
  useEffect(() => {
    async function initColegio() {
      if (esSuperAdmin) {
        const lista = await dataService.obtenerColegios();
        setColegios(lista);
        if (lista.length > 0 && !colegioSeleccionado) {
          setColegioSeleccionado(lista[0]);
        }
      } else if (usuario?.colegioNombre) {
        setColegioSeleccionado(usuario.colegioNombre);
      }
    }
    initColegio();
  }, [esSuperAdmin, usuario, colegioSeleccionado]);

  // Cargar grados y observaciones según el colegio seleccionado
  useEffect(() => {
    if (!colegioSeleccionado) return;
    async function cargarGradosYObs() {
      const listaGrados = await dataService.obtenerGrados(colegioSeleccionado);
      setGrados(listaGrados);
      if (listaGrados.length > 0 && !gradoSeccion) {
        setGradoSeccion(listaGrados[0]);
      }
      const obs = await dataService.obtenerObservaciones(colegioSeleccionado);
      setObservacionesDisponibles(obs);
    }
    cargarGradosYObs();
  }, [colegioSeleccionado, gradoSeccion]);

  // Calcular el día de la semana escolar para la fecha seleccionada
  const diaSemanaCalculado = useMemo<DiaSemana>(() => {
    try {
      const d = new Date(`${fecha}T12:00:00-05:00`);
      return obtenerDiaActualSemanaPeru(d);
    } catch (_) {
      return diaSeleccionado;
    }
  }, [fecha, diaSeleccionado]);

  // Cargar platos del menú del día escolar para este colegio
  useEffect(() => {
    if (!colegioSeleccionado) return;
    async function cargarPlatos() {
      setCargandoDatos(true);
      try {
        const carta = await dataService.obtenerPlatosPorDia(diaSemanaCalculado, colegioSeleccionado);
        setPlatos(carta);

        const segundos = carta.filter((p) => (p.tipo || '').toLowerCase().trim() === 'segundo');
        if (segundos.length > 0 && !segundoNombre) {
          setSegundoNombre(segundos[0].nombre);
          setMonto(segundos[0].precio || 12);
        }
      } catch (err) {
        console.error('Error cargando platos del día:', err);
      } finally {
        setCargandoDatos(false);
      }
    }
    cargarPlatos();
  }, [colegioSeleccionado, diaSemanaCalculado, segundoNombre]);

  // Clasificación de la carta del día escolar
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

  const platosEntradas = useMemo(() => platos.filter(esSopa), [platos]);
  const platosEnsaladas = useMemo(() => platos.filter(esEnsalada), [platos]);
  const platosSegundos = useMemo(
    () => platos.filter((p) => (p.tipo || '').toLowerCase().trim() === 'segundo'),
    [platos]
  );

  // Sugerencias filtradas por el colegio actual y texto escrito
  const alumnosDelColegio = useMemo(() => {
    if (!colegioSeleccionado) return [];
    return alumnosGuardados.filter(
      (a) => a.colegioNombre.trim().toLowerCase() === colegioSeleccionado.trim().toLowerCase()
    );
  }, [alumnosGuardados, colegioSeleccionado]);

  const sugerenciasAlumnos = useMemo(() => {
    const query = estudianteNombre.trim().toLowerCase();
    if (!query) return alumnosDelColegio.slice(0, 8);
    return alumnosDelColegio
      .filter((a) => a.nombreCompleto.toLowerCase().includes(query))
      .slice(0, 8);
  }, [alumnosDelColegio, estudianteNombre]);

  const seleccionarAlumnoGuardado = (alumno: AlumnoManualGuardado) => {
    setEstudianteNombre(alumno.nombreCompleto);
    if (alumno.gradoSeccion) {
      setGradoSeccion(alumno.gradoSeccion);
    }
    if (alumno.padreNombre) {
      setPadreNombre(alumno.padreNombre);
    }
    if (alumno.telefonoContacto) {
      setTelefonoContacto(alumno.telefonoContacto);
    }
    setMostrarDropdownSugerencias(false);
  };

  const guardarAlumnoEnLocalStorage = (nuevoAlumno: AlumnoManualGuardado) => {
    try {
      setAlumnosGuardados((prev) => {
        const filtrados = prev.filter(
          (a) =>
            !(
              a.nombreCompleto.toLowerCase() === nuevoAlumno.nombreCompleto.toLowerCase() &&
              a.colegioNombre.toLowerCase() === nuevoAlumno.colegioNombre.toLowerCase()
            )
        );
        const actualizada = [nuevoAlumno, ...filtrados].slice(0, 100);
        localStorage.setItem(STORAGE_KEY_ALUMNOS_MANUALES, JSON.stringify(actualizada));
        return actualizada;
      });
    } catch (e) {
      console.warn('Error al guardar alumno manual en localStorage:', e);
    }
  };

  const eliminarAlumnoManual = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setAlumnosGuardados((prev) => {
        const actualizada = prev.filter((a) => a.id !== id);
        localStorage.setItem(STORAGE_KEY_ALUMNOS_MANUALES, JSON.stringify(actualizada));
        return actualizada;
      });
    } catch (err) {
      console.warn('Error eliminando alumno de localStorage:', err);
    }
  };

  const reiniciarFormulario = () => {
    setPedidoCreado(null);
    setEstudianteNombre('');
    setPadreNombre('');
    setTelefonoContacto('');
    setObservacion('');
    setError(null);
  };

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin && !esSuperAdmin) {
    return (
      <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para la toma de pedidos manuales de Placeres Culinarios." />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!colegioSeleccionado) {
      setError('Debes seleccionar o tener un colegio asignado.');
      return;
    }

    if (!estudianteNombre.trim()) {
      setError('Debes ingresar el nombre del alumno o alumna.');
      return;
    }

    if (!gradoSeccion.trim()) {
      setError('Debes indicar el grado o sección.');
      return;
    }

    if (!segundoNombre.trim()) {
      setError('Debes seleccionar un plato principal (segundo).');
      return;
    }

    setGuardando(true);
    try {
      const estadoPagoFinal: EstadoPago = metodoPago === 'Pagar luego' ? 'PENDIENTE' : 'PAGADO';

      const nuevoPedido = await dataService.crearPedido({
        padreId: usuario?.id || 'manual-admin',
        colegioNombre: colegioSeleccionado,
        estudianteNombre: estudianteNombre.trim(),
        gradoSeccion: gradoSeccion.trim(),
        segundoNombre: segundoNombre.trim(),
        entradaNombre: entradaNombre || 'Sin entrada',
        ensaladaNombre: ensaladaNombre || 'Sin ensalada',
        observacion: observacion.trim(),
        padreNombre: padreNombre.trim() || undefined,
        telefonoContacto: telefonoContacto.trim() || '',
        metodoPago,
        estadoPago: estadoPagoFinal,
        monto: Number(monto) || 12,
        fecha,
      });

      guardarAlumnoEnLocalStorage({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nombreCompleto: estudianteNombre.trim(),
        gradoSeccion: gradoSeccion.trim(),
        colegioNombre: colegioSeleccionado,
        padreNombre: padreNombre.trim() || undefined,
        telefonoContacto: telefonoContacto.trim() || '',
        fechaUltimoPedido: fecha,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      <PageHeader
        title="Pedido Manual en Ventanilla"
        subtitle="Registro directo de almuerzos escolares para ventanilla, familiares o personas sin acceso al portal web."
        schoolName={usuario?.colegioNombre}
        isSuperAdmin={esSuperAdmin}
      />

      {/* Pantalla de Confirmación de Éxito */}
      {pedidoCreado ? (
        <Card className="border-emerald-200 p-6 sm:p-8 text-center space-y-6 shadow-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs uppercase tracking-wider mb-2 font-bold">
              Pedido Registrado con Éxito
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              #{pedidoCreado.codigoPedido}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Almuerzo programado para el día{' '}
              <strong className="text-zinc-900 font-semibold">
                {formatearFechaLegiblePeru(pedidoCreado.fecha || fecha)}
              </strong>
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 sm:p-5 max-w-lg mx-auto text-left text-xs space-y-2 border border-zinc-200/90">
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-semibold">Alumna / Alumno:</span>
              <strong className="text-zinc-950 font-bold uppercase">
                {pedidoCreado.estudianteNombre}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-semibold">Colegio / Grado:</span>
              <span className="text-zinc-800 font-medium">
                {pedidoCreado.colegioNombre} — {pedidoCreado.gradoSeccion}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-semibold">Plato Principal:</span>
              <strong className="text-zinc-950 font-bold">
                {pedidoCreado.segundoNombre}
              </strong>
            </div>
            {pedidoCreado.entradaNombre && pedidoCreado.entradaNombre !== 'Sin entrada' && (
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-semibold">Sopa / Entrada:</span>
                <span className="text-zinc-800 font-medium">
                  {pedidoCreado.entradaNombre}
                </span>
              </div>
            )}
            {pedidoCreado.ensaladaNombre && pedidoCreado.ensaladaNombre !== 'Sin ensalada' && (
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span className="text-zinc-500 font-semibold">Ensalada:</span>
                <span className="text-zinc-800 font-medium">
                  {pedidoCreado.ensaladaNombre}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-semibold">Método de Pago:</span>
              <span className="inline-flex items-center gap-1 font-bold text-zinc-950">
                {pedidoCreado.metodoPago} ({pedidoCreado.estadoPago === 'PAGADO' ? 'Pagado' : 'Pendiente / Fiado'})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500 font-semibold">Total Cobrado:</span>
              <strong className="text-zinc-950 font-bold text-sm">
                S/ {Number(pedidoCreado.monto || 12).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              onClick={reiniciarFormulario}
              className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs h-10 px-5 gap-2 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Tomar Otro Pedido Manual
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 gap-2 cursor-pointer"
            >
              <Link href="/admin/despacho">
                <PackageCheck className="w-4 h-4 text-zinc-600" /> Ir a Despacho
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto text-xs font-semibold h-10 px-4 gap-2 cursor-pointer"
            >
              <Link href="/admin/cocina">
                <ChefHat className="w-4 h-4 text-zinc-600" /> Ir a Cocina
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        /* Formulario Principal de Pedido Manual */
        <Card className="border-zinc-200/90 shadow-2xs">
          <CardContent className="p-5 sm:p-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. SELECCIÓN DE COLEGIO, DÍA Y FECHA */}
              <div className="space-y-4 pb-5 border-b border-zinc-100">
                {/* Fila 1: Colegio y Fecha Calendario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Colegio */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" /> Colegio / Institución *
                    </label>
                    {esSuperAdmin ? (
                      <select
                        value={colegioSeleccionado}
                        onChange={(e) => setColegioSeleccionado(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-900 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-hidden transition cursor-pointer"
                        required
                      >
                        {colegios.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-900">
                        {colegioSeleccionado || usuario?.colegioNombre || 'Colegio Asignado'}
                      </div>
                    )}
                  </div>

                  {/* Fecha de Consumo */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Fecha del Almuerzo *
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-500 capitalize">
                        {diaSeleccionado.toLowerCase()} ({formatearFechaLegiblePeru(fecha)})
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={fecha}
                        onChange={(e) => handleCambiarFecha(e.target.value)}
                        className="bg-white border-zinc-300 rounded-lg text-xs font-semibold"
                        required
                      />
                      <Button
                        type="button"
                        variant={fecha === fechaHoy ? 'default' : 'outline'}
                        onClick={() => handleCambiarFecha(fechaHoy)}
                        className={`text-xs font-semibold h-9 px-3 shrink-0 cursor-pointer ${
                          fecha === fechaHoy ? 'bg-zinc-950 text-white' : ''
                        }`}
                        title="Seleccionar fecha actual de hoy"
                      >
                        Hoy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fila 2: Selector Rápido de Días de la Semana Escolar (LUNES A VIERNES) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> Seleccionar Día de la Semana *
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Menú programado para el <strong className="text-zinc-950 uppercase">{diaSeleccionado}</strong>
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
                          className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center border text-xs sm:text-sm font-semibold ${
                            activo
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          <span className="leading-tight">{dia.label}</span>
                          {esHoy && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1 rounded mt-0.5 ${
                                activo ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-800'
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
              <div className="space-y-3 pb-5 border-b border-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Input de Estudiante con Dropdown Inteligente de Guardados */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" /> Nombre de la Alumna / Alumno *
                      </span>
                      {alumnosDelColegio.length > 0 && (
                        <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-zinc-400" /> {alumnosDelColegio.length} guardado(s)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ej. Sofía Valenzuela Mendoza"
                        value={estudianteNombre}
                        onChange={(e) => {
                          setEstudianteNombre(e.target.value.toUpperCase());
                          setMostrarDropdownSugerencias(true);
                        }}
                        onFocus={() => setMostrarDropdownSugerencias(true)}
                        className="bg-white border-zinc-300 rounded-lg text-xs sm:text-sm uppercase placeholder:normal-case font-semibold"
                        required
                      />
                      {estudianteNombre && (
                        <button
                          type="button"
                          onClick={() => setEstudianteNombre('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown de Sugerencias de Alumnos Manuales Guardados */}
                    {mostrarDropdownSugerencias && sugerenciasAlumnos.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-lg border border-zinc-200 shadow-lg p-1.5 max-h-56 overflow-y-auto animate-in fade-in">
                        <div className="text-[10px] font-semibold uppercase text-zinc-400 px-2 py-1 flex items-center justify-between">
                          <span>Alumnos Registrados en Pedidos Manuales</span>
                          <span>Clic para autocompletar</span>
                        </div>
                        {sugerenciasAlumnos.map((alum) => (
                          <div
                            key={alum.id}
                            onClick={() => seleccionarAlumnoGuardado(alum)}
                            className="p-2 hover:bg-zinc-100 rounded-md cursor-pointer transition flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="text-xs font-bold text-zinc-900 uppercase">
                                {alum.nombreCompleto}
                              </div>
                              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                                <span>Grado: <strong>{alum.gradoSeccion}</strong></span>
                                {alum.padreNombre && <span>• Tutor: {alum.padreNombre}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => eliminarAlumnoManual(alum.id, e)}
                                className="p-1 text-zinc-300 hover:text-rose-600 transition"
                                title="Quitar de la lista de alumnos manuales guardados"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grado y Sección */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-500" /> Grado y Sección *
                      </label>
                      <button
                        type="button"
                        onClick={() => setGradoPersonalizado(!gradoPersonalizado)}
                        className="text-[11px] text-zinc-600 hover:text-zinc-950 font-semibold underline cursor-pointer"
                      >
                        {gradoPersonalizado ? 'Elegir de lista' : '+ Otro Grado'}
                      </button>
                    </div>

                    {gradoPersonalizado ? (
                      <Input
                        type="text"
                        placeholder="Ej. 3.° Primaria B"
                        value={gradoSeccion}
                        onChange={(e) => setGradoSeccion(e.target.value)}
                        className="bg-white border-zinc-300 rounded-lg text-xs sm:text-sm font-semibold"
                        required
                      />
                    ) : (
                      <select
                        value={gradoSeccion}
                        onChange={(e) => setGradoSeccion(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-900 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-hidden transition cursor-pointer"
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
                    <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5 flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-zinc-400" /> Alumnos frecuentes en ventanilla (haz clic para rellenar datos):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-zinc-50 rounded-lg border border-zinc-200">
                      {alumnosDelColegio.map((alum) => (
                        <button
                          key={alum.id}
                          type="button"
                          onClick={() => seleccionarAlumnoGuardado(alum)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition border cursor-pointer ${
                            estudianteNombre.toUpperCase() === alum.nombreCompleto.toUpperCase()
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
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
              <div className="space-y-5 pb-5 border-b border-zinc-100">
                {/* Encabezado de la Carta del Día */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-zinc-600" /> Carta del Menú Escolar ({diaSemanaCalculado})
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Platos programados para el colegio {colegioSeleccionado} en el día {diaSemanaCalculado.toLowerCase()}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlatoPersonalizado(!platoPersonalizado)}
                    className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold underline cursor-pointer"
                  >
                    {platoPersonalizado ? 'Elegir del Menú' : '+ Plato Especial'}
                  </button>
                </div>

                {/* SECCIÓN 1: SOPA O POSTRE (ENTRADA) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-zinc-500" /> 1. Sopa o Postre (Entrada)
                    </label>
                    <span className="text-[11px] text-zinc-500 font-medium">Incluida en el menú</span>
                  </div>

                  {cargandoDatos ? (
                    <div className="text-xs text-zinc-400 py-3 text-center">Cargando opciones de entrada...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {/* Opción Sin Entrada */}
                      <button
                        type="button"
                        onClick={() => setEntradaNombre('Sin entrada')}
                        className={`text-left p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                          entradaNombre === 'Sin entrada'
                            ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950'
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Opción</span>
                            {entradaNombre === 'Sin entrada' && (
                              <div className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-1">Sin entrada / sopa</div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Solo plato de fondo</p>
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
                            className={`text-left rounded-lg border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                              seleccionada
                                ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="h-24 w-full bg-zinc-100 relative">
                              {ent.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ent.imagenUrl} alt={ent.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <Utensils className="w-6 h-6" />
                                </div>
                              )}
                              <span className="absolute top-1.5 left-1.5 bg-zinc-950/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                Sopa o postre
                              </span>
                              {seleccionada && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1">{ent.nombre}</div>
                                {ent.descripcion && (
                                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{ent.descripcion}</p>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-zinc-500" /> 2. Plato de Fondo (Segundo) *
                    </label>
                    <Badge variant="outline" className="text-xs font-bold">
                      S/ {monto.toFixed(2)}
                    </Badge>
                  </div>

                  {platoPersonalizado ? (
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="text-xs font-bold text-zinc-900">
                        Escribir Plato Especial / Personalizado:
                      </div>
                      <Input
                        type="text"
                        placeholder="Ej. Tallarines Verdes con Bistec"
                        value={segundoNombre}
                        onChange={(e) => setSegundoNombre(e.target.value)}
                        className="bg-white border-zinc-300 font-semibold text-xs"
                        required
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-zinc-600">Precio (S/):</label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={monto}
                          onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border-zinc-300 font-bold text-xs"
                        />
                      </div>
                    </div>
                  ) : cargandoDatos ? (
                    <div className="text-xs text-zinc-400 py-4 text-center">Cargando platos de fondo...</div>
                  ) : platosSegundos.length === 0 ? (
                    <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs">
                      No hay platos de fondo configurados para el {diaSemanaCalculado.toLowerCase()} en {colegioSeleccionado}. Puedes escribir uno personalizado con el botón superior.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
                            className={`text-left rounded-lg border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                              seleccionado
                                ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950 shadow-2xs'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="h-28 w-full bg-zinc-100 relative">
                              {seg.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={seg.imagenUrl} alt={seg.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <UtensilsCrossed className="w-8 h-8" />
                                </div>
                              )}
                              <span className="absolute top-1.5 left-1.5 bg-zinc-950 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Segundo
                              </span>
                              {seleccionado && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1">{seg.nombre}</div>
                                {seg.descripcion && (
                                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                                    {seg.descripcion}
                                  </p>
                                )}
                              </div>
                              <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-950">
                                  S/ {(seg.precio || 12).toFixed(2)}
                                </span>
                                {seleccionado && (
                                  <span className="text-[10px] font-semibold text-zinc-600 flex items-center gap-1">
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Salad className="w-3.5 h-3.5 text-zinc-500" /> 3. Ensalada
                    </label>
                    <span className="text-[11px] text-zinc-500 font-medium">Incluida en el menú</span>
                  </div>

                  {cargandoDatos ? (
                    <div className="text-xs text-zinc-400 py-3 text-center">Cargando opciones de ensalada...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {/* Opción Sin Ensalada */}
                      <button
                        type="button"
                        onClick={() => setEnsaladaNombre('Sin ensalada')}
                        className={`text-left p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                          ensaladaNombre === 'Sin ensalada'
                            ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950'
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Opción</span>
                            {ensaladaNombre === 'Sin ensalada' && (
                              <div className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-1">Sin ensalada</div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Omitir ensalada</p>
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
                            className={`text-left rounded-lg border overflow-hidden transition cursor-pointer flex flex-col justify-between ${
                              seleccionada
                                ? 'bg-zinc-50 border-zinc-950 ring-1 ring-zinc-950'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="h-24 w-full bg-zinc-100 relative">
                              {ens.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ens.imagenUrl} alt={ens.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <Salad className="w-6 h-6 text-zinc-400" />
                                </div>
                              )}
                              <span className="absolute top-1.5 left-1.5 bg-zinc-950/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                Ensalada
                              </span>
                              {seleccionada && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1">{ens.nombre}</div>
                                {ens.descripcion && (
                                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{ens.descripcion}</p>
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
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-zinc-500" /> Observaciones / Alergias del Alumno
                    </label>
                    {observacionesDisponibles.length > 0 && (
                      <span className="text-[10px] text-zinc-400 font-semibold">
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
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer select-none border ${
                              seleccionado
                                ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                            }`}
                          >
                            <span>{tag}</span>
                            {seleccionado && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <Input
                    type="text"
                    placeholder="Ej. Alérgica al maní, poco arroz, sin ensalada..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="bg-white border-zinc-200 rounded-lg text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* 4. DATOS DEL SOLICITANTE / APODERADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-zinc-100">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" /> Tutor / Familiar Solicitante
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. Abuelita Carmen / Papá Pedro"
                    value={padreNombre}
                    onChange={(e) => setPadreNombre(e.target.value)}
                    className="bg-white border-zinc-200 rounded-lg text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> Celular de Contacto (WhatsApp)
                  </label>
                  <Input
                    type="tel"
                    placeholder="Ej. 987654321"
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="bg-white border-zinc-200 rounded-lg text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* 5. MÉTODO DE PAGO */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> Método de Pago *
                  </span>
                  <span className="text-zinc-950 font-bold text-xs">
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
                        className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                          activo
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs font-bold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-medium text-xs'
                        }`}
                      >
                        <div className="text-xs sm:text-sm">{metodo}</div>
                        <div className={`text-[10px] mt-0.5 ${activo ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {metodo === 'Pagar luego' ? 'Fiado' : 'Cobro inmediato'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BOTÓN SUBMIT */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={guardando}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm sm:text-base py-3.5 h-auto rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
