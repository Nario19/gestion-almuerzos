'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Utensils,
  Building2,
  GraduationCap,
  Tag,
  CheckCircle,
  Cloud,
} from 'lucide-react';
import { dataService, obtenerDiaActualSemana } from '@/lib/dataService';
import { compressImage } from '@/lib/imageCompression';
import { subirImagenACloudinary } from '@/lib/cloudinaryService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import { obtenerFechaHoyPeru, calcularOffsetFechaPeru } from '@/lib/dateUtils';
import { Plato, DiaSemana, Pedido, FiltroGrados } from '@/types';

// Componentes modulares de pestañas del Administrador
import AdminDashboardTab from './components/AdminDashboardTab';
import AdminMenuSemanalTab from './components/AdminMenuSemanalTab';
import AdminGradosTab from './components/AdminGradosTab';
import AdminObservacionesTab from './components/AdminObservacionesTab';

export default function AdminPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();
  const [diaActivo, setDiaActivo] = useState<DiaSemana>(obtenerDiaActualSemana());
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [, setCargando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [guardandoPlato, setGuardandoPlato] = useState(false);

  // Estado para alertas y modales de confirmación de eliminación
  const [confirmacion, setConfirmacion] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: React.ReactNode;
    textoBotonConfirmar?: string;
    onConfirmar: () => Promise<void> | void;
  }>({
    abierto: false,
    titulo: '',
    mensaje: '',
    onConfirmar: () => {},
  });
  const [ejecutandoConfirmacion, setEjecutandoConfirmacion] = useState(false);

  const ejecutarAccionConfirmada = async () => {
    setEjecutandoConfirmacion(true);
    try {
      await confirmacion.onConfirmar();
      setConfirmacion((prev) => ({ ...prev, abierto: false }));
    } catch (err) {
      console.error('Error ejecutando acción de eliminación:', err);
    } finally {
      setEjecutandoConfirmacion(false);
    }
  };

  // Pedidos y Filtrado por Fecha para KPIs del Dashboard
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const fechaHoy = obtenerFechaHoyPeru();
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);

  const cambiarDia = (dias: number) => {
    if (fechaFiltro === 'TODAS' || fechaFiltro === 'SEMANA') {
      setFechaFiltro(calcularOffsetFechaPeru(fechaHoy, dias));
    } else {
      setFechaFiltro(calcularOffsetFechaPeru(fechaFiltro, dias));
    }
  };

  // Formulario de nuevo plato
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([
    'Sopa o postre',
    'Segundo',
    'Refrigerio',
    'Bebida',
    'Postre',
  ]);
  const [tipoNuevo, setTipoNuevo] = useState<string>('Segundo');
  const [otroTipoInput, setOtroTipoInput] = useState('');
  const [mostrandoInputOtroTipo, setMostrandoInputOtroTipo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [descripcionNueva, setDescripcionNueva] = useState('');
  const [precioNuevo, setPrecioNuevo] = useState('12.00');
  const [imagenUrlNueva, setImagenUrlNueva] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [tabActiva, setTabActiva] = useState<'dashboard' | 'menu' | 'grados' | 'observaciones'>('dashboard');

  // Colegios
  const [colegios, setColegios] = useState<string[]>([]);

  // Grados y Filtros de Grados
  const [grados, setGrados] = useState<string[]>([]);
  const [nuevoGrado, setNuevoGrado] = useState('');
  const [filtrosGrados, setFiltrosGrados] = useState<FiltroGrados[]>([]);
  const [filtroEditandoId, setFiltroEditandoId] = useState<string | null>(null);
  const [nombreFiltroGrados, setNombreFiltroGrados] = useState('');
  const [gradosSeleccionadosFiltro, setGradosSeleccionadosFiltro] = useState<string[]>([]);
  const [guardandoFiltro, setGuardandoFiltro] = useState(false);
  const [errorFiltro, setErrorFiltro] = useState<string | null>(null);
  const [exitoFiltro, setExitoFiltro] = useState(false);

  // Observaciones
  const [observaciones, setObservaciones] = useState<string[]>([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  // Colegio activo para el menú y configuración
  const [colegioMenuSeleccionado, setColegioMenuSeleccionado] = useState<string>(
    !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : 'TODOS'
  );

  const colegioObjetivo = (!esSuperAdmin && usuario?.colegioNombre)
    ? usuario.colegioNombre
    : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : (colegios[0] || ''));

  useEffect(() => {
    if (esAdmin) {
      let cancelado = false;
      const colFiltro = (!esSuperAdmin && usuario?.colegioNombre)
        ? usuario.colegioNombre
        : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

      dataService.obtenerPlatosPorDia(diaActivo, colFiltro).then((data) => {
        if (!cancelado) {
          setPlatos(data);
          setCargando(false);
        }
      });
      dataService.obtenerColegios().then((cols) => { if (!cancelado) setColegios(cols); });
      dataService.obtenerGrados(colegioObjetivo).then((g) => { if (!cancelado) setGrados(g); });
      dataService.obtenerFiltrosGrados(colegioObjetivo).then((fg) => { if (!cancelado) setFiltrosGrados(fg); });
      dataService.obtenerObservaciones(colegioObjetivo).then((obs) => { if (!cancelado) setObservaciones(obs); });
      dataService.obtenerPedidos().then((peds) => { if (!cancelado) setPedidos(peds); });

      const desuscribir = dataService.suscribirCambios(() => {
        dataService.obtenerPedidos().then(setPedidos);
        dataService.obtenerColegios().then(setColegios);
        dataService.obtenerGrados(colegioObjetivo).then(setGrados);
        dataService.obtenerFiltrosGrados(colegioObjetivo).then(setFiltrosGrados);
        dataService.obtenerObservaciones(colegioObjetivo).then(setObservaciones);
      });
      return () => {
        cancelado = true;
        desuscribir();
      };
    }
  }, [diaActivo, esAdmin, colegioMenuSeleccionado, usuario?.colegioNombre, esSuperAdmin, colegioObjetivo]);

  const handleAgregarTipoPersonalizado = () => {
    const val = otroTipoInput.trim();
    if (val) {
      if (!tiposDisponibles.includes(val)) {
        setTiposDisponibles((prev) => [...prev, val]);
      }
      setTipoNuevo(val);
      setOtroTipoInput('');
      setMostrandoInputOtroTipo(false);
    }
  };

  const handleAgregarGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGrado.trim()) return;
    const res = await dataService.agregarGrado(nuevoGrado.trim(), colegioObjetivo);
    setGrados(res);
    setNuevoGrado('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  const handleSolicitarEliminarGrado = (nombre: string) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Eliminar grado "${nombre}"?`,
      mensaje: (
        <span>
          ¿Estás seguro de que deseas eliminar <strong>{nombre}</strong> del colegio{' '}
          <strong>{colegioObjetivo || 'actual'}</strong>? Dejará de ofrecerse como opción de grado y sección escolar.
        </span>
      ),
      textoBotonConfirmar: 'Sí, eliminar grado',
      onConfirmar: async () => {
        const res = await dataService.eliminarGrado(nombre, colegioObjetivo);
        setGrados(res);
      },
    });
  };

  const toggleGradoEnFiltro = (g: string) => {
    setGradosSeleccionadosFiltro((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleSeleccionarTodosGrados = () => {
    setGradosSeleccionadosFiltro([...grados]);
  };

  const handleDeseleccionarTodosGrados = () => {
    setGradosSeleccionadosFiltro([]);
  };

  const handleGuardarFiltroGrados = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFiltro(null);
    if (!nombreFiltroGrados.trim()) {
      setErrorFiltro('Ingresa un nombre para el filtro (ej. Primaria, Secundaria, 1.° a 3.°).');
      return;
    }
    if (gradosSeleccionadosFiltro.length === 0) {
      setErrorFiltro('Selecciona al menos un grado para este filtro.');
      return;
    }

    setGuardandoFiltro(true);
    try {
      await dataService.guardarFiltroGrados({
        id: filtroEditandoId || undefined,
        colegioNombre: colegioObjetivo,
        nombre: nombreFiltroGrados.trim(),
        grados: gradosSeleccionadosFiltro,
      });
      const actualizados = await dataService.obtenerFiltrosGrados(colegioObjetivo);
      setFiltrosGrados(actualizados);
      setFiltroEditandoId(null);
      setNombreFiltroGrados('');
      setGradosSeleccionadosFiltro([]);
      setExitoFiltro(true);
      setTimeout(() => setExitoFiltro(false), 2500);
    } catch (err) {
      console.error('Error guardando filtro de grados:', err);
      setErrorFiltro('No se pudo guardar el filtro de grados.');
    } finally {
      setGuardandoFiltro(false);
    }
  };

  const handleIniciarEditarFiltro = (filtro: FiltroGrados) => {
    setFiltroEditandoId(filtro.id);
    setNombreFiltroGrados(filtro.nombre);
    setGradosSeleccionadosFiltro([...filtro.grados]);
    setErrorFiltro(null);
  };

  const handleCancelarEditarFiltro = () => {
    setFiltroEditandoId(null);
    setNombreFiltroGrados('');
    setGradosSeleccionadosFiltro([]);
    setErrorFiltro(null);
  };

  const handleSolicitarEliminarFiltro = (filtro: FiltroGrados) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Eliminar filtro "${filtro.nombre}"?`,
      mensaje: (
        <span>
          ¿Estás seguro de que deseas eliminar el filtro de grados <strong>{filtro.nombre}</strong> del colegio{' '}
          <strong>{colegioObjetivo || 'actual'}</strong>? Dejará de aparecer como acceso rápido en Despacho.
        </span>
      ),
      textoBotonConfirmar: 'Sí, eliminar filtro',
      onConfirmar: async () => {
        await dataService.eliminarFiltroGrados(filtro.id, colegioObjetivo);
        const actualizados = await dataService.obtenerFiltrosGrados(colegioObjetivo);
        setFiltrosGrados(actualizados);
      },
    });
  };

  const handleAgregarObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObservacion.trim()) return;
    const res = await dataService.agregarObservacion(nuevaObservacion.trim(), colegioObjetivo);
    setObservaciones(res);
    setNuevaObservacion('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  const handleSolicitarEliminarObservacion = (tag: string) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Eliminar etiqueta "${tag}"?`,
      mensaje: (
        <span>
          ¿Estás seguro de que deseas eliminar la indicación especial <strong>&quot;{tag}&quot;</strong> del colegio{' '}
          <strong>{colegioObjetivo || 'actual'}</strong>? Ya no se sugerirá en las notas rápidas de los pedidos.
        </span>
      ),
      textoBotonConfirmar: 'Sí, eliminar etiqueta',
      onConfirmar: async () => {
        const res = await dataService.eliminarObservacion(tag, colegioObjetivo);
        setObservaciones(res);
      },
    });
  };

  // Manejador para comprimir foto del plato antes de guardarla en Cloudinary
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, 'platos');
      setImagenUrlNueva(urlNube);
    } catch (e) {
      console.error('Error procesando foto:', e);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleCrearPlato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim() || guardandoPlato) return;

    const colFiltro = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    const colIdFiltro = (!esSuperAdmin && usuario?.colegioId)
      ? usuario.colegioId
      : undefined;

    const esSopa = tipoNuevo === 'Sopa o postre' || tipoNuevo === 'ENTRADA';
    setGuardandoPlato(true);
    try {
      const nuevo = await dataService.agregarPlato({
        diaSemana: diaActivo,
        tipo: tipoNuevo,
        nombre: nombreNuevo.trim(),
        descripcion: descripcionNueva.trim() || undefined,
        precio: esSopa ? 0 : parseFloat(precioNuevo) || 12.0,
        imagenUrl: imagenUrlNueva || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        disponible: true,
        orden: platos.length + 1,
        colegioNombre: colFiltro,
        colegioId: colIdFiltro,
      });

      setPlatos((prev) => [...prev, nuevo]);
      setNombreNuevo('');
      setDescripcionNueva('');
      setImagenUrlNueva('');
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch (err: unknown) {
      console.error('Error al guardar plato en el menú:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || 'Error al guardar el plato en la base de datos.');
    } finally {
      setGuardandoPlato(false);
    }
  };

  const handleSolicitarEliminarPlato = (plato: Plato) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Eliminar "${plato.nombre}"?`,
      mensaje: (
        <span>
          ¿Estás seguro de que deseas retirar <strong>{plato.nombre}</strong> ({plato.tipo}) del catálogo de {plato.diaSemana.toLowerCase()}? Ya no aparecerá disponible para los pedidos de los padres.
        </span>
      ),
      textoBotonConfirmar: 'Sí, eliminar plato',
      onConfirmar: async () => {
        await dataService.eliminarPlato(plato.id);
        setPlatos((prev) => prev.filter((p) => p.id !== plato.id));
      },
    });
  };

  // Categorías de platos dinámicas
  const categoriasOrdenadas = useMemo(() => {
    const ordenBase = ['Sopa o postre', 'Segundo', 'Refrigerio', 'Bebida', 'Postre'];
    const categoriasPresentes = new Set<string>();
    platos.forEach((p) => {
      let t = p.tipo;
      if (t === 'ENTRADA') t = 'Sopa o postre';
      else if (t === 'SEGUNDO') t = 'Segundo';
      categoriasPresentes.add(t);
    });
    const lista = [...ordenBase];
    categoriasPresentes.forEach((c) => {
      if (!lista.includes(c)) lista.push(c);
    });
    return lista;
  }, [platos]);

  const platosPorCategoria = useMemo(() => {
    const mapa: Record<string, Plato[]> = {};
    for (const plato of platos) {
      let t = plato.tipo;
      if (t === 'ENTRADA') t = 'Sopa o postre';
      else if (t === 'SEGUNDO') t = 'Segundo';
      if (!mapa[t]) mapa[t] = [];
      mapa[t].push(plato);
    }
    return mapa;
  }, [platos]);

  // Filtrado de pedidos según el colegio asignado y la fecha/período seleccionado
  const pedidosBase = (!esSuperAdmin && usuario?.colegioNombre)
    ? pedidos.filter((p) => p.colegioNombre === usuario.colegioNombre)
    : pedidos;

  const pedidosPeriodo = pedidosBase.filter((p) => {
    if (fechaFiltro === 'TODAS') return true;
    if (fechaFiltro === 'SEMANA') {
      const fechaP = new Date(p.createdAt || p.fecha);
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      return fechaP >= hace7Dias;
    }
    const f = (p.fecha || '').slice(0, 10);
    return f === fechaFiltro;
  });

  // Métricas financieras y volumen
  const pedidosActivos = pedidosPeriodo.filter((p) => p.estadoPedido !== 'CANCELADO');
  const totalAlmuerzos = pedidosActivos.length;
  const ventasTotales = pedidosActivos.reduce((acc, p) => acc + (p.monto || 12), 0);
  const pedidosPagados = pedidosActivos.filter((p) => p.estadoPago === 'PAGADO');
  const ingresosRecaudados = pedidosPagados.reduce((acc, p) => acc + (p.monto || 12), 0);
  const pedidosPendientes = pedidosActivos.filter((p) => p.estadoPago !== 'PAGADO');
  const montoPorCobrar = pedidosPendientes.reduce((acc, p) => acc + (p.monto || 12), 0);
  const porcentajeCobrado = totalAlmuerzos > 0 ? Math.round((pedidosPagados.length / totalAlmuerzos) * 100) : 0;
  const ticketPromedio = totalAlmuerzos > 0 ? (ventasTotales / totalAlmuerzos).toFixed(2) : '12.00';

  // Métricas operativas
  const pedidosOperativos = pedidosActivos.filter(
    (p) => p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO'
  );
  const entregados = pedidosOperativos.filter((p) => p.estadoPedido === 'ENTREGADO').length;
  const faltaEntregar = pedidosOperativos.filter((p) => p.estadoPedido !== 'ENTREGADO').length;
  const totalParaEntrega = entregados + faltaEntregar;
  const porcentajeEntrega = totalParaEntrega > 0 ? Math.round((entregados / totalParaEntrega) * 100) : 0;

  // Distribución por colegio
  const pedidosPorColegio = pedidosActivos.reduce((acc, p) => {
    const col = p.colegioNombre || 'Colegio General';
    acc[col] = (acc[col] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rankingColegios = Object.entries(pedidosPorColegio).sort((a, b) => b[1] - a[1]);

  // Rankings de frecuencia
  const segundosFrecuencia = pedidosActivos.reduce((acc, p) => {
    if (p.segundoNombre) {
      acc[p.segundoNombre] = (acc[p.segundoNombre] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topSegundos = Object.entries(segundosFrecuencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const entradasFrecuencia = pedidosActivos.reduce((acc, p) => {
    if (p.entradaNombre) {
      acc[p.entradaNombre] = (acc[p.entradaNombre] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topEntradas = Object.entries(entradasFrecuencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para la administración del menú de Placeres Culinarios." />;
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-500" />
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas clave del negocio, gestión del menú semanal y configuración
          </p>
        </div>

        <div className="flex items-center gap-2">
          {esSuperAdmin ? (
            <Link
              href="/superadmin"
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Panel exclusivo para gestión de colegios y cuentas de administradores"
            >
              <Building2 className="w-4 h-4" />
              <span>Gestión Colegios & Admins</span>
            </Link>
          ) : usuario?.colegioNombre ? (
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> {usuario.colegioNombre}
            </span>
          ) : null}
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> Supabase Activo
          </span>
        </div>
      </div>

      {guardadoExitoso && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          ¡Configuración guardada con éxito!
        </div>
      )}

      {/* Pestañas de Gestión Administrativa */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTabActiva('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            tabActiva === 'dashboard'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard & KPIs
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('menu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            tabActiva === 'menu'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Menú Semanal
        </button>

        {esSuperAdmin && (
          <Link
            href="/superadmin"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
            title="Ir al panel de gestión de colegios y cuentas de administradores"
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            Colegios & Admins ({colegios.length})
          </Link>
        )}

        <button
          type="button"
          onClick={() => setTabActiva('grados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            tabActiva === 'observaciones'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          Observaciones ({observaciones.length})
        </button>
      </div>

      {/* PESTAÑA: DASHBOARD & KPIS */}
      {tabActiva === 'dashboard' && (
        <AdminDashboardTab
          pedidosPeriodo={pedidosPeriodo}
          pedidosActivos={pedidosActivos}
          ventasTotales={ventasTotales}
          ticketPromedio={ticketPromedio}
          totalAlmuerzos={totalAlmuerzos}
          porcentajeCobrado={porcentajeCobrado}
          ingresosRecaudados={ingresosRecaudados}
          montoPorCobrar={montoPorCobrar}
          pedidosPendientes={pedidosPendientes}
          entregados={entregados}
          faltaEntregar={faltaEntregar}
          totalParaEntrega={totalParaEntrega}
          porcentajeEntrega={porcentajeEntrega}
          rankingColegios={rankingColegios}
          topSegundos={topSegundos}
          topEntradas={topEntradas}
          fechaFiltro={fechaFiltro}
          setFechaFiltro={setFechaFiltro}
          cambiarDia={cambiarDia}
          fechaHoy={fechaHoy}
          esSuperAdmin={esSuperAdmin}
          colegioNombre={usuario?.colegioNombre}
          usuario={usuario}
        />
      )}

      {/* PESTAÑA: MENÚ SEMANAL */}
      {tabActiva === 'menu' && (
        <AdminMenuSemanalTab
          diaActivo={diaActivo}
          setDiaActivo={setDiaActivo}
          esSuperAdmin={esSuperAdmin}
          colegios={colegios}
          colegioMenuSeleccionado={colegioMenuSeleccionado}
          setColegioMenuSeleccionado={setColegioMenuSeleccionado}
          tiposDisponibles={tiposDisponibles}
          tipoNuevo={tipoNuevo}
          setTipoNuevo={setTipoNuevo}
          mostrandoInputOtroTipo={mostrandoInputOtroTipo}
          setMostrandoInputOtroTipo={setMostrandoInputOtroTipo}
          otroTipoInput={otroTipoInput}
          setOtroTipoInput={setOtroTipoInput}
          handleAgregarTipoPersonalizado={handleAgregarTipoPersonalizado}
          nombreNuevo={nombreNuevo}
          setNombreNuevo={setNombreNuevo}
          descripcionNueva={descripcionNueva}
          setDescripcionNueva={setDescripcionNueva}
          precioNuevo={precioNuevo}
          setPrecioNuevo={setPrecioNuevo}
          imagenUrlNueva={imagenUrlNueva}
          subiendoFoto={subiendoFoto}
          handleFotoUpload={handleFotoUpload}
          handleCrearPlato={handleCrearPlato}
          guardandoPlato={guardandoPlato}
          platos={platos}
          categoriasOrdenadas={categoriasOrdenadas}
          platosPorCategoria={platosPorCategoria}
          handleSolicitarEliminarPlato={handleSolicitarEliminarPlato}
        />
      )}

      {/* PESTAÑA: GRADOS Y SECCIONES (INCLUYE FILTROS DE GRADOS PARA DESPACHO) */}
      {tabActiva === 'grados' && (
        <AdminGradosTab
          esSuperAdmin={esSuperAdmin}
          colegios={colegios}
          colegioObjetivo={colegioObjetivo}
          setColegioMenuSeleccionado={setColegioMenuSeleccionado}
          nuevoGrado={nuevoGrado}
          setNuevoGrado={setNuevoGrado}
          handleAgregarGrado={handleAgregarGrado}
          grados={grados}
          handleSolicitarEliminarGrado={handleSolicitarEliminarGrado}
          filtrosGrados={filtrosGrados}
          filtroEditandoId={filtroEditandoId}
          nombreFiltroGrados={nombreFiltroGrados}
          setNombreFiltroGrados={setNombreFiltroGrados}
          gradosSeleccionadosFiltro={gradosSeleccionadosFiltro}
          guardandoFiltro={guardandoFiltro}
          errorFiltro={errorFiltro}
          exitoFiltro={exitoFiltro}
          handleGuardarFiltroGrados={handleGuardarFiltroGrados}
          handleCancelarEditarFiltro={handleCancelarEditarFiltro}
          handleIniciarEditarFiltro={handleIniciarEditarFiltro}
          handleSolicitarEliminarFiltro={handleSolicitarEliminarFiltro}
          toggleGradoEnFiltro={toggleGradoEnFiltro}
          handleSeleccionarTodosGrados={handleSeleccionarTodosGrados}
          handleDeseleccionarTodosGrados={handleDeseleccionarTodosGrados}
        />
      )}

      {/* PESTAÑA: OBSERVACIONES / RESTRICCIONES */}
      {tabActiva === 'observaciones' && (
        <AdminObservacionesTab
          esSuperAdmin={esSuperAdmin}
          colegios={colegios}
          colegioObjetivo={colegioObjetivo}
          setColegioMenuSeleccionado={setColegioMenuSeleccionado}
          nuevaObservacion={nuevaObservacion}
          setNuevaObservacion={setNuevaObservacion}
          handleAgregarObservacion={handleAgregarObservacion}
          observaciones={observaciones}
          handleSolicitarEliminarObservacion={handleSolicitarEliminarObservacion}
        />
      )}

      {/* Modal de Alerta de Confirmación de Eliminación */}
      <ModalConfirmacion
        abierto={confirmacion.abierto}
        onCerrar={() => setConfirmacion((prev) => ({ ...prev, abierto: false }))}
        onConfirmar={ejecutarAccionConfirmada}
        cargando={ejecutandoConfirmacion}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        textoBotonConfirmar={confirmacion.textoBotonConfirmar || 'Sí, eliminar'}
        tipo="peligro"
      />
    </div>
  );
}
