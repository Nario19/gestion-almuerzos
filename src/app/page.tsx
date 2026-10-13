'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  LogIn,
  Sparkles,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImage, CompressionResult } from '@/lib/imageCompression';
import {
  dataService,
  OBSERVACIONES_DEFAULT,
  DIAS_SEMANA,
  obtenerDiaActualSemana,
} from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import { Plato, Pedido, MetodoPago, DiaSemana, Hijo, ResumenCocina } from '@/types';

function PedidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hijoIdParam = searchParams.get('hijoId');

  const { usuario, esAdmin, cargando: cargandoAuth } = useAuth();

  // Si entra como administrador, redirigir directo a /admin
  useEffect(() => {
    if (esAdmin) {
      router.replace('/admin');
    }
  }, [esAdmin, router]);

  // Estado para el panel de admin si es administrador
  const [resumenAdmin, setResumenAdmin] = useState<ResumenCocina | null>(null);

  // Día seleccionado
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>(obtenerDiaActualSemana());
  const [platosDelDia, setPlatosDelDia] = useState<Plato[]>([]);
  const [cargandoPlatos, setCargandoPlatos] = useState(false);

  // Hijo seleccionado (si el usuario está autenticado)
  const [hijoSeleccionado, setHijoSeleccionado] = useState<Hijo | null>(null);

  // Datos manuales (si no está logueado)
  const [colegio, setColegio] = useState('');
  const [grado, setGrado] = useState('');
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

  // Listas dinámicas configurables por el admin
  const [listaColegios, setListaColegios] = useState<string[]>([]);
  const [listaGrados, setListaGrados] = useState<string[]>([]);
  const [observacionesTags, setObservacionesTags] = useState<string[]>(OBSERVACIONES_DEFAULT);
  const [cargandoColegios, setCargandoColegios] = useState(true);

  // Cargar configuraciones dinámicas
  useEffect(() => {
    let montado = true;
    const cargarConfig = async () => {
      try {
        const [cols, grads, obs] = await Promise.all([
          dataService.obtenerColegios(),
          dataService.obtenerGrados(),
          dataService.obtenerObservaciones(),
        ]);
        if (!montado) return;
        if (cols) {
          setListaColegios(cols);
          setColegio((prev) => (prev && cols.includes(prev) ? prev : cols[0] || ''));
        }
        if (grads) {
          setListaGrados(grads);
          setGrado((prev) => (prev && grads.includes(prev) ? prev : grads[0] || ''));
        }
        if (obs && obs.length > 0) {
          setObservacionesTags(obs);
        }
      } finally {
        if (montado) setCargandoColegios(false);
      }
    };

    cargarConfig();
    const desuscribir = dataService.suscribirCambios(() => {
      cargarConfig();
    });

    return () => {
      montado = false;
      desuscribir();
    };
  }, []);

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
  // ESTADO DE CARGA DE SESIÓN
  // ----------------------------------------------------
  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Cargando...</p>
      </div>
    );
  }

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
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900">Panel Admin & KPIs</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Dashboard de ventas, embudo operativo, gestión del menú semanal y colegios.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Abrir Panel Admin</span>
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

            <Link
              href="/pedidos"
              className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
              Ver en Mis Pedidos
            </Link>

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

  // ----------------------------------------------------
  // VISTA PÚBLICA / CARTA SEMANAL (VISITANTES SIN CUENTA)
  // ----------------------------------------------------
  if (!usuario) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* Encabezado de la Carta */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Carta Semanal
            </h1>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" /> Pedidos hasta las 09:30 AM
            </span>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
          </Link>
        </div>

        {/* SELECTOR DE DÍAS (LUNES A VIERNES) */}
        <div className="mb-6">
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

        {/* CONTENIDO DE LA CARTA */}
        <div className="space-y-6">
          {/* 1. ENTRADAS */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-orange-500" />
                1. Entrada ({diaSeleccionado})
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">Incluida en el menú</span>
            </div>

            {cargandoPlatos ? (
              <p className="text-xs text-slate-400 py-6 text-center">Cargando opciones...</p>
            ) : entradas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin entradas programadas para este día.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entradas.map((ent) => (
                  <div
                    key={ent.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-orange-300 transition flex flex-col"
                  >
                    <div className="h-32 w-full bg-slate-100 relative">
                      {ent.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ent.imagenUrl} alt={ent.nombre} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        Entrada
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ent.nombre}</h4>
                        {ent.descripcion && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ent.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                S/ 12.00
              </span>
            </div>

            {cargandoPlatos ? (
              <p className="text-xs text-slate-400 py-6 text-center">Cargando opciones...</p>
            ) : segundos.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin platos de fondo para este día.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {segundos.map((seg) => (
                  <div
                    key={seg.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-orange-300 transition flex flex-col"
                  >
                    <div className="h-36 w-full bg-slate-100 relative">
                      {seg.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seg.imagenUrl} alt={seg.nombre} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        Segundo
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{seg.nombre}</h4>
                        {seg.descripcion && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{seg.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BANNER CTA PARA PEDIR */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-200" />
            <h3 className="text-lg font-black tracking-tight">¿Deseas pedir el almuerzo para tu hijo?</h3>
            <p className="text-xs text-orange-100 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Inicia sesión o regístrate en la plataforma para asociar a tu estudiante y programar sus almuerzos escolares con entrega directa.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl text-xs sm:text-sm hover:bg-orange-50 transition shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión / Registrarme
              </Link>
            </div>
          </div>
        </div>

        {/* BARRA FLOTANTE FIJA INFERIOR */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Menú Escolar Completo</span>
              <span className="text-[11px] text-emerald-600 font-bold">S/ 12.00 • Entrada + Segundo</span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión para Pedir
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA DE PEDIDO PARA PADRES AUTENTICADOS
  // ----------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-28 sm:pb-24">
      {/* Encabezado con horario de cierre y enlace a Mis Pedidos */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Menú Escolar
          </h1>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" /> Pedidos hasta las 09:30 AM
          </span>
        </div>

        <Link
          href="/pedidos"
          className="text-xs font-bold px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-xl hover:bg-orange-100 transition flex items-center gap-1.5 shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
          <span>Mis Pedidos</span>
        </Link>
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
        {/* SI EL PADRE AÚN NO TIENE HIJOS REGISTRADOS: CAMPOS DEL ALUMNO */}
        {usuario.hijos.length === 0 && (
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Colegio *</label>
                {cargandoColegios ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 animate-pulse">
                    Cargando colegios...
                  </div>
                ) : listaColegios.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No hay colegios disponibles
                  </div>
                ) : (
                  <select
                    value={colegio}
                    onChange={(e) => setColegio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  >
                    {listaColegios.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grado / Sección *</label>
                {cargandoColegios ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 animate-pulse">
                    Cargando grados...
                  </div>
                ) : listaGrados.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No hay grados disponibles
                  </div>
                ) : (
                  <select
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  >
                    {listaGrados.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                )}
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
            <div className="py-6 text-center text-xs text-slate-400 font-medium">Cargando opciones...</div>
          ) : entradas.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No hay entradas registradas para este día.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {entradas.map((plato) => {
                const seleccionado = entradaSeleccionada === plato.nombre;
                return (
                  <button
                    key={plato.id}
                    type="button"
                    onClick={() => plato.disponible && setEntradaSeleccionada(plato.nombre)}
                    disabled={!plato.disponible}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all relative ${
                      !plato.disponible
                        ? 'opacity-40 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : seleccionado
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {plato.imagenUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={plato.imagenUrl} alt={plato.nombre} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{plato.nombre}</h3>
                        {seleccionado && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{plato.descripcion}</p>
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
              2. Segundo ({diaSeleccionado})
            </h2>
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">S/ 12</span>
          </div>

          {cargandoPlatos ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">Cargando opciones...</div>
          ) : segundos.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No hay segundos registrados para este día.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {segundos.map((plato) => {
                const seleccionado = segundoSeleccionado === plato.nombre;
                return (
                  <button
                    key={plato.id}
                    type="button"
                    onClick={() => plato.disponible && setSegundoSeleccionado(plato.nombre)}
                    disabled={!plato.disponible}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all relative ${
                      !plato.disponible
                        ? 'opacity-40 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : seleccionado
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {plato.imagenUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={plato.imagenUrl} alt={plato.nombre} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{plato.nombre}</h3>
                        {seleccionado && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{plato.descripcion}</p>
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
            {observacionesTags.map((tag) => (
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
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
              <p className="text-[11px] text-purple-700">Placeres Culinarios</p>
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
