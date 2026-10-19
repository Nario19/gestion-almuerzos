'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import {
  obtenerFechaHoyPeru,
  obtenerDiaActualSemanaPeru,
  formatearFechaLegiblePeru,
} from '@/lib/dateUtils';
import { Plato, MetodoPago, EstadoPago, DiaSemana, Pedido } from '@/types';

export default function PedidoManualPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();
  const fechaHoy = useMemo(() => obtenerFechaHoyPeru(), []);

  // Listas de datos
  const [colegios, setColegios] = useState<string[]>([]);
  const [grados, setGrados] = useState<string[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Formulario
  const [colegioSeleccionado, setColegioSeleccionado] = useState<string>('');
  const [fecha, setFecha] = useState<string>(fechaHoy);
  const [estudianteNombre, setEstudianteNombre] = useState('');
  const [gradoSeccion, setGradoSeccion] = useState('');
  const [gradoPersonalizado, setGradoPersonalizado] = useState(false);
  const [segundoNombre, setSegundoNombre] = useState('');
  const [platoPersonalizado, setPlatoPersonalizado] = useState(false);
  const [entradaNombre, setEntradaNombre] = useState('Sin entrada');
  const [observacion, setObservacion] = useState('');
  const [padreNombre, setPadreNombre] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [monto, setMonto] = useState<number>(12);

  // Estados de proceso
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);

  // Calcular el día escolar (LUNES a VIERNES) según la fecha
  const diaSemanaCalculado = useMemo<DiaSemana>(() => {
    try {
      const d = new Date(`${fecha}T12:00:00-05:00`);
      return obtenerDiaActualSemanaPeru(d);
    } catch (_) {
      return 'LUNES';
    }
  }, [fecha]);

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
    ])
      .then(([resGrados, resPlatos]) => {
        if (cancelado) return;
        setGrados(resGrados || []);
        if (resGrados && resGrados.length > 0 && !resGrados.includes(gradoSeccion)) {
          setGradoSeccion(resGrados[0]);
          setGradoPersonalizado(false);
        }

        setPlatos(resPlatos || []);
        const segundos = (resPlatos || []).filter(
          (p) => (p.tipo || '').toUpperCase() === 'SEGUNDO' || !(p.tipo || '').toUpperCase().includes('ENTRADA')
        );
        if (segundos.length > 0) {
          setSegundoNombre(segundos[0].nombre);
          setMonto(segundos[0].precio || 12);
          setPlatoPersonalizado(false);
        } else {
          setPlatoPersonalizado(true);
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

  // Filtrar platos por tipo
  const platosSegundos = platos.filter(
    (p) => (p.tipo || '').toUpperCase() === 'SEGUNDO' || !(p.tipo || '').toUpperCase().includes('ENTRADA')
  );
  const platosEntradas = platos.filter(
    (p) =>
      (p.tipo || '').toUpperCase().includes('ENTRADA') ||
      (p.tipo || '').toUpperCase().includes('SOPA') ||
      (p.tipo || '').toUpperCase().includes('POSTRE')
  );

  const reiniciarFormulario = () => {
    setEstudianteNombre('');
    setObservacion('');
    setPadreNombre('');
    setTelefonoContacto('');
    setPedidoCreado(null);
    setError(null);
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
      setError('Por favor selecciona o escribe el plato principal.');
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
        observacion: observacion.trim() || undefined,
        metodoPago: metodoPago,
        estadoPago: estadoPagoFinal,
        monto: Number(monto) || 12,
        fecha: fecha,
        diaSemana: diaSemanaCalculado,
        padreNombre: padreNombre.trim() ? formatearNombre(padreNombre.trim()) : 'Atención en ventanilla / Tutor',
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
              <Building2 className="w-3.5 h-3.5" /> {usuario?.colegioNombre || 'Sede Escolar'}
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
              <span className="font-black text-slate-900">{pedidoCreado.estudianteNombre}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Colegio y Grado:</span>
              <span className="font-bold text-slate-800">
                {pedidoCreado.colegioNombre} — {pedidoCreado.gradoSeccion}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Plato Principal:</span>
              <span className="font-bold text-slate-900">{pedidoCreado.segundoNombre}</span>
            </div>
            {pedidoCreado.entradaNombre && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Entrada o Postre:</span>
                <span className="font-medium text-slate-700">{pedidoCreado.entradaNombre}</span>
              </div>
            )}
            {pedidoCreado.observacion && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Observación:</span>
                <span className="font-bold text-amber-700">{pedidoCreado.observacion}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Pago:</span>
              <span
                className={`font-black ${
                  pedidoCreado.estadoPago === 'PAGADO' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {pedidoCreado.metodoPago} — {pedidoCreado.estadoPago === 'PAGADO' ? 'PAGADO' : 'POR COBRAR'}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-semibold">Monto:</span>
              <span className="font-black text-slate-900 text-base">
                S/ {pedidoCreado.monto.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reiniciarFormulario}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Siguiente Alumno</span>
            </button>
            <Link
              href="/despacho"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Ir a Despacho</span>
            </Link>
            <Link
              href="/cocina"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              <span>Ir a Cocina</span>
            </Link>
            {pedidoCreado.metodoPago === 'Pagar luego' && (
              <Link
                href="/fiado"
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Ver en Fiados</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Formulario Principal de Pedido Manual */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SELECCIÓN DE COLEGIO Y FECHA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            {/* Colegio */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Colegio *
              </label>
              {esSuperAdmin ? (
                <select
                  value={colegioSeleccionado}
                  onChange={(e) => {
                    setColegioSeleccionado(e.target.value);
                    setGradoPersonalizado(false);
                    setPlatoPersonalizado(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                >
                  {colegios.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-slate-800">
                  {colegioSeleccionado || usuario?.colegioNombre || 'Colegio Asignado'}
                </div>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Fecha del Almuerzo *
                </span>
                {fecha === fechaHoy && (
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Hoy
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value || fechaHoy)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setFecha(fechaHoy)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition"
                >
                  Hoy
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 capitalize">
                Día escolar: <strong>{diaSemanaCalculado.toLowerCase()}</strong> ({formatearFechaLegiblePeru(fecha)})
              </p>
            </div>
          </div>

          {/* 2. DATOS DE LA ALUMNA/O */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            {/* Nombre del estudiante */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Nombre de la Alumna / Alumno *
              </label>
              <input
                type="text"
                placeholder="Ej. Sofía Valenzuela Mendoza"
                value={estudianteNombre}
                onChange={(e) => setEstudianteNombre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                required
              />
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

          {/* 3. SELECCIÓN DE ALMUERZO */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" /> Plato Principal (Segundo) *
                </label>
                <button
                  type="button"
                  onClick={() => setPlatoPersonalizado(!platoPersonalizado)}
                  className="text-[11px] text-emerald-700 hover:underline font-bold"
                >
                  {platoPersonalizado ? 'Elegir del Menú' : '+ Plato Especial'}
                </button>
              </div>

              {platoPersonalizado ? (
                <input
                  type="text"
                  placeholder="Ej. Tallarines Verdes con Bistec"
                  value={segundoNombre}
                  onChange={(e) => setSegundoNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                  required
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {platosSegundos.length === 0 ? (
                    <div className="col-span-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      No hay segundos configurados para el {diaSemanaCalculado.toLowerCase()} en {colegioSeleccionado}. Puedes escribir uno personalizado con el botón superior.
                    </div>
                  ) : (
                    platosSegundos.map((p) => {
                      const seleccionado = segundoNombre === p.nombre;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSegundoNombre(p.nombre);
                            setMonto(p.precio || 12);
                          }}
                          className={`text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                            seleccionado
                              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-black text-xs sm:text-sm text-slate-900">{p.nombre}</div>
                            {p.descripcion && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {p.descripcion}
                              </div>
                            )}
                            <div className="text-xs font-bold text-emerald-700 mt-1">
                              S/ {(p.precio || 12).toFixed(2)}
                            </div>
                          </div>
                          {seleccionado && (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Entrada o Sopa Opcional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Entrada, Sopa o Postre (Opcional)
                </label>
                <select
                  value={entradaNombre}
                  onChange={(e) => setEntradaNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer"
                >
                  <option value="Sin entrada">Sin entrada / sopa</option>
                  {platosEntradas.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre} ({p.tipo || 'Entrada'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones de alergias */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Observaciones / Alergias
                </label>
                <input
                  type="text"
                  placeholder="Ej. Alérgica al maní, poco arroz, sin ensalada..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                />
              </div>
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
              <span className="text-sm font-black text-slate-900">
                Total: S/ {monto.toFixed(2)}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Efectivo', label: 'Efectivo', desc: 'Cobrado en caja', color: 'border-emerald-500 bg-emerald-50/50' },
                { id: 'Yape', label: 'Yape', desc: 'Pago confirmado', color: 'border-purple-500 bg-purple-50/50' },
                { id: 'Plin', label: 'Plin', desc: 'Pago confirmado', color: 'border-blue-500 bg-blue-50/50' },
                { id: 'Pagar luego', label: 'Pagar luego', desc: 'Fiado en cuenta', color: 'border-amber-500 bg-amber-50/50' },
              ].map((m) => {
                const activo = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id as MetodoPago)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      activo
                        ? `${m.color} ring-2 ring-emerald-600/30 font-black`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                    {activo && (
                      <div className="self-end mt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando || cargandoDatos}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm sm:text-base transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registrando Pedido...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Registrar Almuerzo Escolar (S/ {monto.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
