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
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { dataService, CONFIG_PAGOS_DEFAULT } from '@/lib/dataService';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import { ColegioDetallado, AdminColegioInfo, EstudianteColegioInfo, ConfiguracionPagos } from '@/types';

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
      const desuscribir = dataService.suscribirCambios(() => {
        cargarColegios();
        dataService.obtenerConfiguracionPagos().then((pagos) => {
          if (!cancelado && pagos) {
            setConfigPagos(pagos);
          }
        });
      });
      return () => {
        cancelado = true;
        desuscribir();
      };
    }
  }, [esSuperAdmin]);

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

  const abrirCrearColegio = () => {
    setColegioEnEdicion(null);
    setNombreColegio('');
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
    setSedeColegio(col.sede || '');
    setActivoColegio(col.activo);

    if (col.admin) {
      setAdminNombre(col.admin.nombreCompleto);
      setAdminDni(col.admin.dni);
      setAdminEmail(col.admin.email);
      setAdminTelefono(col.admin.telefono);
      setAdminPassword(col.admin.password || '');
    } else {
      setAdminNombre(`Admin ${col.nombre.replace(/^COLEGIO\s+/i, '')}`);
      setAdminDni(`ADM-${col.nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`);
      setAdminEmail(`${col.nombre.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10)}@almuerzos.com`);
      setAdminTelefono('999999999');
      setAdminPassword('colegio123');
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
      setAdminNombre(`Admin ${col.nombre.replace(/^COLEGIO\s+/i, '')}`);
      setAdminDni(`ADM-${col.nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`);
      setAdminEmail(`${col.nombre.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10)}@almuerzos.com`);
      setAdminTelefono('999999999');
      setAdminPassword('colegio123');
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
        telefono: adminTelefono.trim() || '999999999',
        password: adminPassword.trim() || 'colegio123',
      };

      if (colegioEnEdicion) {
        // Actualizar colegio existente
        const res = await dataService.actualizarColegioConAdmin(
          colegioEnEdicion.id,
          {
            nombre: nombreColegio.trim(),
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
            Estás a punto de eliminar permanentemente la sede escolar{' '}
            <strong className="text-slate-900">{col.nombre}</strong> del sistema.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Consecuencias de esta acción:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
              <li>Los padres de familia ya no podrán seleccionar este colegio al hacer pedidos.</li>
              <li>El administrador asignado ({col.admin?.dni || 'Sin admin'}) perderá el acceso a esta sede.</li>
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

      {/* BANNER PRINCIPAL DE SUPER ADMIN */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl mb-6 relative overflow-hidden border border-purple-500/20">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-xs font-black border border-purple-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> SUPER ADMINISTRADOR
              </span>
              <span className="text-xs text-slate-400 font-medium">Control Central Multi-Colegios</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <Building2 className="w-8 h-8 text-purple-400" />
              Gestión de Colegios & Administradores
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Crea sedes escolares con sus propios administradores independientes, administra
              sus credenciales de acceso y supervisa el volumen operativo de cada colegio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-white/10"
              title="Ir al panel de menús y KPIs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Panel Operativo</span>
            </Link>
            <Link
              href="/despacho"
              className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              title="Ir al panel de despacho y empaque"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Despacho</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TARJETAS DE KPIS DEL SUPER ADMIN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total de Colegios
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalColegios}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Colegios registrados en el sistema</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Colegios Activos
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{colegiosActivos}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Disponibles para pedidos de padres</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
            Admins Asignados
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">{adminsAsignados}</div>
          <p className="text-[11px] text-purple-600 mt-0.5">Cuentas con acceso a su colegio</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
            Almuerzos Atendidos
          </span>
          <div className="text-2xl sm:text-3xl font-black text-orange-700">{totalPedidosSistema}</div>
          <p className="text-[11px] text-orange-600 mt-0.5">Raciones globales solicitadas</p>
        </div>
      </div>

      {/* CONFIGURACIÓN CENTRAL DE MÉTODOS DE PAGO (YAPE & PLIN) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Métodos de Pago Globales (Yape & Plin)
                </h2>
                <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  Para Todos los Colegios
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Estos números y nombres de titular se mostrarán en la pantalla de pedidos de los padres en todas las sedes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirEditarPagos}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto cursor-pointer active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Números de Pago</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          {/* Tarjeta Yape */}
          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                Cuenta Yape
              </span>
              <div className="text-base sm:text-lg font-black text-purple-950 mt-0.5 font-mono">
                {configPagos.numeroYape}
              </div>
              <p className="text-xs font-medium text-purple-700">
                Titular: {configPagos.titularYape}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              Yape
            </div>
          </div>

          {/* Tarjeta Plin */}
          <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
                Cuenta Plin
              </span>
              <div className="text-base sm:text-lg font-black text-sky-950 mt-0.5 font-mono">
                {configPagos.numeroPlin}
              </div>
              <p className="text-xs font-medium text-sky-700">
                Titular: {configPagos.titularPlin}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
              Plin
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIÓN Y BÚSQUEDA */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colegio, sede, admin o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filtros de estado */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    filtroEstado === est
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {est === 'TODOS' ? 'Todos' : est === 'ACTIVOS' ? 'Activos' : 'Pausados'}
                </button>
              ))}
            </div>

            {/* Botón Refrescar */}
            <button
              type="button"
              onClick={cargarColegios}
              disabled={cargandoDatos}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-4 h-4 ${cargandoDatos ? 'animate-spin' : ''}`} />
            </button>

            {/* Botón Configurar Yape / Plin */}
            <button
              type="button"
              onClick={abrirEditarPagos}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs sm:text-sm font-bold rounded-2xl border border-purple-200 transition cursor-pointer active:scale-95"
              title="Configurar números de Yape y Plin para todos los colegios"
            >
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Editar Yape / Plin</span>
            </button>

            {/* BOTÓN PRINCIPAL: NUEVO COLEGIO & ADMINISTRADOR */}
            <button
              type="button"
              onClick={abrirCrearColegio}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-sm shadow-purple-600/30 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Colegio & Admin</span>
            </button>
          </div>
        </div>
      </div>

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
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Cargando colegios y administradores...</p>
          </div>
        ) : colegiosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No se encontraron colegios</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {busqueda
                ? 'Ninguna sede o administrador coincide con tu término de búsqueda.'
                : 'Aún no has registrado ningún colegio. Haz clic en "Nuevo Colegio & Admin" para empezar.'}
            </p>
            {busqueda ? (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            ) : (
              <button
                type="button"
                onClick={abrirCrearColegio}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Registrar Primer Colegio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {colegiosFiltrados.map((col) => (
              <div
                key={col.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                  col.activo
                    ? 'border-slate-200 hover:border-purple-200'
                    : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Columna 1: Información del Colegio */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        col.activo
                          ? 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirModalEstudiantes(col)}
                          className="text-base font-black text-slate-900 tracking-tight hover:text-purple-700 hover:underline text-left cursor-pointer transition"
                          title="Clic para ver los hijos/estudiantes vinculados a este colegio"
                        >
                          {col.nombre}
                        </button>
                        {col.activo ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-600">
                            Pausado
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => abrirModalEstudiantes(col)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-2.5 py-1 rounded-xl transition cursor-pointer"
                          title="Ver lista de estudiantes asociados a este colegio"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                          <span>{col.totalEstudiantes || 0} estudiantes</span>
                        </button>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-xl">
                          {col.totalPedidos || 0} pedidos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columna 2: Administrador Asignado a este Colegio */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 min-w-[280px]">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 text-[11px]">
                      <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Admin Asignado
                      </span>
                      {col.admin ? (
                        <button
                          type="button"
                          onClick={() => abrirEditarAdminRapido(col)}
                          className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Key className="w-3 h-3" /> Clave
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirEditarColegio(col)}
                          className="text-[11px] font-black text-orange-600 hover:underline cursor-pointer"
                        >
                          + Asignar Admin
                        </button>
                      )}
                    </div>

                    {col.admin ? (
                      <div className="space-y-1 text-xs">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{col.admin.nombreCompleto}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            Usuario: <code className="bg-white px-1.5 py-0.5 rounded text-purple-700 font-mono font-bold">{col.admin.dni}</code>
                          </span>
                          {col.admin.telefono && (
                            <span className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {col.admin.telefono}
                            </span>
                          )}
                        </div>
                        {col.admin.email && (
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {col.admin.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-1 text-center">
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-xl inline-block">
                          ⚠️ Sin administrador asignado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Acciones */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {/* Botón Ver Estudiantes del Colegio */}
                    <button
                      type="button"
                      onClick={() => abrirModalEstudiantes(col)}
                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      title="Ver lista de estudiantes (hijos) registrados en este colegio"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span className="hidden sm:inline">Alumnos ({col.totalEstudiantes || 0})</span>
                    </button>

                    {/* Botón Alternar Estado Activo / Pausado */}
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(col)}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        col.activo
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                      title={col.activo ? 'Pausar colegio (no aparecerá en compras de padres)' : 'Activar colegio'}
                    >
                      {col.activo ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span className="hidden sm:inline">Pausar</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span className="hidden sm:inline">Activar</span>
                        </>
                      )}
                    </button>

                    {/* Botón Editar Colegio y Admin */}
                    <button
                      type="button"
                      onClick={() => abrirEditarColegio(col)}
                      className="p-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="Editar colegio y credenciales de administrador"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    {/* Botón Eliminar Colegio */}
                    <button
                      type="button"
                      onClick={() => handleSolicitarEliminar(col)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Eliminar colegio del sistema"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CREAR / EDITAR COLEGIO CON ADMINISTRADOR */}
      {modalColegioAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {colegioEnEdicion ? 'Editar Colegio & Administrador' : 'Nuevo Colegio & Administrador'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura la sede escolar y su cuenta de acceso
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalColegioAbierto(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarColegio} className="space-y-4">
              {/* SECCIÓN 1: DATOS DEL COLEGIO */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                  1. Institución Educativa
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Colegio *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. COLEGIO ZÁRATE"
                    value={nombreColegio}
                    onChange={(e) => setNombreColegio(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={activoColegio ? 'true' : 'false'}
                    onChange={(e) => setActivoColegio(e.target.value === 'true')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="true">Activo (Visible para padres al ordenar)</option>
                    <option value="false">Pausado (Oculto temporalmente)</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN 2: CUENTA DEL ADMINISTRADOR DE ESTE COLEGIO */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                  2. Cuenta del Administrador para este Colegio
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo del Administrador *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Admin San Agustín"
                    value={adminNombre}
                    onChange={(e) => setAdminNombre(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usuario / DNI para Login *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. ADM-SANAGUSTIN o DNI"
                      value={adminDni}
                      onChange={(e) => setAdminDni(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 987654321"
                      value={adminTelefono}
                      onChange={(e) => setAdminTelefono(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. sanagustin@almuerzos.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <input
                      type={verPassword ? 'text' : 'password'}
                      placeholder={colegioEnEdicion ? 'Nueva contraseña o dejar actual' : 'Contraseña de acceso'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                      required={!colegioEnEdicion}
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword(!verPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {verPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {colegioEnEdicion
                      ? 'Deja la contraseña en blanco si no deseas cambiarla.'
                      : 'El administrador usará su Usuario/DNI y esta clave para ingresar.'}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalColegioAbierto(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl text-xs sm:text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {guardando
                    ? 'Guardando...'
                    : colegioEnEdicion
                    ? 'Actualizar Colegio & Admin'
                    : 'Guardar Colegio & Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO: EDITAR CONTRASEÑA / ADMIN */}
      {modalAdminRapido.abierto && modalAdminRapido.colegio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Credenciales del Administrador
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Colegio: {modalAdminRapido.colegio.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAdminRapido({ abierto: false, colegio: null })}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarAdminRapido} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Administrador *
                </label>
                <input
                  type="text"
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario / DNI de Login *
                </label>
                <input
                  type="text"
                  value={adminDni}
                  onChange={(e) => setAdminDni(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    placeholder="Escribe la nueva contraseña"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {verPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Dejar en blanco para conservar la clave actual.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAdminRapido({ abierto: false, colegio: null })}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Credenciales'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER ESTUDIANTES ASOCIADOS AL COLEGIO */}
      {modalEstudiantes.abierto && modalEstudiantes.colegio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Cabecera del Modal */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/40 text-purple-200 border border-purple-400/30 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/20">
                      Estudiantes Vinculados
                    </span>
                    <span className="text-xs text-purple-200 font-medium">
                      {modalEstudiantes.estudiantes.length} alumno(s)
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                    {modalEstudiantes.colegio.nombre}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEstudiantes((prev) => ({ ...prev, abierto: false }))}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de herramientas: Búsqueda y Botones de Acción */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante, grado, apoderado, teléfono..."
                  value={modalEstudiantes.busquedaEstudiante}
                  onChange={(e) =>
                    setModalEstudiantes((prev) => ({ ...prev, busquedaEstudiante: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (modalEstudiantes.colegio) {
                      abrirModalEstudiantes(modalEstudiantes.colegio);
                    }
                  }}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Refrescar listado"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={exportarEstudiantesCSV}
                  disabled={modalEstudiantes.estudiantes.length === 0}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Descargar lista de estudiantes en formato Excel/CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Imprimir nómina de alumnos"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
              </div>
            </div>

            {/* Contenido / Listado con scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {modalEstudiantes.cargando ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-500">
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
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No hay estudiantes registrados para este colegio aún
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Cuando los padres de familia registren a sus hijos seleccionando{' '}
                        <strong>{modalEstudiantes.colegio.nombre}</strong>, aparecerán listados aquí con sus datos de contacto y grado.
                      </p>
                    </div>
                  );
                }

                if (filtrados.length === 0) {
                  return (
                    <div className="py-10 text-center text-xs text-slate-500">
                      No se encontraron estudiantes que coincidan con &quot;{modalEstudiantes.busquedaEstudiante}&quot;.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Estudiante</th>
                            <th className="py-2.5 px-3">Grado y Sección</th>
                            <th className="py-2.5 px-3">Padre / Apoderado</th>
                            <th className="py-2.5 px-3">Contacto WhatsApp</th>
                            <th className="py-2.5 px-3">Alergias / Notas</th>
                            <th className="py-2.5 px-3 text-right">Registro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtrados.map((est, idx) => {
                            const telLimpio = est.padreTelefono ? est.padreTelefono.replace(/\D/g, '') : '';
                            const waLink = telLimpio ? `https://wa.me/51${telLimpio}` : null;

                            return (
                              <tr key={est.id} className="hover:bg-purple-50/30 transition-colors">
                                <td className="py-3 px-3 font-mono text-slate-400 text-[11px] font-bold">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900 text-xs">
                                    {est.nombreCompleto}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 text-[11px]">
                                    {est.gradoSeccion}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-800">
                                    {est.padreNombre || 'No especificado'}
                                  </div>
                                  {est.padreDni && (
                                    <span className="text-[10px] text-slate-400">
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
                                      className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-500" />
                                      <span>{est.padreTelefono}</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">{est.padreTelefono || '-'}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  {est.alergiasNotas ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>{est.alergiasNotas}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Ninguna</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
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
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>
                Mostrando estudiantes matriculados en <strong>{modalEstudiantes.colegio.nombre}</strong>
              </span>
              <button
                type="button"
                onClick={() => setModalEstudiantes((prev) => ({ ...prev, abierto: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR YAPE Y PLIN */}
      {modalPagosAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Configurar Números de Yape y Plin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuración centralizada para el método de pago de todos los colegios
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPagosAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarPagos} className="space-y-4">
              {/* Sección Yape */}
              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  Datos de Cuenta Yape
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Número de Yape *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 999-999-999"
                      value={numeroYape}
                      onChange={(e) => setNumeroYape(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Titular / Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Placeres Culinarios"
                      value={titularYape}
                      onChange={(e) => setTitularYape(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Plin */}
              <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2.5">
                <span className="text-xs font-black text-sky-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                  Datos de Cuenta Plin
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Número de Plin *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 999-999-999"
                      value={numeroPlin}
                      onChange={(e) => setNumeroPlin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Titular / Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Placeres Culinarios"
                      value={titularPlin}
                      onChange={(e) => setTitularPlin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa en tiempo real */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Vista Previa en el Checkout de Padres
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-2.5 text-purple-950">
                    <p className="font-bold text-[11px]">Número de Yape: {numeroYape || '999-999-999'}</p>
                    <p className="text-[10px] text-purple-700 truncate">{titularYape || 'Placeres Culinarios'}</p>
                  </div>
                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-2.5 text-sky-950">
                    <p className="font-bold text-[11px]">Número de Plin: {numeroPlin || '999-999-999'}</p>
                    <p className="text-[10px] text-sky-700 truncate">{titularPlin || 'Placeres Culinarios'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={guardandoPagos}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardandoPagos ? (
                    <span className="animate-pulse">Guardando configuración...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Números de Pago</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalPagosAbierto(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
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
