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
  X,
  ClipboardCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImage, CompressionResult } from '@/lib/imageCompression';
import { subirImagenACloudinary } from '@/lib/cloudinaryService';
import {
  dataService,
  OBSERVACIONES_DEFAULT,
  DIAS_SEMANA,
  obtenerDiaActualSemana,
  CONFIG_PAGOS_DEFAULT,
} from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import { Plato, Pedido, MetodoPago, DiaSemana, Hijo, ResumenCocina, ConfiguracionPagos } from '@/types';

function PedidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hijoIdParam = searchParams.get('hijoId');

  const { usuario, esAdmin, cargando: cargandoAuth, agregarHijo } = useAuth();

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
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  // Envío y éxito
  const [isPending, startTransition] = useTransition();
  const [pedidoCompletado, setPedidoCompletado] = useState<Pedido | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Modal para agregar estudiante si el padre no tiene ninguno registrado
  const [mostrarModalAgregarHijo, setMostrarModalAgregarHijo] = useState(false);
  const [nombreNuevoHijo, setNombreNuevoHijo] = useState('');
  const [colegioNuevoHijo, setColegioNuevoHijo] = useState('');
  const [gradoNuevoHijo, setGradoNuevoHijo] = useState('');
  const [alergiasNuevoHijo, setAlergiasNuevoHijo] = useState('');
  const [guardandoNuevoHijo, setGuardandoNuevoHijo] = useState(false);
  const [errorModalHijo, setErrorModalHijo] = useState<string | null>(null);

  // Modal de confirmación y corroboración con el resumen de todo lo pedido
  const [mostrarModalConfirmacionPedido, setMostrarModalConfirmacionPedido] = useState(false);
  const [hijoParaConfirmar, setHijoParaConfirmar] = useState<Hijo | null>(null);

  // Listas dinámicas configurables por el admin
  const [listaColegios, setListaColegios] = useState<string[]>([]);
  const [listaGrados, setListaGrados] = useState<string[]>([]);
  const [observacionesTags, setObservacionesTags] = useState<string[]>(OBSERVACIONES_DEFAULT);
  const [cargandoColegios, setCargandoColegios] = useState(true);
  const [configPagos, setConfigPagos] = useState<ConfiguracionPagos>(CONFIG_PAGOS_DEFAULT);

  // Cargar configuraciones dinámicas
  useEffect(() => {
    let montado = true;
    const cargarConfig = async () => {
      try {
        const [cols, grads, obs, pagos] = await Promise.all([
          dataService.obtenerColegios(),
          dataService.obtenerGrados(),
          dataService.obtenerObservaciones(),
          dataService.obtenerConfiguracionPagos(),
        ]);
        if (!montado) return;
        if (cols && cols.length > 0) {
          setListaColegios(cols);
          setColegio((prev) => (prev && cols.includes(prev) ? prev : cols[0] || ''));
          setColegioNuevoHijo((prev) => (prev && cols.includes(prev) ? prev : cols[0] || ''));
        }
        if (grads && grads.length > 0) {
          setListaGrados(grads);
          setGrado((prev) => (prev && grads.includes(prev) ? prev : grads[0] || ''));
          setGradoNuevoHijo((prev) => (prev && grads.includes(prev) ? prev : grads[0] || ''));
        }
        if (obs && obs.length > 0) {
          setObservacionesTags(obs);
        }
        if (pagos) {
          setConfigPagos(pagos);
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

  // Recargar grados para el modal de agregar hijo según el colegio seleccionado
  useEffect(() => {
    if (colegioNuevoHijo) {
      let montado = true;
      dataService.obtenerGrados(colegioNuevoHijo).then((grds) => {
        if (!montado) return;
        if (grds && grds.length > 0) {
          setListaGrados(grds);
          setGradoNuevoHijo((prev) => (prev && grds.includes(prev) ? prev : grds[0] || ''));
        }
      });
      return () => {
        montado = false;
      };
    }
  }, [colegioNuevoHijo]);

  // Recargar observaciones rápidas según el colegio del estudiante seleccionado
  useEffect(() => {
    const colTarget = hijoSeleccionado?.colegioNombre || hijoSeleccionado?.colegioId || colegio;
    if (colTarget) {
      let montado = true;
      dataService.obtenerObservaciones(colTarget).then((obs) => {
        if (!montado) return;
        if (obs && obs.length > 0) {
          setObservacionesTags(obs);
        }
      });
      return () => {
        montado = false;
      };
    }
  }, [hijoSeleccionado?.colegioNombre, hijoSeleccionado?.colegioId, colegio]);

  // Cargar resumen de pedidos si es administrador
  useEffect(() => {
    if (esAdmin) {
      dataService.obtenerPedidos().then((pedidos) => {
        setResumenAdmin(dataService.calcularResumenCocina(pedidos));
      });
    }
  }, [esAdmin]);

  const seleccionarHijo = (hijo: Hijo) => {
    setCargandoPlatos(true);
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

  // Cargar platos cuando cambia el día o el colegio del hijo seleccionado
  useEffect(() => {
    if (esAdmin) return; // El admin no necesita cargar el formulario de compra
    let montado = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setEntradaSeleccionada('');
    setSegundoSeleccionado('');
    /* eslint-enable react-hooks/set-state-in-effect */

    const colegioFiltro = hijoSeleccionado?.colegioNombre || hijoSeleccionado?.colegioId || colegio || undefined;

    dataService.obtenerPlatosPorDia(diaSeleccionado, colegioFiltro).then((platos) => {
      if (!montado) return;
      setPlatosDelDia(platos);
      setCargandoPlatos(false);

      const esEntradaTipo = (t: string) => {
        const s = (t || '').toLowerCase().trim();
        return s === 'entrada' || s.includes('sopa') || s.includes('postre');
      };
      const esSegundoTipo = (t: string) => {
        const s = (t || '').toLowerCase().trim();
        return s === 'segundo' || (!esEntradaTipo(t) && s !== 'bebida');
      };

      const primeraEntrada = platos.find((p) => p.disponible && esEntradaTipo(p.tipo));
      const primerSegundo = platos.find((p) => p.disponible && esSegundoTipo(p.tipo));
      setEntradaSeleccionada(primeraEntrada ? primeraEntrada.nombre : '');
      setSegundoSeleccionado(primerSegundo ? primerSegundo.nombre : '');
    });

    return () => {
      montado = false;
    };
  }, [diaSeleccionado, esAdmin, hijoSeleccionado?.id, hijoSeleccionado?.colegioNombre, hijoSeleccionado?.colegioId, colegio]);

  // Si el usuario tiene hijos o viene por parámetro URL
  useEffect(() => {
    if (usuario && usuario.rol !== 'ADMIN' && usuario.hijos.length > 0) {
      if (hijoIdParam) {
        const encontrado = usuario.hijos.find((h) => h.id === hijoIdParam);
        if (encontrado) {
          queueMicrotask(() => seleccionarHijo(encontrado));
          return;
        }
      }
      if (!hijoSeleccionado) {
        queueMicrotask(() => seleccionarHijo(usuario.hijos[0]));
      }
    }
  }, [usuario, hijoIdParam, hijoSeleccionado]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoComprobante(true);
    try {
      // 1. Optimizar en el navegador para ahorrar datos al padre
      const result = await compressImage(file, 800, 0.75);
      setComprimidoInfo(result);

      // 2. Subir directamente a Cloudinary para no almacenar base64 en Supabase PostgreSQL
      const urlNube = await subirImagenACloudinary(result.compressedDataUrl, 'comprobantes');
      setCloudinaryUrl(urlNube);
    } catch (err) {
      console.error('Error al procesar/subir comprobante:', err);
      alert('Hubo un problema al procesar el comprobante.');
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const ejecutarCreacionPedido = (hijoTarget: Hijo | null) => {
    const nombreFinal = hijoTarget ? hijoTarget.nombreCompleto : estudiante.trim();
    if (!nombreFinal) {
      setErrorValidacion('Ingresa el nombre de tu hijo.');
      return;
    }
    if (!entradaSeleccionada) {
      setErrorValidacion('Selecciona una opción de sopa o postre.');
      return;
    }
    if (!segundoSeleccionado) {
      setErrorValidacion('Selecciona un segundo plato.');
      return;
    }
    if (cargandoPlatos) {
      setErrorValidacion('Cargando la carta del colegio. Por favor espera un momento.');
      return;
    }
    const entradaValida = platosDelDia.some((p) => p.nombre === entradaSeleccionada && p.disponible);
    const segundoValido = platosDelDia.some((p) => p.nombre === segundoSeleccionado && p.disponible);
    if (!entradaValida || !segundoValido) {
      setErrorValidacion('Por favor selecciona platos disponibles en el menú de este colegio.');
      return;
    }

    startTransition(async () => {
      try {
        // Obtener la URL de Cloudinary o subirla si aún no se había subido
        let urlComprobanteFinal = cloudinaryUrl || comprimidoInfo?.compressedDataUrl;
        if (comprimidoInfo?.compressedDataUrl && (!urlComprobanteFinal || urlComprobanteFinal.startsWith('data:image'))) {
          try {
            urlComprobanteFinal = await subirImagenACloudinary(comprimidoInfo.compressedDataUrl, 'comprobantes');
          } catch {
            // Mantener fallback
          }
        }

        const nuevo = await dataService.crearPedido({
          diaSemana: diaSeleccionado,
          padreId: usuario?.id,
          padreNombre: usuario?.nombreCompleto,
          colegioId: hijoTarget?.colegioId,
          hijoId: hijoTarget?.id,
          colegioNombre: hijoTarget ? hijoTarget.colegioNombre : colegio,
          gradoSeccion: hijoTarget ? hijoTarget.gradoSeccion : grado,
          estudianteNombre: nombreFinal,
          telefonoContacto: telefono.trim() || usuario?.telefono || 'No especificado',
          entradaNombre: entradaSeleccionada,
          segundoNombre: segundoSeleccionado,
          observacion: observacion.trim() || (hijoTarget?.alergiasNotas ? `Alergias: ${hijoTarget.alergiasNotas}` : undefined),
          metodoPago,
          comprobanteUrl: urlComprobanteFinal,
          monto: 12.0,
          estadoPago: (comprimidoInfo || urlComprobanteFinal) ? 'VERIFICANDO' : 'PENDIENTE',
        });

        setPedidoCompletado(nuevo);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // Omitir si falla confetti
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error creando pedido:', err);
        setMostrarModalConfirmacionPedido(false);
        setErrorValidacion(err?.message || 'Ocurrió un error al registrar el pedido.');
      }
    });
  };

  // Cerrar modal de confirmación con Escape
  useEffect(() => {
    if (!mostrarModalConfirmacionPedido) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        setMostrarModalConfirmacionPedido(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mostrarModalConfirmacionPedido, isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!entradaSeleccionada) {
      setErrorValidacion('Por favor selecciona una entrada.');
      return;
    }
    if (!segundoSeleccionado) {
      setErrorValidacion('Por favor selecciona un plato de fondo.');
      return;
    }

    // Si el usuario es un padre y no tiene hijos registrados, solicitar que agregue uno mediante el modal
    if (usuario && usuario.rol !== 'ADMIN' && (!usuario.hijos || usuario.hijos.length === 0)) {
      setMostrarModalAgregarHijo(true);
      return;
    }

    // Corroboración: abrir alerta/modal de confirmación con todo lo pedido
    const target = hijoSeleccionado || (usuario?.hijos && usuario.hijos.length > 0 ? usuario.hijos[0] : null);
    setHijoParaConfirmar(target);
    setMostrarModalConfirmacionPedido(true);
  };

  const handleConfirmarPedidoFinal = () => {
    setMostrarModalConfirmacionPedido(false);
    ejecutarCreacionPedido(hijoParaConfirmar || hijoSeleccionado);
  };

  const handleGuardarHijoYConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModalHijo(null);

    const nombre = nombreNuevoHijo.trim();
    if (!nombre) {
      setErrorModalHijo('Ingresa el nombre y apellidos de tu hijo.');
      return;
    }
    const col = colegioNuevoHijo || listaColegios[0] || '';
    if (!col) {
      setErrorModalHijo('Selecciona un colegio.');
      return;
    }
    const grd = gradoNuevoHijo || listaGrados[0] || '';
    if (!grd) {
      setErrorModalHijo('Selecciona un grado y sección.');
      return;
    }

    setGuardandoNuevoHijo(true);
    try {
      const res = await agregarHijo({
        nombreCompleto: nombre,
        colegioNombre: col,
        gradoSeccion: grd,
        alergiasNotas: alergiasNuevoHijo.trim() || undefined,
      });

      if (!res.ok) {
        setErrorModalHijo(res.error || 'Error al guardar a tu hijo.');
        return;
      }

      const hijoCreado: Hijo = res.hijo || {
        id: `hijo-${Date.now()}`,
        padreId: usuario?.id || '',
        nombreCompleto: nombre,
        colegioNombre: col,
        gradoSeccion: grd,
        alergiasNotas: alergiasNuevoHijo.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      seleccionarHijo(hijoCreado);
      setMostrarModalAgregarHijo(false);
      setHijoParaConfirmar(hijoCreado);
      setMostrarModalConfirmacionPedido(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorModalHijo(msg || 'Error al registrar a tu hijo.');
    } finally {
      setGuardandoNuevoHijo(false);
    }
  };

  const abrirWhatsApp = () => {
    if (!pedidoCompletado) return;
    const phone = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '51999999999';
    const texto =
      `Confirmación de pedido *#${pedidoCompletado.codigoPedido}*:\n` +
      `• Día: ${pedidoCompletado.diaSemana || 'Hoy'}\n` +
      `• Hijo: ${pedidoCompletado.estudianteNombre}\n` +
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
                Recepción de órdenes, verificación de pagos, rotulado de loncheras y reporte Excel.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Abrir Despacho</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

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
                Consolidado de platos de pedidos aceptados y alertas de dietas especiales a preparar.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>Abrir Cocina</span>
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
              <span className="text-slate-500">Hijo:</span>
              <span className="font-bold text-slate-900">{pedidoCompletado.estudianteNombre}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Colegio:</span>
              <span className="font-semibold text-slate-800">
                {pedidoCompletado.colegioNombre} - {pedidoCompletado.gradoSeccion}
              </span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Sopa o postre:</span>
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
  const esEntrada = (t: string) => {
    const s = (t || '').toLowerCase().trim();
    return s === 'entrada' || s.includes('sopa') || s.includes('postre');
  };
  const esSegundo = (t: string) => {
    const s = (t || '').toLowerCase().trim();
    return s === 'segundo' || (!esEntrada(t) && s !== 'bebida');
  };

  const entradas = platosDelDia.filter((p) => esEntrada(p.tipo));
  const segundos = platosDelDia.filter((p) => esSegundo(p.tipo));
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
        </div>

        {/* FILTRO POR COLEGIO PARA VISITANTES */}
        <div className="mb-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
            <Building2 className="w-4 h-4 text-orange-500" />
            <span>Colegio:</span>
          </label>
          <div className="flex-1 sm:max-w-xs">
            {cargandoColegios ? (
              <div className="text-xs text-slate-400 py-1.5">Cargando colegios...</div>
            ) : listaColegios.length === 0 ? (
              <div className="text-xs text-slate-400 py-1.5">No hay colegios disponibles</div>
            ) : (
              <select
                value={colegio}
                onChange={(e) => setColegio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              >
                {listaColegios.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            )}
          </div>
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
          {/* 1. SOPAS O POSTRES */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-orange-500" />
                1. Sopa o postre ({diaSeleccionado})
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">Incluida en el menú</span>
            </div>

            {cargandoPlatos ? (
              <p className="text-xs text-slate-400 py-6 text-center">Cargando opciones...</p>
            ) : entradas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin opciones de sopa o postre para este día.</p>
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
                        Sopa o postre
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
              Inicia sesión o regístrate en la plataforma para asociar a tus hijos y programar sus almuerzos escolares con entrega directa.
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
              <span className="text-[11px] text-emerald-600 font-bold">S/ 12.00 • Sopa o postre + Segundo</span>
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

      {/* SELECTOR DE HIJOS VINCULADOS (SI TIENE HIJOS REGISTRADOS) */}
      {usuario && usuario.rol !== 'ADMIN' && usuario.hijos && usuario.hijos.length > 0 && (
        <div className="mb-5 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-orange-500" /> Hijo:
            </span>
            <Link
              href="/hijos"
              className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar hijo
            </Link>
          </div>

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

        {/* 1. SOPAS O POSTRES */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-500" />
              1. Sopa o postre ({diaSeleccionado})
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">Incluido</span>
          </div>

          {cargandoPlatos ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">Cargando opciones...</div>
          ) : entradas.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No hay sopas o postres registrados para este día.</p>
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
            {(['Yape', 'Plin', 'Pagar luego'] as MetodoPago[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                  metodoPago === m
                    ? m === 'Pagar luego'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-950 shadow-xs'
                      : m === 'Plin'
                      ? 'border-sky-500 bg-sky-50 text-sky-950 shadow-xs'
                      : 'border-purple-600 bg-purple-50 text-purple-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {metodoPago === 'Yape' && (
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 mb-3 text-xs text-purple-950">
              <p className="font-bold">Número de Yape: {configPagos.numeroYape}</p>
              <p className="text-[11px] text-purple-700">{configPagos.titularYape}</p>
            </div>
          )}

          {metodoPago === 'Plin' && (
            <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 mb-3 text-xs text-sky-950">
              <p className="font-bold">Número de Plin: {configPagos.numeroPlin}</p>
              <p className="text-[11px] text-sky-700">{configPagos.titularPlin}</p>
            </div>
          )}

          {metodoPago === 'Pagar luego' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-950">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" /> Paga al recibir el almuerzo o en fiado
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                Tu hijo recibirá su almuerzo sin necesidad de comprobante previo. Se registrará en la cuenta de fiados para cancelar luego.
              </p>
            </div>
          )}

          {metodoPago !== 'Pagar luego' && (
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
                <p className="text-xs text-orange-600 mt-1 animate-pulse">
                  Optimizando y guardando comprobante en la nube...
                </p>
              )}
              {!subiendoComprobante && (cloudinaryUrl || comprimidoInfo) && (
                <p className="text-[11px] text-emerald-700 mt-1 font-bold flex items-center gap-1.5">
                  <span>✓ Comprobante listo</span>
                  {cloudinaryUrl && cloudinaryUrl.includes('cloudinary') && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-semibold">
                      En Cloudinary
                    </span>
                  )}
                  {comprimidoInfo && (
                    <span className="text-slate-500 font-normal">
                      ({comprimidoInfo.compressedSizeKb} KB)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
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

      {/* MODAL PARA AGREGAR ESTUDIANTE SI EL PADRE NO TIENE NINGUNO REGISTRADO */}
      {mostrarModalAgregarHijo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Agrega a tu Hijo</h3>
                  <p className="text-xs text-slate-500">Requerido para confirmar el pedido</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalAgregarHijo(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarHijoYConfirmar} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre y Apellidos del Hijo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. DHANA QUISPE CRISTOBAL"
                  value={nombreNuevoHijo}
                  onChange={(e) => setNombreNuevoHijo(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm uppercase font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Colegio *
                  </label>
                  {cargandoColegios ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400">
                      Cargando colegios...
                    </div>
                  ) : (
                    <select
                      required
                      value={colegioNuevoHijo || listaColegios[0] || ''}
                      onChange={(e) => setColegioNuevoHijo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    >
                      {listaColegios.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grado / Sección *
                  </label>
                  {cargandoColegios ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400">
                      Cargando grados...
                    </div>
                  ) : (
                    <select
                      required
                      value={gradoNuevoHijo || listaGrados[0] || ''}
                      onChange={(e) => setGradoNuevoHijo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    >
                      {listaGrados.map((gr) => (
                        <option key={gr} value={gr}>
                          {gr}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alergias o notas médicas (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Alérgico al maní, sin ensalada..."
                  value={alergiasNuevoHijo}
                  onChange={(e) => setAlergiasNuevoHijo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              {errorModalHijo && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorModalHijo}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={guardandoNuevoHijo}
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {guardandoNuevoHijo ? (
                    <span className="animate-pulse">Guardando hijo...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar y Confirmar Pedido</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarModalAgregarHijo(false)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition"
                >
                  Cancelar y Volver al Menú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN Y CORROBORACIÓN DEL PEDIDO */}
      {mostrarModalConfirmacionPedido && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-confirmacion-pedido-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) {
              setMostrarModalConfirmacionPedido(false);
            }
          }}
        >
          <div
            className="bg-white w-full max-w-md sm:max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs ring-4 ring-orange-50">
                  <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3
                    id="modal-confirmacion-pedido-titulo"
                    className="text-base sm:text-lg font-black text-slate-900 leading-snug"
                  >
                    Corrobora tu Pedido
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Revisa que los datos y los platos sean correctos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalConfirmacionPedido(false)}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                aria-label="Cerrar corroboración"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido de la Corroboración */}
            <div className="space-y-3 text-xs sm:text-sm">
              {/* Estudiante y Colegio */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Hijo y Destino
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-500">Hijo:</span>
                  <span className="font-black text-slate-900 text-sm text-right">
                    {hijoParaConfirmar?.nombreCompleto || estudiante || 'Hijo'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-500">Colegio:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {hijoParaConfirmar?.colegioNombre || colegio || 'No especificado'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-500">Grado y Sección:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {hijoParaConfirmar?.gradoSeccion || grado || 'No especificado'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-500">Teléfono:</span>
                  <span className="font-semibold text-slate-700 text-right">
                    {telefono.trim() || usuario?.telefono || 'No especificado'}
                  </span>
                </div>
              </div>

              {/* Día y Menú Seleccionado */}
              <div className="bg-orange-50/70 p-3.5 sm:p-4 rounded-2xl border border-orange-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-orange-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-600" /> Día Programado:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-orange-500 text-white font-black text-xs uppercase tracking-wide">
                    {diaSeleccionado}
                  </span>
                </div>

                <div className="space-y-2 pt-0.5">
                  <div>
                    <span className="text-[11px] font-bold text-orange-800 block">1. Sopa o postre seleccionado:</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm pl-2.5 mt-0.5 border-l-3 border-orange-500">
                      {entradaSeleccionada}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-orange-800 block">2. Plato de fondo (Segundo):</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm pl-2.5 mt-0.5 border-l-3 border-orange-500">
                      {segundoSeleccionado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones / Alergias */}
              {((observacion && observacion.trim().length > 0) || (hijoParaConfirmar?.alergiasNotas)) ? (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Observaciones especiales / Alergias:</span>
                    <span className="text-amber-800 font-medium">
                      {observacion.trim() || (hijoParaConfirmar?.alergiasNotas ? `Alergias: ${hijoParaConfirmar.alergiasNotas}` : '')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sin observaciones especiales (Menú regular).</span>
                </div>
              )}

              {/* Método de Pago y Monto Total */}
              <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Método de Pago:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {metodoPago}
                    {comprimidoInfo && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold">
                        Comprobante adjunto
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs sm:text-sm font-bold text-slate-300">Total a Pagar:</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">
                    S/ 12.00
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalConfirmacionPedido(false)}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition cursor-pointer text-center disabled:opacity-50"
              >
                Modificar Pedido
              </button>

              <button
                type="button"
                onClick={handleConfirmarPedidoFinal}
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-2xl shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isPending ? (
                  <span className="animate-pulse">Registrando pedido...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sí, Confirmar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
