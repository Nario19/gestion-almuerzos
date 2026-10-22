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
import { obtenerCarpetaCloudinaryPlato } from '@/lib/cloudinaryService';
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

  // Formulario y Modos de Registro en Menú Semanal
  const [modoRegistroMenu, setModoRegistroMenu] = useState<'MENU' | 'EXTRAS'>('MENU');

  // Estados para "Agregar Menú" (Sopa o ensalada + Segundo con precio conjunto)
  const [subtipoEntradaMenu, setSubtipoEntradaMenu] = useState<'Sopa' | 'Ensalada'>('Sopa');
  const [nombreEntradaMenu, setNombreEntradaMenu] = useState('');
  const [descripcionEntradaMenu, setDescripcionEntradaMenu] = useState('');
  const [nombreSegundoMenu, setNombreSegundoMenu] = useState('');
  const [descripcionSegundoMenu, setDescripcionSegundoMenu] = useState('');
  const [precioMenuCompleto, setPrecioMenuCompleto] = useState('12.00');
  const [imagenUrlMenu, setImagenUrlMenu] = useState('');
  const [imagenUrlEntradaMenu, setImagenUrlEntradaMenu] = useState('');
  const [imagenUrlSegundoMenu, setImagenUrlSegundoMenu] = useState('');
  const [subiendoFotoEntrada, setSubiendoFotoEntrada] = useState(false);
  const [subiendoFotoSegundo, setSubiendoFotoSegundo] = useState(false);

  // Estados para Edición de Plato en el Menú
  const [platoEditando, setPlatoEditando] = useState<Plato | null>(null);
  const [guardandoEdicionPlato, setGuardandoEdicionPlato] = useState(false);
  const [subiendoFotoEdicion, setSubiendoFotoEdicion] = useState(false);

  // Estados para "Agregar Extras" (Bebidas, postres, refrigerios con precio independiente)
  const [tipoExtra, setTipoExtra] = useState('Bebida');
  const [nombreExtra, setNombreExtra] = useState('');
  const [descripcionExtra, setDescripcionExtra] = useState('');
  const [precioExtra, setPrecioExtra] = useState('2.50');
  const [imagenUrlExtra, setImagenUrlExtra] = useState('');

  // Formulario de plato individual (retrocompatibilidad)
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

  // Carga de platos del menú del día activo
  useEffect(() => {
    if (!esAdmin) return;
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

    return () => {
      cancelado = true;
    };
  }, [diaActivo, esAdmin, colegioMenuSeleccionado, usuario?.colegioNombre, esSuperAdmin]);

  // Precarga silenciosa (prefetch) de toda la semana escolar en el panel de administración
  useEffect(() => {
    if (!esAdmin) return;
    const colFiltro = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    const timer = setTimeout(() => {
      dataService.precargarSemana(colFiltro);
    }, 150);

    return () => clearTimeout(timer);
  }, [esAdmin, colegioMenuSeleccionado, usuario?.colegioNombre, esSuperAdmin]);

  // Carga de metadatos administrativos (colegios, grados, filtros, observaciones, pedidos)
  useEffect(() => {
    if (!esAdmin) return;
    let cancelado = false;

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
  }, [esAdmin, colegioObjetivo]);

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

  // Subir foto para la Entrada del Menú (Sopa o Ensalada)
  const handleFotoUploadEntradaMenu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const colActual = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    setSubiendoFotoEntrada(true);
    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const carpeta = obtenerCarpetaCloudinaryPlato(colActual, diaActivo);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, carpeta);
      setImagenUrlEntradaMenu(urlNube);
      setImagenUrlMenu(urlNube);
    } catch (e) {
      console.error('Error procesando foto de la entrada:', e);
      alert('Hubo un problema al procesar la imagen de la sopa o ensalada.');
    } finally {
      setSubiendoFotoEntrada(false);
      setSubiendoFoto(false);
    }
  };

  // Subir foto para el Segundo Plato de Fondo
  const handleFotoUploadSegundoMenu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const colActual = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    setSubiendoFotoSegundo(true);
    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const carpeta = obtenerCarpetaCloudinaryPlato(colActual, diaActivo);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, carpeta);
      setImagenUrlSegundoMenu(urlNube);
    } catch (e) {
      console.error('Error procesando foto del segundo:', e);
      alert('Hubo un problema al procesar la imagen del segundo.');
    } finally {
      setSubiendoFotoSegundo(false);
      setSubiendoFoto(false);
    }
  };

  // Subir foto para el Menú Completo (retrocompatibilidad)
  const handleFotoUploadMenu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const colActual = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const carpeta = obtenerCarpetaCloudinaryPlato(colActual, diaActivo);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, carpeta);
      setImagenUrlMenu(urlNube);
      setImagenUrlEntradaMenu(urlNube);
    } catch (e) {
      console.error('Error procesando foto del menú:', e);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  // Subir foto para Extra (opcional)
  const handleFotoUploadExtra = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const colActual = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    setSubiendoFoto(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const carpeta = obtenerCarpetaCloudinaryPlato(colActual, diaActivo);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, carpeta);
      setImagenUrlExtra(urlNube);
    } catch (e) {
      console.error('Error procesando foto del extra:', e);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  // Guardar Menú Completo o Plato Individual del Menú (Sopa/Ensalada sola, Segundo solo, o ambos)
  const handleCrearMenuCompleto = async (e: React.FormEvent) => {
    e.preventDefault();
    const tieneEntrada = Boolean(nombreEntradaMenu.trim());
    const tieneSegundo = Boolean(nombreSegundoMenu.trim());

    if (!tieneEntrada && !tieneSegundo) {
      alert('Por favor ingresa al menos una opción: el nombre de la sopa o ensalada, o el del segundo plato.');
      return;
    }
    if (guardandoPlato) return;

    const colFiltro = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    const colIdFiltro = (!esSuperAdmin && usuario?.colegioId)
      ? usuario.colegioId
      : undefined;

    const precioFinal = parseFloat(precioMenuCompleto) || 12.0;
    setGuardandoPlato(true);

    try {
      const platosCreados: Plato[] = [];

      // 1. Guardar Entrada (Sopa o Ensalada) con precio 0 (incluida en el menú)
      if (tieneEntrada) {
        const descEntradaCompleta = `${subtipoEntradaMenu === 'Ensalada' ? '[Ensalada]' : '[Sopa]'} ${descripcionEntradaMenu.trim()}`.trim();
        const nuevaEntrada = await dataService.agregarPlato({
          diaSemana: diaActivo,
          tipo: 'ENTRADA',
          nombre: nombreEntradaMenu.trim(),
          descripcion: descEntradaCompleta || undefined,
          precio: 0,
          imagenUrl: imagenUrlEntradaMenu || imagenUrlMenu || undefined,
          disponible: true,
          orden: platos.length + 1,
          colegioNombre: colFiltro,
          colegioId: colIdFiltro,
        });
        platosCreados.push(nuevaEntrada);
      }

      // 2. Guardar Segundo (Plato de Fondo) con el precio completo del menú
      if (tieneSegundo) {
        const nuevoSegundo = await dataService.agregarPlato({
          diaSemana: diaActivo,
          tipo: 'SEGUNDO',
          nombre: nombreSegundoMenu.trim(),
          descripcion: descripcionSegundoMenu.trim() || undefined,
          precio: precioFinal,
          imagenUrl: imagenUrlSegundoMenu || undefined,
          disponible: true,
          orden: platos.length + (tieneEntrada ? 2 : 1),
          colegioNombre: colFiltro,
          colegioId: colIdFiltro,
        });
        platosCreados.push(nuevoSegundo);
      }

      setPlatos((prev) => [...prev, ...platosCreados]);
      setNombreEntradaMenu('');
      setDescripcionEntradaMenu('');
      setNombreSegundoMenu('');
      setDescripcionSegundoMenu('');
      setImagenUrlEntradaMenu('');
      setImagenUrlSegundoMenu('');
      setImagenUrlMenu('');
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch (err: unknown) {
      console.error('Error al guardar menú completo:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || 'Error al guardar el menú en la base de datos.');
    } finally {
      setGuardandoPlato(false);
    }
  };

  // Manejadores para Edición de Plato
  const handleIniciarEditarPlato = (plato: Plato) => {
    setPlatoEditando({ ...plato });
  };

  const handleCerrarEditarPlato = () => {
    setPlatoEditando(null);
    setSubiendoFotoEdicion(false);
  };

  const handleFotoUploadEdicion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !platoEditando) return;

    setSubiendoFotoEdicion(true);
    try {
      const res = await compressImage(file, 800, 0.8);
      const carpeta = obtenerCarpetaCloudinaryPlato(platoEditando.colegioNombre, platoEditando.diaSemana);
      const urlNube = await subirImagenACloudinary(res.compressedDataUrl, carpeta);
      setPlatoEditando((prev) => (prev ? { ...prev, imagenUrl: urlNube } : null));
    } catch (e) {
      console.error('Error procesando foto en edición:', e);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setSubiendoFotoEdicion(false);
    }
  };

  const handleGuardarEdicionPlato = async (platoModificado: Plato) => {
    if (!platoModificado.nombre.trim()) {
      alert('El nombre del plato no puede estar vacío.');
      return;
    }
    setGuardandoEdicionPlato(true);
    try {
      const actualizado = await dataService.actualizarPlato(platoModificado.id, platoModificado);
      setPlatos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      setPlatoEditando(null);
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 2500);
    } catch (err) {
      console.error('Error al actualizar plato:', err);
      alert('No se pudo guardar la edición del plato.');
    } finally {
      setGuardandoEdicionPlato(false);
    }
  };

  // Guardar Extra individual (Bebida, postre, refrigerio)
  const handleCrearExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreExtra.trim() || guardandoPlato) return;

    const colFiltro = (!esSuperAdmin && usuario?.colegioNombre)
      ? usuario.colegioNombre
      : (colegioMenuSeleccionado !== 'TODOS' ? colegioMenuSeleccionado : undefined);

    const colIdFiltro = (!esSuperAdmin && usuario?.colegioId)
      ? usuario.colegioId
      : undefined;

    setGuardandoPlato(true);
    try {
      const nuevo = await dataService.agregarPlato({
        diaSemana: diaActivo,
        tipo: tipoExtra,
        nombre: nombreExtra.trim(),
        descripcion: descripcionExtra.trim() || undefined,
        precio: parseFloat(precioExtra) || 0,
        imagenUrl: imagenUrlExtra || undefined,
        disponible: true,
        orden: platos.length + 1,
        colegioNombre: colFiltro,
        colegioId: colIdFiltro,
      });

      setPlatos((prev) => [...prev, nuevo]);
      setNombreExtra('');
      setDescripcionExtra('');
      setImagenUrlExtra('');
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
    } catch (err: unknown) {
      console.error('Error al guardar extra en el menú:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || 'Error al guardar el extra en la base de datos.');
    } finally {
      setGuardandoPlato(false);
    }
  };

  // Manejador tradicional para plato individual (retrocompatibilidad)
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
        imagenUrl: imagenUrlNueva || undefined,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-900" />
            Panel de Administración
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Métricas clave del negocio, gestión del menú semanal y configuración
          </p>
        </div>

        <div className="flex items-center gap-2">
          {esSuperAdmin ? (
            <Link
              href="/superadmin"
              className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
              title="Panel exclusivo para gestión de colegios y cuentas de administradores"
            >
              <Building2 className="w-4 h-4" />
              <span>Gestión Colegios & Admins</span>
            </Link>
          ) : usuario?.colegioNombre ? (
            <span className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {usuario.colegioNombre}
            </span>
          ) : null}
          <span className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-zinc-400" /> Supabase Activo
          </span>
        </div>
      </div>

      {guardadoExitoso && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          ¡Configuración guardada con éxito!
        </div>
      )}

      {/* Pestañas de Gestión Administrativa */}
      <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 mb-6 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setTabActiva('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            tabActiva === 'dashboard'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard & KPIs
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('menu')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            tabActiva === 'menu'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Menú Semanal
        </button>

        {esSuperAdmin && (
          <Link
            href="/superadmin"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 text-zinc-600 hover:text-zinc-950 hover:bg-white/50"
            title="Ir al panel de gestión de colegios y cuentas de administradores"
          >
            <Building2 className="w-4 h-4" />
            Colegios & Admins ({colegios.length})
          </Link>
        )}

        <button
          type="button"
          onClick={() => setTabActiva('grados')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            tabActiva === 'grados'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Grados y Secciones ({grados.length})
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('observaciones')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
            tabActiva === 'observaciones'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
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
          modoRegistroMenu={modoRegistroMenu}
          setModoRegistroMenu={setModoRegistroMenu}
          subtipoEntradaMenu={subtipoEntradaMenu}
          setSubtipoEntradaMenu={setSubtipoEntradaMenu}
          nombreEntradaMenu={nombreEntradaMenu}
          setNombreEntradaMenu={setNombreEntradaMenu}
          descripcionEntradaMenu={descripcionEntradaMenu}
          setDescripcionEntradaMenu={setDescripcionEntradaMenu}
          nombreSegundoMenu={nombreSegundoMenu}
          setNombreSegundoMenu={setNombreSegundoMenu}
          descripcionSegundoMenu={descripcionSegundoMenu}
          setDescripcionSegundoMenu={setDescripcionSegundoMenu}
          precioMenuCompleto={precioMenuCompleto}
          setPrecioMenuCompleto={setPrecioMenuCompleto}
          imagenUrlMenu={imagenUrlMenu}
          setImagenUrlMenu={setImagenUrlMenu}
          handleFotoUploadMenu={handleFotoUploadMenu}
          imagenUrlEntradaMenu={imagenUrlEntradaMenu}
          setImagenUrlEntradaMenu={setImagenUrlEntradaMenu}
          handleFotoUploadEntradaMenu={handleFotoUploadEntradaMenu}
          subiendoFotoEntrada={subiendoFotoEntrada}
          imagenUrlSegundoMenu={imagenUrlSegundoMenu}
          setImagenUrlSegundoMenu={setImagenUrlSegundoMenu}
          handleFotoUploadSegundoMenu={handleFotoUploadSegundoMenu}
          subiendoFotoSegundo={subiendoFotoSegundo}
          handleCrearMenuCompleto={handleCrearMenuCompleto}
          tipoExtra={tipoExtra}
          setTipoExtra={setTipoExtra}
          nombreExtra={nombreExtra}
          setNombreExtra={setNombreExtra}
          descripcionExtra={descripcionExtra}
          setDescripcionExtra={setDescripcionExtra}
          precioExtra={precioExtra}
          setPrecioExtra={setPrecioExtra}
          imagenUrlExtra={imagenUrlExtra}
          setImagenUrlExtra={setImagenUrlExtra}
          handleFotoUploadExtra={handleFotoUploadExtra}
          handleCrearExtra={handleCrearExtra}
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
          onIniciarEditarPlato={handleIniciarEditarPlato}
          platoEditando={platoEditando}
          setPlatoEditando={setPlatoEditando}
          onCerrarEditarPlato={handleCerrarEditarPlato}
          onGuardarEdicionPlato={handleGuardarEdicionPlato}
          guardandoEdicionPlato={guardandoEdicionPlato}
          subiendoFotoEdicion={subiendoFotoEdicion}
          onFotoUploadEdicion={handleFotoUploadEdicion}
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
