'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  User,
  Key,
  Lock,
  Phone,
  Mail,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  BarChart3,
  PackageCheck,
  ChefHat,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  GraduationCap,
  Download,
  Printer,
  X,
  Smartphone,
  CreditCard,
  Clock,
  FileImage,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  dataService,
  CONFIG_PAGOS_DEFAULT,
  HORA_LIMITE_DEFAULT,
  FAVICON_DEFAULT,
  obtenerIdentificadorColegio,
  ResumenLimpiezaComprobantes,
} from '@/lib/dataService';
import { formatearHoraLimiteLegible } from '@/lib/dateUtils';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import { ColegioDetallado, AdminColegioInfo, EstudianteColegioInfo, ConfiguracionPagos } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function SuperAdminPage() {
  const { usuario, esSuperAdmin, cargando: cargandoAuth } = useAuth();

  const [colegios, setColegios] = useState<ColegioDetallado[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal para Crear / Editar Colegio con Administrador
  const [modalColegioAbierto, setModalColegioAbierto] = useState(false);
  const [colegioEnEdicion, setColegioEnEdicion] = useState<ColegioDetallado | null>(null);

  // Campos del Formulario Colegio
  const [nombreColegio, setNombreColegio] = useState('');
  const [siglaColegio, setSiglaColegio] = useState('');
  const [sedeColegio, setSedeColegio] = useState('');
  const [activoColegio, setActivoColegio] = useState(true);

  // Campos del Administrador asignado
  const [adminNombre, setAdminNombre] = useState('');
  const [adminDni, setAdminDni] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminTelefono, setAdminTelefono] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  // Configuración de Métodos de Pago Globales (Yape & Plin)
  const [configPagos, setConfigPagos] = useState<ConfiguracionPagos>(CONFIG_PAGOS_DEFAULT);
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false);
  const [numeroYape, setNumeroYape] = useState('');
  const [titularYape, setTitularYape] = useState('');
  const [numeroPlin, setNumeroPlin] = useState('');
  const [titularPlin, setTitularPlin] = useState('');
  const [guardandoPagos, setGuardandoPagos] = useState(false);

  // Configuración de Hora Límite de Pedidos del Día
  const [horaLimite, setHoraLimite] = useState<string>(HORA_LIMITE_DEFAULT);
  const [modalHoraLimiteAbierto, setModalHoraLimiteAbierto] = useState(false);
  const [nuevaHoraLimite, setNuevaHoraLimite] = useState('09:30');
  const [guardandoHoraLimite, setGuardandoHoraLimite] = useState(false);

  // Configuración de Favicon / Identidad Visual
  const [faviconUrl, setFaviconUrl] = useState<string>(FAVICON_DEFAULT);
  const [modalFaviconAbierto, setModalFaviconAbierto] = useState(false);
  const [faviconInput, setFaviconInput] = useState('');
  const [guardandoFavicon, setGuardandoFavicon] = useState(false);

  // Mantenimiento de almacenamiento: Depuración de Comprobantes Cloudinary
  const [ejecutandoLimpieza, setEjecutandoLimpieza] = useState(false);
  const [resumenLimpieza, setResumenLimpieza] = useState<ResumenLimpiezaComprobantes | null>(null);

  // Modal rápido para editar credenciales de Admin
  const [modalAdminRapido, setModalAdminRapido] = useState<{
    abierto: boolean;
    colegio: ColegioDetallado | null;
  }>({
    abierto: false,
    colegio: null,
  });

  // Modal de confirmación para eliminar
  const [confirmacion, setConfirmacion] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: React.ReactNode;
    onConfirmar: () => Promise<void> | void;
  }>({
    abierto: false,
    titulo: '',
    mensaje: '',
    onConfirmar: () => {},
  });
  const [ejecutandoConfirmacion, setEjecutandoConfirmacion] = useState(false);

  // Modal para Ver Estudiantes (Hijos) del Colegio
  const [modalEstudiantes, setModalEstudiantes] = useState<{
    abierto: boolean;
    colegio: ColegioDetallado | null;
    estudiantes: EstudianteColegioInfo[];
    cargando: boolean;
    busquedaEstudiante: string;
  }>({
    abierto: false,
    colegio: null,
    estudiantes: [],
    cargando: false,
    busquedaEstudiante: '',
  });

  const abrirModalEstudiantes = async (col: ColegioDetallado) => {
    setModalEstudiantes({
      abierto: true,
      colegio: col,
      estudiantes: [],
      cargando: true,
      busquedaEstudiante: '',
    });

    try {
      const data = await dataService.obtenerEstudiantesPorColegio(col.id, col.nombre);
      setModalEstudiantes((prev) => ({
        ...prev,
        estudiantes: data,
        cargando: false,
      }));
    } catch (err) {
      console.error('Error cargando estudiantes del colegio:', err);
      setModalEstudiantes((prev) => ({ ...prev, cargando: false }));
    }
  };

  const exportarEstudiantesCSV = () => {
    if (!modalEstudiantes.colegio || modalEstudiantes.estudiantes.length === 0) return;
    const ests = modalEstudiantes.estudiantes;
    const headers = [
      'Estudiante',
      'Grado y Seccion',
      'Colegio',
      'Alergias / Notas',
      'Padre / Apoderado',
      'Telefono',
      'DNI Padre',
      'Fecha Registro',
    ];
    const rows = ests.map((e) => [
      `"${e.nombreCompleto.replace(/"/g, '""')}"`,
      `"${e.gradoSeccion.replace(/"/g, '""')}"`,
      `"${e.colegioNombre.replace(/"/g, '""')}"`,
      `"${(e.alergiasNotas || 'Ninguna').replace(/"/g, '""')}"`,
      `"${(e.padreNombre || '').replace(/"/g, '""')}"`,
      `"${e.padreTelefono || ''}"`,
      `"${e.padreDni || ''}"`,
      `"${e.createdAt ? e.createdAt.slice(0, 10) : ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estudiantes_${modalEstudiantes.colegio.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cargarColegios = async () => {
    setCargandoDatos(true);
    try {
      const data = await dataService.obtenerColegiosDetallados();
      setColegios(data);
    } catch (e) {
      console.error('Error cargando colegios detallados:', e);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    if (esSuperAdmin) {
      let cancelado = false;
      dataService.obtenerColegiosDetallados().then((data) => {
        if (!cancelado) {
          setColegios(data);
          setCargandoDatos(false);
        }
      });
      dataService.obtenerConfiguracionPagos().then((pagos) => {
        if (!cancelado && pagos) {
          setConfigPagos(pagos);
        }
      });
      dataService.obtenerHoraLimite().then((hl) => {
        if (!cancelado && hl) {
          setHoraLimite(hl);
        }
      });
      dataService.obtenerFaviconUrl().then((fav) => {
        if (!cancelado && fav) {
          setFaviconUrl(fav);
        }
      });
      const desuscribir = dataService.suscribirCambios(() => {
        cargarColegios();
        dataService.obtenerConfiguracionPagos().then((pagos) => {
          if (!cancelado && pagos) {
            setConfigPagos(pagos);
          }
        });
        dataService.obtenerHoraLimite().then((hl) => {
          if (!cancelado && hl) {
            setHoraLimite(hl);
          }
        });
        dataService.obtenerFaviconUrl().then((fav) => {
          if (!cancelado && fav) {
            setFaviconUrl(fav);
          }
        });
      });
      return () => {
        cancelado = true;
        desuscribir();
      };
    }
  }, [esSuperAdmin]);

  const abrirEditarHoraLimite = () => {
    setNuevaHoraLimite(horaLimite || '09:30');
    setModalHoraLimiteAbierto(true);
  };

  const abrirEditarFavicon = () => {
    setFaviconInput(faviconUrl || FAVICON_DEFAULT);
    setModalFaviconAbierto(true);
  };

  const handleGuardarFavicon = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoFavicon(true);
    try {
      const res = await dataService.guardarFaviconUrl(faviconInput.trim());
      if (!res.ok) {
        alert(res.error || 'Error al guardar el favicon.');
      } else {
        setFaviconUrl(faviconInput.trim() || FAVICON_DEFAULT);
        setModalFaviconAbierto(false);
      }
    } catch (_) {
      alert('Error inesperado al guardar favicon.');
    } finally {
      setGuardandoFavicon(false);
    }
  };

  const handleGuardarHoraLimite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaHoraLimite.trim() || !nuevaHoraLimite.includes(':')) {
      alert('Por favor selecciona una hora válida (HH:MM).');
      return;
    }
    setGuardandoHoraLimite(true);
    try {
      const res = await dataService.guardarHoraLimite(nuevaHoraLimite);
      if (!res.ok) {
        alert(res.error || 'Error al guardar hora límite.');
      } else {
        setHoraLimite(nuevaHoraLimite);
        setModalHoraLimiteAbierto(false);
      }
    } finally {
      setGuardandoHoraLimite(false);
    }
  };

  const abrirEditarPagos = () => {
    setNumeroYape(configPagos.numeroYape);
    setTitularYape(configPagos.titularYape);
    setNumeroPlin(configPagos.numeroPlin);
    setTitularPlin(configPagos.titularPlin);
    setModalPagosAbierto(true);
  };

  const handleGuardarPagos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroYape.trim() && !numeroPlin.trim()) {
      alert('Por favor ingresa al menos un número para Yape o Plin.');
      return;
    }

    setGuardandoPagos(true);
    try {
      const nuevaConfig: ConfiguracionPagos = {
        numeroYape: numeroYape.trim() || CONFIG_PAGOS_DEFAULT.numeroYape,
        titularYape: titularYape.trim() || CONFIG_PAGOS_DEFAULT.titularYape,
        numeroPlin: numeroPlin.trim() || CONFIG_PAGOS_DEFAULT.numeroPlin,
        titularPlin: titularPlin.trim() || CONFIG_PAGOS_DEFAULT.titularPlin,
      };

      const res = await dataService.guardarConfiguracionPagos(nuevaConfig);
      if (!res.ok) {
        alert(res.error || 'Error al guardar la configuración de pagos.');
        return;
      }

      setConfigPagos(nuevaConfig);
      setModalPagosAbierto(false);
      setMensajeExito('¡Números de Yape y Plin actualizados correctamente para todos los colegios!');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (_) {
      alert('Error inesperado al guardar la configuración de pagos.');
    } finally {
      setGuardandoPagos(false);
    }
  };

  const handleLimpiarComprobantesManualmente = async () => {
    if (ejecutandoLimpieza) return;
    setEjecutandoLimpieza(true);
    try {
      const res = await dataService.limpiarComprobantesAntiguos(2);
      setResumenLimpieza(res);
      setMensajeExito(
        `Limpieza completada: ${res.comprobantesPurgadosCloudinary} comprobantes purgados en Cloudinary (${res.pedidosEvaluados} pedidos evaluados).`
      );
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: unknown) {
      console.error('Error durante la depuración manual de comprobantes:', err);
      alert('Error ejecutando la depuración de comprobantes.');
    } finally {
      setEjecutandoLimpieza(false);
    }
  };

  const abrirCrearColegio = () => {
    setColegioEnEdicion(null);
    setNombreColegio('');
    setSiglaColegio('');
    setSedeColegio('');
    setActivoColegio(true);
    setAdminNombre('');
    setAdminDni('');
    setAdminEmail('');
    setAdminTelefono('');
    setAdminPassword('');
    setVerPassword(false);
    setModalColegioAbierto(true);
  };

  const abrirEditarColegio = (col: ColegioDetallado) => {
    setColegioEnEdicion(col);
    setNombreColegio(col.nombre);
    setSiglaColegio(col.sigla || '');
    setSedeColegio(col.sede || '');
    setActivoColegio(col.activo);

    if (col.admin) {
      setAdminNombre(col.admin.nombreCompleto);
      setAdminDni(col.admin.dni);
      setAdminEmail(col.admin.email);
      setAdminTelefono(col.admin.telefono);
      setAdminPassword(col.admin.password || '');
    } else {
      setAdminNombre('');
      setAdminDni('');
      setAdminEmail('');
      setAdminTelefono('');
      setAdminPassword('');
    }
    setVerPassword(false);
    setModalColegioAbierto(true);
  };

  const abrirEditarAdminRapido = (col: ColegioDetallado) => {
    setModalAdminRapido({ abierto: true, colegio: col });
    if (col.admin) {
      setAdminNombre(col.admin.nombreCompleto);
      setAdminDni(col.admin.dni);
      setAdminEmail(col.admin.email);
      setAdminTelefono(col.admin.telefono);
      setAdminPassword(col.admin.password || '');
    } else {
      setAdminNombre('');
      setAdminDni('');
      setAdminEmail('');
      setAdminTelefono('');
      setAdminPassword('');
    }
    setVerPassword(false);
  };

  const handleGuardarColegio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreColegio.trim()) {
      alert('Por favor ingresa el nombre del colegio.');
      return;
    }
    if (!adminNombre.trim() || !adminDni.trim()) {
      alert('Por favor completa el nombre y usuario/DNI del administrador.');
      return;
    }

    setGuardando(true);
    try {
      const datosAdmin: AdminColegioInfo = {
        nombreCompleto: adminNombre.trim(),
        dni: adminDni.trim(),
        email: adminEmail.trim() || `${adminDni.trim().toLowerCase()}@almuerzos.com`,
        telefono: adminTelefono.trim(),
        password: adminPassword.trim() || undefined,
      };

      if (colegioEnEdicion) {
        // Actualizar colegio existente
        const res = await dataService.actualizarColegioConAdmin(
          colegioEnEdicion.id,
          {
            nombre: nombreColegio.trim(),
            sigla: siglaColegio.trim().toUpperCase() || undefined,
            sede: sedeColegio.trim(),
            activo: activoColegio,
          },
          datosAdmin
        );
        if (!res.ok) {
          alert(res.error || 'Error al actualizar el colegio');
          return;
        }
        setMensajeExito(`¡Colegio "${nombreColegio}" y administrador actualizados exitosamente!`);
      } else {
        // Crear nuevo colegio con administrador
        const res = await dataService.crearColegioConAdmin(
          {
            nombre: nombreColegio.trim(),
            sigla: siglaColegio.trim().toUpperCase() || undefined,
            sede: sedeColegio.trim(),
            activo: activoColegio,
          },
          datosAdmin
        );
        if (!res.ok) {
          alert(res.error || 'Error al registrar el colegio');
          return;
        }
        setMensajeExito(`¡Colegio "${nombreColegio}" creado y vinculado con su administrador!`);
      }

      setModalColegioAbierto(false);
      await cargarColegios();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      console.error('Error guardando colegio:', err);
      alert('Ocurrió un error al procesar el colegio.');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarAdminRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAdminRapido.colegio) return;

    setGuardando(true);
    try {
      const col = modalAdminRapido.colegio;
      const datosAdmin: AdminColegioInfo = {
        nombreCompleto: adminNombre.trim(),
        dni: adminDni.trim(),
        email: adminEmail.trim(),
        telefono: adminTelefono.trim(),
        password: adminPassword.trim() || undefined,
      };

      await dataService.actualizarColegioConAdmin(
        col.id,
        {
          nombre: col.nombre,
          sede: col.sede,
          activo: col.activo,
        },
        datosAdmin
      );

      setMensajeExito(`¡Credenciales del administrador de "${col.nombre}" actualizadas!`);
      setModalAdminRapido({ abierto: false, colegio: null });
      await cargarColegios();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || 'Error actualizando administrador');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (col: ColegioDetallado) => {
    try {
      await dataService.cambiarEstadoColegio(col.id, !col.activo);
      setColegios((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, activo: !c.activo } : c))
      );
    } catch (e) {
      console.error('Error cambiando estado del colegio:', e);
    }
  };

  const handleSolicitarEliminar = (col: ColegioDetallado) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Eliminar "${col.nombre}"?`,
      mensaje: (
        <div className="space-y-2">
          <p>
            Estás a punto de eliminar permanentemente el colegio{' '}
            <strong className="text-slate-900">{col.nombre}</strong> del sistema.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Consecuencias de esta acción:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
              <li>Los padres de familia ya no podrán seleccionar este colegio al hacer pedidos.</li>
              <li>El administrador asignado ({col.admin?.dni || 'Sin admin'}) perderá el acceso a este colegio.</li>
              <li>Los pedidos históricos mantendrán el registro para trazabilidad.</li>
            </ul>
          </div>
        </div>
      ),
      onConfirmar: async () => {
        await dataService.eliminarColegioCompleto(col.id, col.nombre);
        setColegios((prev) => prev.filter((c) => c.id !== col.id));
        setMensajeExito(`Colegio "${col.nombre}" eliminado correctamente.`);
        setTimeout(() => setMensajeExito(null), 4000);
      },
    });
  };

  const ejecutarAccionConfirmada = async () => {
    setEjecutandoConfirmacion(true);
    try {
      await confirmacion.onConfirmar();
      setConfirmacion((prev) => ({ ...prev, abierto: false }));
    } catch (err) {
      console.error('Error ejecutando confirmación:', err);
    } finally {
      setEjecutandoConfirmacion(false);
    }
  };

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esSuperAdmin) {
    return (
      <AccesoRestringido mensaje="Esta pantalla es de acceso exclusivo para la cuenta de Super Administrador de Placeres Culinarios." />
    );
  }

  // Filtrado de colegios
  const colegiosFiltrados = colegios.filter((c) => {
    const matchBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.sede && c.sede.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.admin && c.admin.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.admin && c.admin.dni.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.admin && c.admin.email.toLowerCase().includes(busqueda.toLowerCase()));

    const matchEstado =
      filtroEstado === 'TODOS' ||
      (filtroEstado === 'ACTIVOS' && c.activo) ||
      (filtroEstado === 'INACTIVOS' && !c.activo);

    return matchBusqueda && matchEstado;
  });

  // Métricas
  const totalColegios = colegios.length;
  const colegiosActivos = colegios.filter((c) => c.activo).length;
  const adminsAsignados = colegios.filter((c) => c.admin).length;
  const totalPedidosSistema = colegios.reduce((acc, c) => acc + (c.totalPedidos || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Notificación de éxito flotante */}
      {mensajeExito && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* CABECERA PRINCIPAL DE SUPER ADMIN */}
      <PageHeader
        title="Gestión de Colegios & Cuentas"
        subtitle="Control central de instituciones educativas, administradores de sede y configuración global."
        isSuperAdmin={true}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <Link href="/admin">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Panel Operativo</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800">
              <Link href="/admin/despacho">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Despacho</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* TARJETAS DE KPIS DEL SUPER ADMIN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 border-blue-200/80 hover:border-blue-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
            Total de Colegios
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-950">{totalColegios}</div>
          <p className="text-[11px] text-blue-700/80 font-medium mt-1">Colegios registrados en el sistema</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border-emerald-200/80 hover:border-emerald-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Colegios Activos
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950">{colegiosActivos}</div>
          <p className="text-[11px] text-emerald-700/80 font-medium mt-1">Disponibles para pedidos de padres</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/30 border-purple-200/80 hover:border-purple-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block mb-1">
            Admins Asignados
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-950">{adminsAsignados}</div>
          <p className="text-[11px] text-purple-700/80 font-medium mt-1">Cuentas con acceso a su colegio</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/30 border-amber-200/80 hover:border-amber-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
            Almuerzos Atendidos
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-950">{totalPedidosSistema}</div>
          <p className="text-[11px] text-amber-800/80 font-medium mt-1">Raciones globales solicitadas</p>
        </Card>
      </div>

      {/* CONFIGURACIÓN CENTRAL DE MÉTODOS DE PAGO (YAPE & PLIN) */}
      <Card className="border-zinc-200/90 shadow-2xs mb-6 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold border border-zinc-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-zinc-950">
                  Métodos de Pago Globales (Yape & Plin)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Para Todos los Colegios
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Estos números y nombres de titular se mostrarán en la pantalla de pedidos de los padres en todos los colegios.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={abrirEditarPagos}
            className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold h-8 gap-1.5 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Números de Pago</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tarjeta Yape */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Cuenta Yape
                </span>
                <div className="text-base sm:text-lg font-bold text-zinc-950 mt-0.5 font-mono">
                  {configPagos.numeroYape}
                </div>
                <p className="text-xs text-zinc-600 font-medium">
                  Titular: {configPagos.titularYape}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                Yape
              </div>
            </div>

            {/* Tarjeta Plin */}
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Cuenta Plin
                </span>
                <div className="text-base sm:text-lg font-bold text-zinc-950 mt-0.5 font-mono">
                  {configPagos.numeroPlin}
                </div>
                <p className="text-xs text-zinc-600 font-medium">
                  Titular: {configPagos.titularPlin}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                Plin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONFIGURACIÓN GLOBAL: HORA LÍMITE DE PEDIDOS DEL DÍA */}
      <Card className="border-zinc-200/90 shadow-2xs mb-6 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold border border-zinc-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-zinc-950">
                  Hora Límite para Pedidos del Día
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Todos los Colegios
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Horario de corte para pedir almuerzos escolares del mismo día. Después de esta hora los padres igual podrán pedir, pero recibirán una advertencia informativa.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={abrirEditarHoraLimite}
            className="text-xs font-semibold h-8 gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Configurar Hora Límite</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Horario Oficial Configurado
                </span>
                <div className="text-base sm:text-lg font-bold text-zinc-950 font-mono">
                  {formatearHoraLimiteLegible(horaLimite)}
                </div>
              </div>
            </div>
            <span className="text-xs text-zinc-600 bg-white px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto font-medium">
              Visible en carta: &quot;Pedidos hasta las {formatearHoraLimiteLegible(horaLimite)}&quot;
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CONFIGURACIÓN GLOBAL: IDENTIDAD VISUAL Y FAVICON */}
      <Card className="border-zinc-200/90 shadow-2xs mb-6 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold border border-zinc-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-zinc-950">
                  Favicon e Identidad Visual del Sistema
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Global
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Icono que se muestra en la pestaña del navegador de los apoderados, administradores y personal de cocina.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={abrirEditarFavicon}
            className="text-xs font-semibold h-8 gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Favicon</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconUrl || FAVICON_DEFAULT}
                  alt="Favicon Actual"
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FAVICON_DEFAULT;
                  }}
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Vista Previa en Pestaña
                </span>
                <div className="text-xs sm:text-sm font-semibold text-zinc-900 truncate max-w-md">
                  {faviconUrl || FAVICON_DEFAULT}
                </div>
              </div>
            </div>
            <span className="text-xs text-zinc-600 bg-white px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto font-medium">
              Actualizado dinámicamente en tiempo real
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CONFIGURACIÓN Y MANTENIMIENTO: DEPURACIÓN DE COMPROBANTES CLOUDINARY */}
      <Card className="border-zinc-200/90 shadow-2xs mb-6 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold border border-zinc-200">
              <FileImage className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-zinc-950">
                  Almacenamiento Cloudinary: Depuración de Comprobantes
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Automático &gt; 2 días
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Purga las fotos de comprobantes de pago (Yape/Plin) con más de 48 horas de antigüedad para mantener Cloudinary libre de saturación y proteger la privacidad de los padres. Las ventas, pedidos e historial quedan 100% preservados.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleLimpiarComprobantesManualmente}
            disabled={ejecutandoLimpieza}
            className="text-xs font-semibold h-8 gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ejecutandoLimpieza ? 'animate-spin' : ''}`} />
            <span>{ejecutandoLimpieza ? 'Depurando Cloudinary...' : 'Ejecutar Limpieza Ahora (> 2 días)'}</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Estado de la Automatización
                </span>
                <div className="text-xs sm:text-sm font-semibold text-zinc-900">
                  Programado automáticamente todas las madrugadas (03:00 AM Perú) vía Vercel Cron
                </div>
              </div>
            </div>
            {resumenLimpieza ? (
              <span className="text-xs text-zinc-600 bg-white px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto font-medium">
                Última ejecución: {resumenLimpieza.comprobantesPurgadosCloudinary} liberados de {resumenLimpieza.pedidosEvaluados} pedidos evaluados
              </span>
            ) : (
              <span className="text-xs text-zinc-600 bg-white px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto font-medium">
                Retención fijada en 48 horas (2 días)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BARRA DE ACCIÓN Y BÚSQUEDA */}
      <Card className="p-3.5 sm:p-4 border-zinc-200/90 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar colegio, admin o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white border-zinc-200 rounded-lg pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filtros de estado */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 text-xs font-semibold">
              {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    filtroEstado === est
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {est === 'TODOS' ? 'Todos' : est === 'ACTIVOS' ? 'Activos' : 'Pausados'}
                </button>
              ))}
            </div>

            {/* Botón Refrescar */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={cargarColegios}
              disabled={cargandoDatos}
              className="h-9 w-9 cursor-pointer"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-4 h-4 ${cargandoDatos ? 'animate-spin' : ''}`} />
            </Button>

            {/* Botón Configurar Yape / Plin */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={abrirEditarPagos}
              className="text-xs font-semibold h-9 gap-1.5 cursor-pointer"
              title="Configurar números de Yape y Plin para todos los colegios"
            >
              <Smartphone className="w-3.5 h-3.5 text-zinc-600" />
              <span>Editar Yape / Plin</span>
            </Button>

            {/* BOTÓN PRINCIPAL: NUEVO COLEGIO & ADMINISTRADOR */}
            <Button
              type="button"
              size="sm"
              onClick={abrirCrearColegio}
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Colegio & Admin</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* LISTADO DE COLEGIOS Y ADMINISTRADORES */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">
            Colegios Registrados ({colegiosFiltrados.length} de {colegios.length})
          </h2>
          <span className="text-xs text-slate-500">
            Cada colegio tiene su cuenta de administrador asociada
          </span>
        </div>

        {cargandoDatos ? (
          <Card className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-zinc-500">Cargando colegios y administradores...</p>
          </Card>
        ) : colegiosFiltrados.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <div className="w-10 h-10 bg-zinc-100 text-zinc-700 rounded-lg flex items-center justify-center mx-auto border border-zinc-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950">No se encontraron colegios</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {busqueda
                ? 'Ningún colegio o administrador coincide con tu término de búsqueda.'
                : 'Aún no has registrado ningún colegio. Haz clic en "Nuevo Colegio & Admin" para empezar.'}
            </p>
            {busqueda ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setBusqueda('')}
                className="text-xs font-semibold text-zinc-900"
              >
                Limpiar búsqueda
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={abrirCrearColegio}
                className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Registrar Primer Colegio
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {colegiosFiltrados.map((col) => (
              <Card
                key={col.id}
                className={`p-4 sm:p-5 transition hover:border-zinc-300 shadow-2xs ${
                  col.activo ? '' : 'bg-zinc-50/50 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Columna 1: Información del Colegio */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                        col.activo
                          ? 'bg-zinc-950 text-white border-zinc-900'
                          : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => abrirModalEstudiantes(col)}
                          className="text-base font-bold text-zinc-950 tracking-tight hover:underline text-left cursor-pointer transition"
                          title="Clic para ver los hijos/estudiantes vinculados a este colegio"
                        >
                          {col.nombre}
                        </button>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] font-bold"
                          title="Sigla escolar para códigos de pedidos (ej. #CLA-001)"
                        >
                          #{col.sigla || obtenerIdentificadorColegio(col.nombre)}
                        </Badge>
                        {col.activo ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-zinc-500 font-medium">
                            Pausado
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => abrirModalEstudiantes(col)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 px-2.5 py-0.5 rounded-md transition cursor-pointer"
                          title="Ver lista de estudiantes asociados a este colegio"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{col.totalEstudiantes || 0} estudiantes</span>
                        </button>
                        <span className="text-xs text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                          {col.totalPedidos || 0} pedidos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columna 2: Administrador Asignado a este Colegio */}
                  <div className="bg-zinc-50/80 rounded-lg p-3 border border-zinc-200/80 min-w-[280px]">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200/60 text-[11px]">
                      <span className="font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" /> Admin Asignado
                      </span>
                      {col.admin ? (
                        <button
                          type="button"
                          onClick={() => abrirEditarAdminRapido(col)}
                          className="text-[11px] font-semibold text-zinc-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Key className="w-3 h-3 text-zinc-500" /> Clave
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirEditarColegio(col)}
                          className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                        >
                          + Asignar Admin
                        </button>
                      )}
                    </div>

                    {col.admin ? (
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{col.admin.nombreCompleto}</span>
                        </div>
                        <div className="text-zinc-600 text-[11px] flex items-center justify-between gap-2">
                          <span className="font-medium">
                            Usuario: <code className="bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-900 font-mono font-semibold">{col.admin.dni}</code>
                          </span>
                          {col.admin.telefono && (
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-400" /> {col.admin.telefono}
                            </span>
                          )}
                        </div>
                        {col.admin.email && (
                          <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-400" /> {col.admin.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-1 text-center">
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-block">
                          ⚠️ Sin administrador asignado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Acciones */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {/* Botón Ver Estudiantes del Colegio */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalEstudiantes(col)}
                      className="text-xs font-semibold h-8 gap-1.5 cursor-pointer"
                      title="Ver lista de estudiantes (hijos) registrados en este colegio"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="hidden sm:inline">Alumnos ({col.totalEstudiantes || 0})</span>
                    </Button>

                    {/* Botón Alternar Estado Activo / Pausado */}
                    <Button
                      type="button"
                      variant={col.activo ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleEstado(col)}
                      className="text-xs font-semibold h-8 gap-1 cursor-pointer"
                      title={col.activo ? 'Pausar colegio (no aparecerá en compras de padres)' : 'Activar colegio'}
                    >
                      {col.activo ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-zinc-700" />
                          <span className="hidden sm:inline">Pausar</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="hidden sm:inline">Activar</span>
                        </>
                      )}
                    </Button>

                    {/* Botón Editar Colegio y Admin */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => abrirEditarColegio(col)}
                      className="text-xs font-semibold h-8 gap-1 cursor-pointer"
                      title="Editar colegio y credenciales de administrador"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>

                    {/* Botón Eliminar Colegio */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSolicitarEliminar(col)}
                      className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Eliminar colegio del sistema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CREAR / EDITAR COLEGIO CON ADMINISTRADOR */}
      {modalColegioAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl border border-zinc-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {colegioEnEdicion ? 'Editar Colegio & Administrador' : 'Nuevo Colegio & Administrador'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Configura el colegio y su cuenta de acceso
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalColegioAbierto(false)}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarColegio} className="space-y-4">
              {/* SECCIÓN 1: DATOS DEL COLEGIO */}
              <div className="p-4 bg-zinc-50/70 rounded-lg border border-zinc-200/80 space-y-3">
                <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider block">
                  1. Institución Educativa
                </span>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nombre del Colegio *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. COLEGIO ZÁRATE"
                    value={nombreColegio}
                    onChange={(e) => setNombreColegio(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Sigla del Colegio (Identificador)
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">
                      Ej. CLA, SRO, AGU (2 a 5 letras)
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. CLA"
                    maxLength={5}
                    value={siglaColegio}
                    onChange={(e) => setSiglaColegio(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 font-mono uppercase font-bold tracking-wider focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Se usará en los códigos de pedidos y almuerzos de este colegio (ej. #{siglaColegio || 'COL'}-001).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={activoColegio ? 'true' : 'false'}
                    onChange={(e) => setActivoColegio(e.target.value === 'true')}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                  >
                    <option value="true">Activo (Visible para padres al ordenar)</option>
                    <option value="false">Pausado (Oculto temporalmente)</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN 2: CUENTA DEL ADMINISTRADOR DE ESTE COLEGIO */}
              <div className="p-4 bg-zinc-50/70 rounded-lg border border-zinc-200/80 space-y-3">
                <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider block">
                  2. Cuenta del Administrador para este Colegio
                </span>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nombre Completo del Administrador *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Admin San Agustín"
                    value={adminNombre}
                    onChange={(e) => setAdminNombre(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Usuario / DNI para Login *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. ADM-SANAGUSTIN o DNI"
                      value={adminDni}
                      onChange={(e) => setAdminDni(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 987654321"
                      value={adminTelefono}
                      onChange={(e) => setAdminTelefono(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. sanagustin@almuerzos.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <input
                      type={verPassword ? 'text' : 'password'}
                      placeholder={colegioEnEdicion ? 'Nueva contraseña o dejar actual' : 'Contraseña de acceso'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md pl-3 pr-10 py-2 text-xs sm:text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden font-mono"
                      required={!colegioEnEdicion}
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword(!verPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                    >
                      {verPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {colegioEnEdicion
                      ? 'Deja la contraseña en blanco si no deseas cambiarla.'
                      : 'El administrador usará su Usuario/DNI y esta clave para ingresar.'}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalColegioAbierto(false)}
                  className="text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardando}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg shadow-xs"
                >
                  {guardando
                    ? 'Guardando...'
                    : colegioEnEdicion
                    ? 'Actualizar Colegio & Admin'
                    : 'Guardar Colegio & Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO: EDITAR CONTRASEÑA / ADMIN */}
      {modalAdminRapido.abierto && modalAdminRapido.colegio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    Credenciales del Administrador
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Colegio: {modalAdminRapido.colegio.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAdminRapido({ abierto: false, colegio: null })}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarAdminRapido} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nombre del Administrador *
                </label>
                <input
                  type="text"
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Usuario / DNI de Login *
                </label>
                <input
                  type="text"
                  value={adminDni}
                  onChange={(e) => setAdminDni(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    placeholder="Escribe la nueva contraseña"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-3 pr-10 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                  >
                    {verPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Dejar en blanco para conservar la clave actual.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAdminRapido({ abierto: false, colegio: null })}
                  className="text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardando}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg shadow-xs"
                >
                  {guardando ? 'Guardando...' : 'Guardar Credenciales'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER ESTUDIANTES ASOCIADOS AL COLEGIO */}
      {modalEstudiantes.abierto && modalEstudiantes.colegio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-xl overflow-hidden my-6 border border-zinc-200 flex flex-col max-h-[90vh]">
            {/* Cabecera del Modal */}
            <div className="p-5 sm:p-6 bg-zinc-950 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-700">
                      Estudiantes Vinculados
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {modalEstudiantes.estudiantes.length} alumno(s)
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                    {modalEstudiantes.colegio.nombre}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEstudiantes((prev) => ({ ...prev, abierto: false }))}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de herramientas: Búsqueda y Botones de Acción */}
            <div className="p-3.5 sm:p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante, grado, apoderado, teléfono..."
                  value={modalEstudiantes.busquedaEstudiante}
                  onChange={(e) =>
                    setModalEstudiantes((prev) => ({ ...prev, busquedaEstudiante: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-1.5 bg-white rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (modalEstudiantes.colegio) {
                      abrirModalEstudiantes(modalEstudiantes.colegio);
                    }
                  }}
                  className="h-8 w-8 text-zinc-600 cursor-pointer"
                  title="Refrescar listado"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportarEstudiantesCSV}
                  disabled={modalEstudiantes.estudiantes.length === 0}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  title="Descargar lista de estudiantes en formato Excel/CSV"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Exportar Excel</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  title="Imprimir nómina de alumnos"
                >
                  <Printer className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden sm:inline">Imprimir</span>
                </Button>
              </div>
            </div>

            {/* Contenido / Listado con scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {modalEstudiantes.cargando ? (
                <div className="py-16 text-center">
                  <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-zinc-500">
                    Consultando lista de hijos asociados a este colegio...
                  </p>
                </div>
              ) : (() => {
                const q = modalEstudiantes.busquedaEstudiante.toLowerCase().trim();
                const filtrados = modalEstudiantes.estudiantes.filter(
                  (e) =>
                    e.nombreCompleto.toLowerCase().includes(q) ||
                    e.gradoSeccion.toLowerCase().includes(q) ||
                    (e.padreNombre && e.padreNombre.toLowerCase().includes(q)) ||
                    (e.padreTelefono && e.padreTelefono.includes(q)) ||
                    (e.padreDni && e.padreDni.includes(q)) ||
                    (e.alergiasNotas && e.alergiasNotas.toLowerCase().includes(q))
                );

                if (modalEstudiantes.estudiantes.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-10 h-10 bg-zinc-100 text-zinc-700 rounded-lg flex items-center justify-center mx-auto border border-zinc-200">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-950">
                        No hay estudiantes registrados para este colegio aún
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Cuando los padres de familia registren a sus hijos seleccionando{' '}
                        <strong>{modalEstudiantes.colegio.nombre}</strong>, aparecerán listados aquí con sus datos de contacto y grado.
                      </p>
                    </div>
                  );
                }

                if (filtrados.length === 0) {
                  return (
                    <div className="py-10 text-center text-xs text-zinc-500">
                      No se encontraron estudiantes que coincidan con &quot;{modalEstudiantes.busquedaEstudiante}&quot;.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-lg border border-zinc-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider bg-zinc-50">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Estudiante</th>
                            <th className="py-2.5 px-3">Grado y Sección</th>
                            <th className="py-2.5 px-3">Padre / Apoderado</th>
                            <th className="py-2.5 px-3">Contacto WhatsApp</th>
                            <th className="py-2.5 px-3">Alergias / Notas</th>
                            <th className="py-2.5 px-3 text-right">Registro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {filtrados.map((est, idx) => {
                            const telLimpio = est.padreTelefono ? est.padreTelefono.replace(/\D/g, '') : '';
                            const waLink = telLimpio ? `https://wa.me/51${telLimpio}` : null;

                            return (
                              <tr key={est.id} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="py-3 px-3 font-mono text-zinc-400 text-[11px] font-bold">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-zinc-950 text-xs">
                                    {est.nombreCompleto}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-[11px]">
                                    {est.gradoSeccion}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-medium text-zinc-900">
                                    {est.padreNombre || 'No especificado'}
                                  </div>
                                  {est.padreDni && (
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      DNI: {est.padreDni}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      <span>{est.padreTelefono}</span>
                                    </a>
                                  ) : (
                                    <span className="text-zinc-400">{est.padreTelefono || '-'}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  {est.alergiasNotas ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>{est.alergiasNotas}</span>
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 text-[11px]">Ninguna</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-zinc-400 text-[11px]">
                                  {est.createdAt ? est.createdAt.slice(0, 10) : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Pie del Modal */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 shrink-0">
              <span>
                Mostrando estudiantes matriculados en <strong>{modalEstudiantes.colegio.nombre}</strong>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalEstudiantes((prev) => ({ ...prev, abierto: false }))}
                className="text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR YAPE Y PLIN */}
      {modalPagosAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl p-5 sm:p-6 shadow-xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    Configurar Números de Yape y Plin
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Configuración centralizada para el método de pago de todos los colegios
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPagosAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarPagos} className="space-y-4">
              {/* Sección Yape */}
              <div className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200 space-y-2.5">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  Datos de Cuenta Yape
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Número de Yape *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 999-999-999"
                      value={numeroYape}
                      onChange={(e) => setNumeroYape(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs font-mono font-semibold text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Titular / Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Placeres Culinarios"
                      value={titularYape}
                      onChange={(e) => setTitularYape(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Plin */}
              <div className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200 space-y-2.5">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                  Datos de Cuenta Plin
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Número de Plin *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 999-999-999"
                      value={numeroPlin}
                      onChange={(e) => setNumeroPlin(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs font-mono font-semibold text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Titular / Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Placeres Culinarios"
                      value={titularPlin}
                      onChange={(e) => setTitularPlin(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa en tiempo real */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Vista Previa en el Checkout de Padres
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-900">
                    <p className="font-semibold text-[11px]">Número de Yape: {numeroYape || '999-999-999'}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{titularYape || 'Placeres Culinarios'}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-900">
                    <p className="font-semibold text-[11px]">Número de Plin: {numeroPlin || '999-999-999'}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{titularPlin || 'Placeres Culinarios'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={guardandoPagos}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 h-10"
                >
                  {guardandoPagos ? (
                    <span className="animate-pulse">Guardando configuración...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Números de Pago</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalPagosAbierto(false)}
                  className="text-xs sm:text-sm font-semibold h-10"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para configurar hora límite de pedidos del día */}
      {modalHoraLimiteAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Configurar Hora Límite</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalHoraLimiteAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarHoraLimite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Hora de Corte de Pedidos *
                </label>
                <input
                  type="time"
                  value={nuevaHoraLimite}
                  onChange={(e) => setNuevaHoraLimite(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-md px-3.5 py-2 text-base font-semibold font-mono text-zinc-900 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                  required
                />
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 space-y-1">
                  <p>
                    <strong>Vista previa en la carta:</strong> &quot;Pedidos hasta las {formatearHoraLimiteLegible(nuevaHoraLimite)}&quot;.
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Si un padre ingresa después de esta hora para el día de hoy, el sistema le advertirá que el horario regular ha culminado, pero le permitirá enviar el pedido.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={guardandoHoraLimite}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 h-10"
                >
                  {guardandoHoraLimite ? (
                    <span className="animate-pulse">Guardando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Hora Límite</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalHoraLimiteAbierto(false)}
                  className="text-xs sm:text-sm font-semibold h-10"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN FAVICON */}
      {modalFaviconAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  Editar Favicon del Sistema
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalFaviconAbierto(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarFavicon} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  URL del Favicon / Icono (PNG, ICO, SVG o Cloudinary) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://.../favicon.png o /favicon.ico"
                  value={faviconInput}
                  onChange={(e) => setFaviconInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md text-xs sm:text-sm font-medium focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Recomendado: Imagen cuadrada de 32x32 px o 64x64 px.
                </p>
              </div>

              {/* Presets rápidos */}
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Iconos Predefinidos Recomendados:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFaviconInput('/favicon.ico')}
                    className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200 text-left text-xs font-medium text-zinc-800 flex items-center gap-2 transition"
                  >
                    <span>🍽️</span>
                    <span>Por Defecto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFaviconInput(
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=64&h=64&fit=crop&crop=faces'
                      )
                    }
                    className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200 text-left text-xs font-medium text-zinc-800 flex items-center gap-2 transition"
                  >
                    <span>🥗</span>
                    <span>Almuerzo Saludable</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFaviconInput(
                        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=64&h=64&fit=crop&crop=faces'
                      )
                    }
                    className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200 text-left text-xs font-medium text-zinc-800 flex items-center gap-2 transition"
                  >
                    <span>🎒</span>
                    <span>Lonchera Escolar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFaviconInput(
                        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=64&h=64&fit=crop&crop=faces'
                      )
                    }
                    className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200 text-left text-xs font-medium text-zinc-800 flex items-center gap-2 transition"
                  >
                    <span>🍎</span>
                    <span>Manzana Escolar</span>
                  </button>
                </div>
              </div>

              {/* Vista previa en miniatura */}
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={faviconInput || FAVICON_DEFAULT}
                    alt="Preview"
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FAVICON_DEFAULT;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 block font-semibold">Simulación pestaña de navegador:</span>
                  <span className="text-xs font-semibold text-zinc-900 truncate block">
                    Placeres Culinarios | Gestión de Almuerzos
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalFaviconAbierto(false)}
                  className="text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoFavicon}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {guardandoFavicon ? 'Guardando...' : 'Guardar Favicon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        abierto={confirmacion.abierto}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        textoBotonConfirmar="Sí, Eliminar Colegio"
        textoBotonCancelar="Cancelar"
        tipo="peligro"
        cargando={ejecutandoConfirmacion}
        onConfirmar={ejecutarAccionConfirmada}
        onCerrar={() => setConfirmacion((prev) => ({ ...prev, abierto: false }))}
      />
    </div>
  );
}
