'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Utensils,
  GraduationCap,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileImage,
  Calendar,
  Building2,
  ShieldCheck,
  RotateCcw,
  User,
  Plus,
  ChefHat,
  PackageCheck,
  Settings,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImage, CompressionResult } from '@/lib/imageCompression';
import {
  dataService,
  COLEGIOS_DEFAULT,
  GRADOS_DEFAULT,
  DIAS_SEMANA,
  obtenerDiaActualSemana,
} from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import { Plato, Pedido, MetodoPago, DiaSemana, Hijo, ResumenCocina } from '@/types';

function PedidoContent() {
  const searchParams = useSearchParams();
  const hijoIdParam = searchParams.get('hijoId');

  const { usuario, esAdmin } = useAuth();

  // Estado para el panel de admin si es administrador
  const [resumenAdmin, setResumenAdmin] = useState<ResumenCocina | null>(null);

  // Día seleccionado
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>(obtenerDiaActualSemana());
  const [platosDelDia, setPlatosDelDia] = useState<Plato[]>([]);
  const [cargandoPlatos, setCargandoPlatos] = useState(false);

  // Hijo seleccionado (si el usuario está autenticado)
  const [hijoSeleccionado, setHijoSeleccionado] = useState<Hijo | null>(null);

  // Datos manuales (si no está logueado)
  const [colegio, setColegio] = useState(COLEGIOS_DEFAULT[0]);
  const [grado, setGrado] = useState(GRADOS_DEFAULT[9]);
  const [estudiante, setEstudiante] = useState('');
  const [telefono, setTelefono] = useState('');

  // Platos seleccionados
  const [entradaSeleccionada, setEntradaSeleccionada] = useState<string>('');
  const [segundoSeleccionado, setSegundoSeleccionado] = useState<string>('');
  const [observacion, setObservacion] = useState('');

  // Pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Yape');
  const [comprimidoInfo, setComprimidoInfo] = useState<CompressionResult | null>(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  // Envío y éxito
  const [isPending, startTransition] = useTransition();
  const [pedidoCompletado, setPedidoCompletado] = useState<Pedido | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Cargar resumen de pedidos si es administrador
  useEffect(() => {
    if (esAdmin) {
      dataService.obtenerPedidos().then((pedidos) => {
        setResumenAdmin(dataService.calcularResumenCocina(pedidos));
      });
    }
  }, [esAdmin]);

  // Cargar platos cuando cambia el día
  useEffect(() => {
    if (esAdmin) return; // El admin no necesita cargar el formulario de compra
    let montado = true;
    setCargandoPlatos(true);

    dataService.obtenerPlatosPorDia(diaSeleccionado).then((platos) => {
      if (!montado) return;
      setPlatosDelDia(platos);
      setCargandoPlatos(false);

      const primeraEntrada = platos.find((p) => p.tipo === 'ENTRADA' && p.disponible);
      const primerSegundo = platos.find((p) => p.tipo === 'SEGUNDO' && p.disponible);
      if (primeraEntrada) setEntradaSeleccionada(primeraEntrada.nombre);
      if (primerSegundo) setSegundoSeleccionado(primerSegundo.nombre);
    });

    return () => {
      montado = false;
    };
  }, [diaSeleccionado, esAdmin]);

  // Si el usuario tiene hijos o viene por parámetro URL
  useEffect(() => {
    if (usuario && usuario.rol !== 'ADMIN' && usuario.hijos.length > 0) {
      if (hijoIdParam) {
        const encontrado = usuario.hijos.find((h) => h.id === hijoIdParam);
        if (encontrado) {
          seleccionarHijo(encontrado);
          return;
        }
      }
      if (!hijoSeleccionado) {
        seleccionarHijo(usuario.hijos[0]);
      }
    }
  }, [usuario, hijoIdParam]);

  const seleccionarHijo = (hijo: Hijo) => {
    setHijoSeleccionado(hijo);
    setEstudiante(hijo.nombreCompleto);
    setColegio(hijo.colegioNombre);
    setGrado(hijo.gradoSeccion);
    if (hijo.alergiasNotas) {
      setObservacion(`Alergias: ${hijo.alergiasNotas}`);
    } else {
      setObservacion('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoComprobante(true);
    try {
      const result = await compressImage(file, 800, 0.75);
      setComprimidoInfo(result);
    } catch (err) {
      console.error('Error al comprimir:', err);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const nombreFinal = hijoSeleccionado ? hijoSeleccionado.nombreCompleto : estudiante.trim();
    if (!nombreFinal) {
      setErrorValidacion('Ingresa el nombre del estudiante.');
      return;
    }
    if (!entradaSeleccionada) {
      setErrorValidacion('Selecciona una entrada.');
      return;
    }
    if (!segundoSeleccionado) {
      setErrorValidacion('Selecciona un plato de fondo.');
      return;
    }

    startTransition(async () => {
      try {
        const nuevo = await dataService.crearPedido({
          diaSemana: diaSeleccionado,
          padreId: usuario?.id,
          hijoId: hijoSeleccionado?.id,
          colegioNombre: hijoSeleccionado ? hijoSeleccionado.colegioNombre : colegio,
          gradoSeccion: hijoSeleccionado ? hijoSeleccionado.gradoSeccion : grado,
          estudianteNombre: nombreFinal,
          telefonoContacto: telefono.trim() || usuario?.telefono || 'No especificado',
          entradaNombre: entradaSeleccionada,
          segundoNombre: segundoSeleccionado,
          observacion: observacion.trim() || undefined,
          metodoPago,
          comprobanteUrl: comprimidoInfo?.compressedDataUrl,
          monto: 12.0,
          estadoPago: comprimidoInfo ? 'VERIFICANDO' : 'PENDIENTE',
        });

        setPedidoCompletado(nuevo);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      } catch (err) {
        console.error('Error creando pedido:', err);
        setErrorValidacion('Ocurrió un error al registrar el pedido.');
      }
    });
  };

  const abrirWhatsApp = () => {
    if (!pedidoCompletado) return;
    const phone = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '51999999999';
    const texto =
      `Confirmación de pedido *#${pedidoCompletado.codigoPedido}*:\n` +
      `• Día: ${pedidoCompletado.diaSemana || 'Hoy'}\n` +
      `• Estudiante: ${pedidoCompletado.estudianteNombre}\n` +
      `• Colegio: ${pedidoCompletado.colegioNombre} (${pedidoCompletado.gradoSeccion})\n` +
      `• Menú: ${pedidoCompletado.entradaNombre} + ${pedidoCompletado.segundoNombre}\n` +
      (pedidoCompletado.observacion ? `• Obs: ${pedidoCompletado.observacion}\n` : '') +
      `• Pago: ${pedidoCompletado.metodoPago} - S/ ${pedidoCompletado.monto.toFixed(2)}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const agregarTagObservacion = (tag: string) => {
    if (observacion.includes(tag)) return;
    setObservacion((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  // ----------------------------------------------------
  // VISTA EXCLUSIVA PARA ADMINISTRADORES
  // (No ve el formulario de padres; solo ve Cocina, Despacho y Gestión de Menú)
  // ----------------------------------------------------
  if (esAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md">
              Panel Administrativo
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Control de Operaciones
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Usuario: {usuario?.nombreCompleto}
          </span>
        </div>

        {/* Resumen rápido de hoy */}
        {resumenAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Pedidos</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">
                {resumenAdmin.totalPedidos}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-amber-600 uppercase">Observaciones</span>
              <span className="text-2xl font-black text-amber-600 block mt-1">
                {resumenAdmin.pedidosConObservacion}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Pagados</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">
                {resumenAdmin.pedidosPagados}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <span className="text-[11px] font-bold text-rose-600 uppercase">Pendientes</span>
              <span className="text-2xl font-black text-rose-600 block mt-1">
                {resumenAdmin.pedidosPendientesPago}
              </span>
            </div>
          </div>
        )}

        {/* Los 3 Módulos Operativos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/cocina"
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-orange-500 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ChefHat className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900">Cocina</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consolidado en tiempo real con cantidades exactas de entradas y segundos a preparar.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>Abrir Cocina</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/despacho"
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900">Despacho</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lista ordenada por colegio y grado para rotulado de envases y verificación de pagos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Abrir Despacho</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin"
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-800 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900">Gestión de Menú</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Programación del catálogo semanal (Lunes a Viernes), fotos de platos y precios.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Configurar Menú</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // PANTALLA DE CONFIRMACIÓN DE PEDIDO
  // ----------------------------------------------------
  if (pedidoCompletado) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-100 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full mb-2">
            PEDIDO REGISTRADO
          </span>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Código: <span className="text-emerald-600">#{pedidoCompletado.codigoPedido}</span>
          </h1>

          {/* MENSAJE EXACTO SOLICITADO */}
          <p className="text-sm font-bold text-slate-800 mt-2 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200">
            El almuerzo ya está programado.
          </p>

          <div className="mt-5 bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Día:</span>
              <span className="font-bold text-slate-900">{pedidoCompletado.diaSemana || 'Hoy'}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Estudiante:</span>
              <span className="font-bold text-slate-900">{pedidoCompletado.estudianteNombre}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Colegio:</span>
              <span className="font-semibold text-slate-800">
                {pedidoCompletado.colegioNombre} - {pedidoCompletado.gradoSeccion}
              </span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Entrada:</span>
              <span className="font-semibold text-orange-700">{pedidoCompletado.entradaNombre}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Segundo:</span>
              <span className="font-semibold text-orange-700">{pedidoCompletado.segundoNombre}</span>
            </div>
            {pedidoCompletado.observacion && (
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">Obs:</span>
                <span className="font-semibold text-rose-600">{pedidoCompletado.observacion}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-bold text-slate-900">
              <span>Total:</span>
              <span className="text-emerald-600 text-base">S/ {pedidoCompletado.monto.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={abrirWhatsApp}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition text-xs sm:text-sm"
            >
              <Send className="w-4 h-4" />
              Enviar comprobante por WhatsApp
            </button>

            <button
              onClick={() => {
                setPedidoCompletado(null);
                setComprimidoInfo(null);
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Hacer otro pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CATÁLOGO LIMPIO PARA CLIENTES / PADRES
  // (Sin frases de relleno)
  // ----------------------------------------------------
  const entradas = platosDelDia.filter((p) => p.tipo === 'ENTRADA');
  const segundos = platosDelDia.filter((p) => p.tipo === 'SEGUNDO');
  const diaActual = obtenerDiaActualSemana();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Encabezado limpio con horario de cierre */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Menú Escolar
          </h1>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" /> Pedidos hasta las 09:30 AM
          </span>
        </div>

        {/* Si no está logueado, botón directo de acceso */}
        {!usuario && (
          <Link
            href="/login"
            className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Ingresar con DNI
          </Link>
        )}
      </div>

      {/* SELECTOR DE HIJOS VINCULADOS (SI ESTÁ LOGUEADO COMO PADRE) */}
      {usuario && usuario.rol !== 'ADMIN' && (
        <div className="mb-5 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-orange-500" /> Estudiante:
            </span>
            <Link
              href="/hijos"
              className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar estudiante
            </Link>
          </div>

          {usuario.hijos.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
              <span>No tienes estudiantes registrados.</span>
              <Link href="/hijos" className="font-bold text-orange-600 underline">
                Registrar aquí
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {usuario.hijos.map((hijo) => {
                const activo = hijoSeleccionado?.id === hijo.id;
                return (
                  <button
                    key={hijo.id}
                    type="button"
                    onClick={() => seleccionarHijo(hijo)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition ${
                      activo
                        ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{hijo.nombreCompleto}</h4>
                      <p className="text-[11px] text-slate-500">
                        {hijo.colegioNombre} • {hijo.gradoSeccion}
                      </p>
                    </div>
                    {activo && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SELECTOR DE DÍAS (LUNES A VIERNES) */}
      <div className="mb-5">
        <div className="grid grid-cols-5 gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
          {DIAS_SEMANA.map((dia) => {
            const activo = diaSeleccionado === dia.key;
            const esHoy = diaActual === dia.key;
            return (
              <button
                key={dia.key}
                type="button"
                onClick={() => setDiaSeleccionado(dia.key)}
                className={`py-2 px-1 rounded-xl text-center transition ${
                  activo
                    ? 'bg-white text-orange-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="block text-xs">{dia.short}</span>
                {esHoy && (
                  <span className="inline-block text-[9px] font-bold px-1.5 bg-orange-100 text-orange-700 rounded-md">
                    Hoy
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SI NO ESTÁ LOGUEADO: CAMPOS DEL ALUMNO */}
        {(!usuario || usuario.hijos.length === 0) && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Datos del Alumno
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre y Apellidos *
              </label>
              <input
                type="text"
                placeholder="Ej. Dhana Quispe Cristobal"
                value={estudiante}
                onChange={(e) => setEstudiante(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Colegio</label>
                <select
                  value={colegio}
                  onChange={(e) => setColegio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800"
                >
                  {COLEGIOS_DEFAULT.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grado / Sección</label>
                <select
                  value={grado}
                  onChange={(e) => setGrado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800"
                >
                  {GRADOS_DEFAULT.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1. ENTRADAS */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-500" />
              1. Entrada ({diaSeleccionado})
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">Incluida</span>
          </div>

          {cargandoPlatos ? (
            <p className="text-xs text-slate-400 py-4 text-center">Cargando opciones...</p>
          ) : entradas.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Sin entradas para este día.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {entradas.map((ent) => {
                const activo = entradaSeleccionada === ent.nombre;
                return (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => setEntradaSeleccionada(ent.nombre)}
                    className={`rounded-2xl border text-left overflow-hidden transition flex flex-col ${
                      activo
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs bg-orange-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="h-28 w-full bg-slate-100 relative">
                      {ent.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ent.imagenUrl} alt={ent.nombre} className="w-full h-full object-cover" />
                      )}
                      {activo && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{ent.nombre}</h4>
                      {ent.descripcion && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ent.descripcion}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. SEGUNDOS */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-500" />
              2. Plato de Fondo ({diaSeleccionado})
            </h2>
            <span className="text-xs font-bold text-emerald-700">S/ 12.00</span>
          </div>

          {cargandoPlatos ? (
            <p className="text-xs text-slate-400 py-4 text-center">Cargando opciones...</p>
          ) : segundos.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Sin platos de fondo para este día.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {segundos.map((seg) => {
                const activo = segundoSeleccionado === seg.nombre;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setSegundoSeleccionado(seg.nombre)}
                    className={`rounded-2xl border text-left overflow-hidden transition flex flex-col ${
                      activo
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs bg-orange-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="h-32 w-full bg-slate-100 relative">
                      {seg.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seg.imagenUrl} alt={seg.nombre} className="w-full h-full object-cover" />
                      )}
                      {activo && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{seg.nombre}</h4>
                      {seg.descripcion && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{seg.descripcion}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* OBSERVACIONES */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Observaciones o Restricciones (Opcional)
          </label>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {['Sin cebolla', 'Poca crema', 'Sin ensalada', 'Presa sin piel', 'Solo segundo'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => agregarTagObservacion(tag)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 font-medium transition"
              >
                + {tag}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            placeholder="Especifica cualquier detalle del pedido..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        {/* PAGO */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Forma de Pago</span>
            <span className="text-sm font-bold text-emerald-700">Total: S/ 12.00</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {(['Yape', 'Plin', 'Efectivo'] as MetodoPago[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  metodoPago === m
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {(metodoPago === 'Yape' || metodoPago === 'Plin') && (
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 mb-3 text-xs text-purple-950">
              <p className="font-bold">Número de {metodoPago}: 999-999-999</p>
              <p className="text-[11px] text-purple-700">Almuerzos Escolares S.A.C.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5 text-slate-400" /> Captura de comprobante (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 cursor-pointer"
            />
            {subiendoComprobante && (
              <p className="text-xs text-orange-600 mt-1 animate-pulse">Optimizando imagen...</p>
            )}
            {comprimidoInfo && (
              <p className="text-[11px] text-emerald-700 mt-1 font-bold">
                ✓ Comprimido a {comprimidoInfo.compressedSizeKb} KB
              </p>
            )}
          </div>
        </div>

        {errorValidacion && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorValidacion}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isPending ? (
            <span className="animate-pulse">Registrando...</span>
          ) : (
            <>
              <span>Confirmar Pedido para {diaSeleccionado} (S/ 12.00)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PedidoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando...</div>}>
      <PedidoContent />
    </Suspense>
  );
}
