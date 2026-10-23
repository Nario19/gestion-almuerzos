'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Search,
  CheckCircle,
  Clock,
  Printer,
  FileImage,
  Filter,
  DollarSign,
  AlertCircle,
  Check,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Lock,
  XCircle,
  RotateCcw,
  GraduationCap,
  Receipt,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearHoraPeru,
  calcularOffsetFechaPeru,
  formatearFechaEmisionPeru,
} from '@/lib/dateUtils';
import { Pedido, EstadoPedido, EstadoPago, FiltroGrados } from '@/types';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';

export type FiltroEstadoPedido =
  | 'TODOS'
  | 'ENTREGADOS'
  | 'PENDIENTES_ENTREGA'
  | 'PAGADOS'
  | 'NO_PAGADOS'
  | 'CANCELADOS';

export default function DespachoPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();
  const fechaHoy = obtenerFechaHoyPeru();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [colegioFiltro, setColegioFiltro] = useState<string>(
    !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : 'TODOS'
  );
  // Por defecto el filtro de fecha es el día de hoy
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoPedido>('TODOS');
  const [filtrosGrados, setFiltrosGrados] = useState<FiltroGrados[]>([]);
  const [filtroGradosSeleccionado, setFiltroGradosSeleccionado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);
  const [alertaBloqueoEntrega, setAlertaBloqueoEntrega] = useState<string | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<Pedido | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [procesandoCancelacion, setProcesandoCancelacion] = useState(false);

  // Estados de paginación para optimizar y no sobrecargar la vista
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const cargarDatos = async () => {
    const data = await dataService.obtenerPedidos();
    setPedidos(data);
    const cols = await dataService.obtenerColegios();
    if (cols) setColegios(cols);

    const colActual = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;
    if (colActual && colActual !== 'TODOS') {
      const fg = await dataService.obtenerFiltrosGrados(colActual);
      setFiltrosGrados(fg);
    } else {
      setFiltrosGrados([]);
    }
  };

  useEffect(() => {
    if (!esAdmin) return;
    let cancelado = false;
    dataService.obtenerPedidos().then((data) => {
      if (!cancelado) setPedidos(data);
    });
    dataService.obtenerColegios().then((cols) => {
      if (!cancelado && cols) setColegios(cols);
    });

    const colActual = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;
    if (colActual && colActual !== 'TODOS') {
      dataService.obtenerFiltrosGrados(colActual).then((fg) => {
        if (!cancelado) {
          setFiltrosGrados(fg);
          setFiltroGradosSeleccionado((prev) => (fg.some((f) => f.id === prev) ? prev : 'TODOS'));
        }
      });
    } else {
      setFiltrosGrados([]);
      setFiltroGradosSeleccionado('TODOS');
    }

    // Auto-actualización periódica continua cada 4 segundos para reflejar nuevos pedidos al instante
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 4000);
    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });
    return () => {
      cancelado = true;
      clearInterval(intervalo);
      desuscribir();
    };
  }, [esAdmin, esSuperAdmin, usuario?.colegioNombre, colegioFiltro]);

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoPedido) => {
    const pedidoActual = pedidos.find((p) => p.id === id);
    if (!pedidoActual) return;

    // Regla estricta: Yape y Plin NO pueden marcarse como ENTREGADO si el pago no está confirmado
    if (nuevoEstado === 'ENTREGADO') {
      const esYapeOPlin = pedidoActual.metodoPago === 'Yape' || pedidoActual.metodoPago === 'Plin';
      if (esYapeOPlin && pedidoActual.estadoPago !== 'PAGADO') {
        setAlertaBloqueoEntrega(
          `No se puede marcar como entregado el pedido #${pedidoActual.codigoPedido} de ${pedidoActual.estudianteNombre}: El pago por ${pedidoActual.metodoPago} debe ser confirmado antes de realizar la entrega.`
        );
        return;
      }
    }

    await dataService.cambiarEstadoPedido(id, nuevoEstado);
    cargarDatos();
  };

  const handleCambiarPago = async (id: string, nuevoPago: EstadoPago) => {
    const pedidoActual = pedidos.find((p) => p.id === id);
    // Si el pedido ya está entregado y pagado, no permitir revertir a PENDIENTE
    if (pedidoActual?.estadoPedido === 'ENTREGADO' && pedidoActual?.estadoPago === 'PAGADO' && nuevoPago === 'PENDIENTE') {
      return;
    }
    await dataService.cambiarEstadoPago(id, nuevoPago);
    cargarDatos();
  };

  const confirmarCancelarPedido = async () => {
    if (!pedidoACancelar) return;
    setProcesandoCancelacion(true);
    try {
      await dataService.cancelarPedido(pedidoACancelar.id, motivoCancelacion.trim() || undefined);
      setPedidoACancelar(null);
      setMotivoCancelacion('');
      await cargarDatos();
    } catch (err) {
      console.error('Error al cancelar pedido:', err);
      alert('Ocurrió un error al cancelar el pedido.');
    } finally {
      setProcesandoCancelacion(false);
    }
  };

  const reactivarPedido = async (id: string) => {
    try {
      await dataService.cambiarEstadoPedido(id, 'REGISTRADO');
      await cargarDatos();
    } catch (err) {
      console.error('Error al reactivar pedido:', err);
      alert('Ocurrió un error al reactivar el pedido.');
    }
  };

  // Formateador legible en español para la fecha
  const formatearFechaLegible = (fechaStr: string) => {
    if (fechaStr === 'TODAS') return 'Todas las fechas';
    return formatearFechaLegiblePeru(fechaStr);
  };

  // Formateador de hora en formato Perú (12h con a. m. / p. m.)
  const formatearHora = (fechaIso?: string) => {
    const h = formatearHoraPeru(fechaIso);
    return h || '--:--';
  };

  // Navegar día anterior o siguiente
  const cambiarDia = (offset: number) => {
    setPaginaActual(1);
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    setFechaFiltro(calcularOffsetFechaPeru(fechaFiltro, offset));
  };

  const colegioActivo = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;

  // Filtro de grupo de grados activo
  const filtroGradoActivo = filtrosGrados.find((f) => f.id === filtroGradosSeleccionado);
  const gradosSet =
    filtroGradoActivo && filtroGradoActivo.grados.length > 0
      ? new Set(filtroGradoActivo.grados.map((g) => g.trim().toLowerCase()))
      : null;

  // Filtrado base de pedidos por Calendario (Fecha), Colegio, Filtro de Grados y Búsqueda
  const pedidosBase = pedidos.filter((p) => {
    const fechaPedido = (p.fecha || '').slice(0, 10);
    const matchFecha = fechaFiltro === 'TODAS' || fechaPedido === fechaFiltro;
    const matchColegio = colegioActivo === 'TODOS' || p.colegioNombre === colegioActivo;
    const matchBusqueda =
      p.estudianteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.gradoSeccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoPedido.toLowerCase().includes(busqueda.toLowerCase());

    if (!matchFecha || !matchColegio || !matchBusqueda) return false;

    if (gradosSet && gradosSet.size > 0) {
      const gPed = (p.gradoSeccion || '').trim().toLowerCase();
      if (!gradosSet.has(gPed)) return false;
    }

    return true;
  });

  // Conteo de pedidos activos para cada chip de filtro de grados (según fecha y colegio)
  const conteoPorFiltroGrado = filtrosGrados.reduce((acc, fg) => {
    const setG = new Set(fg.grados.map((g) => g.trim().toLowerCase()));
    const conteo = pedidos.filter((p) => {
      const fechaPedido = (p.fecha || '').slice(0, 10);
      const matchFecha = fechaFiltro === 'TODAS' || fechaPedido === fechaFiltro;
      const matchColegio = colegioActivo === 'TODOS' || p.colegioNombre === colegioActivo;
      const matchGrado = setG.has((p.gradoSeccion || '').trim().toLowerCase());
      return matchFecha && matchColegio && matchGrado && p.estadoPedido !== 'CANCELADO';
    }).length;
    acc[fg.id] = conteo;
    return acc;
  }, {} as Record<string, number>);

  // Métricas rápidas (sobre el consolidado total de la fecha y filtros base de colegio)
  const total = pedidosBase.length;
  const cancelados = pedidosBase.filter((p) => p.estadoPedido === 'CANCELADO').length;
  const pedidosActivos = pedidosBase.filter((p) => p.estadoPedido !== 'CANCELADO');
  const entregados = pedidosActivos.filter((p) => p.estadoPedido === 'ENTREGADO').length;
  const faltaEntregar = pedidosActivos.filter(
    (p) =>
      (p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO') &&
      p.estadoPedido !== 'ENTREGADO'
  ).length;
  const pagados = pedidosActivos.filter((p) => p.estadoPago === 'PAGADO').length;
  const pendientesPago = pedidosActivos.length - pagados;

  // Filtrado final por Estado Operativo
  const pedidosFiltrados = pedidosBase.filter((p) => {
    if (filtroEstado === 'TODOS') return true;
    if (filtroEstado === 'ENTREGADOS') return p.estadoPedido === 'ENTREGADO';
    if (filtroEstado === 'PENDIENTES_ENTREGA') {
      return p.estadoPedido !== 'ENTREGADO' && p.estadoPedido !== 'CANCELADO';
    }
    if (filtroEstado === 'PAGADOS') {
      return p.estadoPago === 'PAGADO' && p.estadoPedido !== 'CANCELADO';
    }
    if (filtroEstado === 'NO_PAGADOS') {
      return p.estadoPago !== 'PAGADO' && p.estadoPedido !== 'CANCELADO';
    }
    if (filtroEstado === 'CANCELADOS') {
      return p.estadoPedido === 'CANCELADO';
    }
    return true;
  });

  // Cálculo de Paginación para no sobrecargar el renderizado
  const totalFiltrados = pedidosFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / porPagina) || 1;
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceInicio = (paginaValida - 1) * porPagina;
  const indiceFin = Math.min(indiceInicio + porPagina, totalFiltrados);
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicio, indiceFin);

  // Agrupar pedidos paginados por Colegio para la vista actual
  const gruposColegio = pedidosPaginados.reduce((acc, pedido) => {
    const key = pedido.colegioNombre || 'Colegio General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pedido);
    return acc;
  }, {} as Record<string, Pedido[]>);

  // Exportar lista a Excel con las columnas solicitadas: N°, Grado y Sección, Nombres, Pedido, Pago
  const exportarExcel = () => {
    if (pedidosFiltrados.length === 0) {
      alert('No hay pedidos para exportar con los filtros actuales.');
      return;
    }

    const nombreFecha = fechaFiltro === 'TODAS' ? 'Todas_las_Fechas' : fechaFiltro;
    const nombreColegio =
      colegioFiltro === 'TODOS'
        ? 'Todos_los_Colegios'
        : colegioFiltro.replace(/\s+/g, '_');
    const nombreGradoFiltro = filtroGradoActivo ? `_${filtroGradoActivo.nombre.replace(/\s+/g, '_')}` : '';
    const nombreEstado = filtroEstado !== 'TODOS' ? `_${filtroEstado}` : '';
    const fecha = obtenerFechaHoyPeru();
    const filename = `Reporte_Despacho_${nombreColegio}${nombreGradoFiltro}${nombreEstado}_${nombreFecha}_${fecha}.xls`;

    const filasHtml = pedidosFiltrados
      .map((p, idx) => {
        const matchNum = (p.codigoPedido || '').match(/-(\d+)$/);
        const numeroAlmuerzoColegio = matchNum ? parseInt(matchNum[1], 10) : undefined;
        const pedidosMismoColegio = pedidosFiltrados.filter((item) => item.colegioNombre === p.colegioNombre);
        const indiceEnColegio = pedidosMismoColegio.findIndex((item) => item.id === p.id) + 1;
        const numeroAlmuerzo = numeroAlmuerzoColegio || indiceEnColegio || idx + 1;

        const pedidoDetalle = `${
          p.entradaNombre ? `Sopa o postre: ${p.entradaNombre} | ` : ''
        }Segundo: ${p.segundoNombre}${
          p.refrigerioNombre ? ` | Extras: ${p.refrigerioNombre}` : ''
        }${
          p.observacion ? ` (Obs: ${p.observacion})` : ''
        }`;
        const pagoDetalle =
          p.estadoPedido === 'CANCELADO'
            ? `CANCELADO (${p.metodoPago || 'Sin pago'})`
            : p.estadoPago === 'PAGADO'
            ? `PAGADO (${p.metodoPago || 'Yape'})`
            : `POR PAGAR (S/ ${(p.monto || 12.0).toFixed(2)} - ${p.metodoPago || 'Pendiente'})`;
        const gradoSeccionDetalle =
          colegioFiltro === 'TODOS'
            ? `${p.colegioNombre} - ${p.gradoSeccion}`
            : p.gradoSeccion;
        const horaPedido = formatearHora(p.createdAt);
        const entregaDetalle =
          p.estadoPedido === 'CANCELADO'
            ? 'CANCELADO'
            : p.estadoPedido === 'ENTREGADO'
            ? `ENTREGADO${p.horaEntrega ? ` (${p.horaEntrega})` : ''}`
            : 'NO ENTREGADO';

        return `
        <tr>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; font-family: monospace;">#${p.codigoPedido}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Almuerzo #${numeroAlmuerzo}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${horaPedido}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${gradoSeccionDetalle}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">
            ${p.estudianteNombre}
            ${p.padreNombre ? `<br><span style="font-size: 10px; color: #475569; font-weight: normal;">Padre: ${p.padreNombre}</span>` : ''}
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${pedidoDetalle}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; ${
            p.estadoPago === 'PAGADO' ? 'color: #047857;' : 'color: #b91c1c;'
          }">${pagoDetalle}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; ${
            p.estadoPedido === 'ENTREGADO' ? 'color: #047857;' : 'color: #64748b;'
          }">${entregaDetalle}</td>
        </tr>
      `;
      })
      .join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Despacho</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #059669; color: #ffffff; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #047857; }
        </style>
      </head>
      <body>
        <h2 style="color: #065f46; margin-bottom: 2px;">REPORTE DE DESPACHO - PLACERES CULINARIOS</h2>
        <p style="color: #475569; margin-top: 0; margin-bottom: 12px;">
          <strong>Fecha Filtrada:</strong> ${fechaFiltro === 'TODAS' ? 'Todas las Fechas' : formatearFechaLegible(fechaFiltro)} &nbsp;|&nbsp;
          <strong>Colegio:</strong> ${colegioFiltro} &nbsp;|&nbsp;
          <strong>Fecha de Emisión:</strong> ${formatearFechaEmisionPeru()} &nbsp;|&nbsp;
          <strong>Total Pedidos:</strong> ${pedidosFiltrados.length}
        </p>
        <table>
          <thead>
            <tr>
              <th style="width: 110px; text-align: center;">Código</th>
              <th style="width: 100px; text-align: center;">N° Almuerzo</th>
              <th style="width: 100px; text-align: center;">Hora Pedido</th>
              <th style="width: 180px;">Grado y Sección</th>
              <th style="width: 220px;">Nombres</th>
              <th style="width: 280px;">Pedido</th>
              <th style="width: 150px;">Pago</th>
              <th style="width: 150px;">Entrega</th>
            </tr>
          </thead>
          <tbody>
            ${filasHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    window.print();
  };

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal de despacho y empaque de Placeres Culinarios." />;
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Barra de Acciones de Despacho (el título canónico ya se muestra en la barra superior blanca del navbar) */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {!esSuperAdmin && usuario?.colegioNombre ? (
            <span className="hidden">
              🏫 Colegio: {usuario.colegioNombre}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Imprimir Lista (Genera y descarga en Excel con las columnas solicitadas) */}
          <Button
            variant="default"
            size="sm"
            onClick={exportarExcel}
            className="gap-2 h-8 text-xs font-semibold"
            title="Descarga el listado en formato Excel con N°, Grado y Sección, Nombres, Pedido y Pago"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Imprimir Lista (Excel)</span>
          </Button>

          {/* Botón secundario para imprimir a papel / PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={imprimir}
            className="gap-1.5 h-8 text-xs font-semibold"
            title="Imprimir directamente en papel o PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Métricas Resumen - Interactivas como filtros rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 print:hidden">
        <StatCard
          label="Total Pedidos"
          value={pedidosActivos.length}
          subtext={cancelados > 0 ? `(${cancelados} cancelado${cancelados > 1 ? 's' : ''})` : "Órdenes activas"}
          icon={PackageCheck}
          variant="default"
          onClick={() => {
            setFiltroEstado('TODOS');
            setPaginaActual(1);
          }}
          active={filtroEstado === 'TODOS'}
        />

        <StatCard
          label="Entregados"
          value={entregados}
          subtext="Almuerzos entregados"
          icon={CheckCircle}
          variant="success"
          onClick={() => {
            setFiltroEstado((prev) => (prev === 'ENTREGADOS' ? 'TODOS' : 'ENTREGADOS'));
            setPaginaActual(1);
          }}
          active={filtroEstado === 'ENTREGADOS'}
        />

        <StatCard
          label="Falta Entregar"
          value={faltaEntregar}
          subtext="Listos por entregar"
          icon={Clock}
          variant="warning"
          onClick={() => {
            setFiltroEstado((prev) => (prev === 'PENDIENTES_ENTREGA' ? 'TODOS' : 'PENDIENTES_ENTREGA'));
            setPaginaActual(1);
          }}
          active={filtroEstado === 'PENDIENTES_ENTREGA'}
        />

        <StatCard
          label="Pagados / Por Cobrar"
          value={`${pagados} / ${pendientesPago}`}
          subtext="Confirmados vs pendientes"
          icon={DollarSign}
          variant="default"
          onClick={() => {
            setFiltroEstado((prev) =>
              prev === 'NO_PAGADOS' ? 'PAGADOS' : prev === 'PAGADOS' ? 'TODOS' : 'NO_PAGADOS'
            );
            setPaginaActual(1);
          }}
          active={filtroEstado === 'PAGADOS' || filtroEstado === 'NO_PAGADOS'}
        />
      </div>

      {/* Barra de Filtros y Buscador Unificada */}
      <Card className="mb-6 print:hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por estudiante, grado o código (#ALM)..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden transition"
            />
          </div>

          {/* Filtro de Calendario / Fecha */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/70 p-3 rounded-xl border border-zinc-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Filtrar por Fecha (Calendario)
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-950 capitalize">
                  {formatearFechaLegible(fechaFiltro)}
                  {fechaFiltro === fechaHoy && (
                    <Badge variant="success" className="ml-2 text-[10px] uppercase tracking-wider py-0 px-2 font-bold">
                      Hoy
                    </Badge>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Navegación Día Anterior */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => cambiarDia(-1)}
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Input nativo de Calendario */}
              <input
                type="date"
                value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
                onChange={(e) => {
                  setFechaFiltro(e.target.value || fechaHoy);
                  setPaginaActual(1);
                }}
                className="h-8 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-md px-2.5 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden cursor-pointer shadow-2xs"
                title="Haz clic para seleccionar cualquier fecha en el calendario"
              />

              {/* Navegación Día Siguiente */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => cambiarDia(1)}
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Botón rápido HOY */}
              <Button
                type="button"
                variant={fechaFiltro === fechaHoy ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setFechaFiltro(fechaHoy);
                  setPaginaActual(1);
                }}
              >
                Hoy
              </Button>

              {/* Botón Ver Todas las Fechas */}
              <Button
                type="button"
                variant={fechaFiltro === 'TODAS' ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setFechaFiltro('TODAS');
                  setPaginaActual(1);
                }}
              >
                Todas las Fechas
              </Button>
            </div>
          </div>

          {/* Filtro Dinámico de Colegios: Exclusivo para Super Administrador */}
          {esSuperAdmin && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-500 font-semibold px-1 flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-zinc-600" /> Colegio:
              </span>
              {['TODOS', ...colegios].map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={colegioActivo === c ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    setColegioFiltro(c);
                    setPaginaActual(1);
                  }}
                >
                  {c}
                </Button>
              ))}
            </div>
          )}

          {/* Filtro Dinámico de Grupos de Grados (Personalizados por Colegio) */}
          {filtrosGrados.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-500 font-semibold px-1 flex items-center gap-1.5 shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-700" /> Filtro de Grados:
              </span>
              <Button
                type="button"
                variant={filtroGradosSeleccionado === 'TODOS' ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => {
                  setFiltroGradosSeleccionado('TODOS');
                  setPaginaActual(1);
                }}
              >
                <span>Todos los Grados</span>
              </Button>
              {filtrosGrados.map((fg) => {
                const activo = filtroGradosSeleccionado === fg.id;
                const conteo = conteoPorFiltroGrado[fg.id] ?? 0;
                return (
                  <Button
                    key={fg.id}
                    type="button"
                    variant={activo ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5 gap-1.5"
                    onClick={() => {
                      setFiltroGradosSeleccionado((prev) => (prev === fg.id ? 'TODOS' : fg.id));
                      setPaginaActual(1);
                    }}
                    title={`Grados incluidos: ${fg.grados.join(', ')}`}
                  >
                    <span>{fg.nombre}</span>
                    <Badge
                      variant={activo ? "secondary" : "outline"}
                      className="text-[10px] py-0 px-1.5 font-bold"
                    >
                      {conteo}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Filtro Dinámico por Estado del Pedido (Para Administradores y Super Administrador) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100">
            <span className="text-xs text-zinc-500 font-semibold px-1 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-zinc-600" /> Estado:
            </span>
            {[
              { id: 'TODOS', label: 'Todos', count: total },
              { id: 'ENTREGADOS', label: 'Entregados', count: entregados },
              { id: 'PENDIENTES_ENTREGA', label: 'Falta Entregar', count: faltaEntregar },
              { id: 'PAGADOS', label: 'Pagados', count: pagados },
              { id: 'NO_PAGADOS', label: 'No Pagados', count: pendientesPago },
              { id: 'CANCELADOS', label: 'Cancelados', count: cancelados },
            ].map((item) => {
              const activo = filtroEstado === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={activo ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5 gap-1.5"
                  onClick={() => {
                    setFiltroEstado(item.id as FiltroEstadoPedido);
                    setPaginaActual(1);
                  }}
                >
                  <span>{item.label}</span>
                  <Badge
                    variant={activo ? "secondary" : "outline"}
                    className="text-[10px] py-0 px-1.5 font-bold"
                  >
                    {item.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Encabezado para impresión física */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-black text-slate-900">Reporte de Despacho y Empaque</h2>
        <p className="text-xs text-slate-600">
          Fecha: <strong>{fechaFiltro === 'TODAS' ? 'Todas las Fechas' : formatearFechaLegible(fechaFiltro)}</strong> | Colegio: <strong>{colegioActivo}</strong> {filtroGradoActivo ? `| Grupo: ${filtroGradoActivo.nombre}` : ''} {filtroEstado !== 'TODOS' ? `| Estado: ${filtroEstado}` : ''} | Fecha de Emisión: <strong>{formatearFechaEmisionPeru()}</strong> | Total: <strong>{totalFiltrados}</strong>
        </p>
      </div>

      {/* Lista / Reporte con estructura de columnas solicitada: N°, Grado y Sección, Nombres, Pedido, Pago */}
      {Object.keys(gruposColegio).length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <EmptyState
            icon={PackageCheck}
            title={`No se encontraron pedidos ${filtroEstado !== 'TODOS' ? `en estado "${filtroEstado.toLowerCase().replace('_', ' ')}"` : ''}`}
            description={`No hay almuerzos registrados para el ${formatearFechaLegible(fechaFiltro)} con los filtros seleccionados.`}
            className="border-none p-0"
            action={
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {filtroEstado !== 'TODOS' && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setFiltroEstado('TODOS');
                      setPaginaActual(1);
                    }}
                  >
                    Ver Todos los Estados
                  </Button>
                )}
                {fechaFiltro !== fechaHoy && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFechaFiltro(fechaHoy);
                      setPaginaActual(1);
                    }}
                  >
                    Ver Pedidos de Hoy
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFechaFiltro('TODAS');
                    setPaginaActual(1);
                  }}
                >
                  Ver Todas las Fechas
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(gruposColegio).map(([colegioNombre, listaPedidos]) => (
            <Card
              key={colegioNombre}
              className="overflow-hidden"
            >
              {/* Encabezado del Colegio */}
              <CardHeader className="bg-zinc-50/70 px-5 py-3.5 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <CardTitle className="text-sm sm:text-base font-bold text-zinc-950">{colegioNombre}</CardTitle>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {listaPedidos.length} alumnos
                </Badge>
              </CardHeader>

              {/* Tabla con la estructura de reporte solicitada: N° Almuerzo, Grado y Sección, Nombre, Pedido, Fecha y Hora, Pago, Entrega */}
              <div className="overflow-x-auto">
                <Table className="min-w-[850px]">
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200 bg-zinc-50/80 hover:bg-transparent">
                      <TableHead className="py-3 px-4 text-center w-28 text-xs font-semibold text-zinc-600" title="N° Almuerzo / Hora">
                        N° Almuerzo
                      </TableHead>
                      <TableHead className="py-3 px-4 w-36 text-xs font-semibold text-zinc-600">Grado y Sección</TableHead>
                      <TableHead className="py-3 px-4 w-48 text-xs font-semibold text-zinc-600">Nombre</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-zinc-600">Pedido</TableHead>
                      <TableHead className="py-3 px-4 w-36 text-xs font-semibold text-zinc-600">Fecha y Hora</TableHead>
                      <TableHead className="py-3 px-4 w-40 text-xs font-semibold text-zinc-600">Pago</TableHead>
                      <TableHead className="py-3 px-4 text-left w-44 print:hidden text-xs font-semibold text-zinc-600">Entrega</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs sm:text-sm">
                    {listaPedidos.map((p, idx) => {
                      const cancelado = p.estadoPedido === 'CANCELADO';
                      const entregado = p.estadoPedido === 'ENTREGADO';
                      const pagado = p.estadoPago === 'PAGADO';
                      const matchNum = (p.codigoPedido || '').match(/-(\d+)$/);
                      const numeroAlmuerzo = matchNum ? parseInt(matchNum[1], 10) : (idx + 1);

                      return (
                        <TableRow
                          key={p.id}
                          className={`transition-colors border-b border-zinc-100/70 ${
                            cancelado
                              ? 'bg-rose-50/40 opacity-80'
                              : entregado
                              ? 'bg-emerald-50/30'
                              : 'hover:bg-zinc-50/50'
                          }`}
                        >
                          {/* Columna 1: N° Almuerzo */}
                          <TableCell className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className={`font-mono font-bold text-xs sm:text-sm block ${cancelado ? 'line-through text-zinc-400' : 'text-zinc-950'}`}>
                                Almuerzo #{numeroAlmuerzo}
                              </span>
                              <Badge variant="outline" className="font-mono font-bold text-[10px] px-1.5 py-0 mt-0.5 border-zinc-200 bg-zinc-50">
                                #{p.codigoPedido}
                              </Badge>
                              {cancelado && (
                                <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0 mt-1">
                                  CANCELADO
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Columna 2: Grado y Sección */}
                          <TableCell className="py-3.5 px-4">
                            <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold bg-zinc-50 border-zinc-200 text-zinc-700">
                              {p.gradoSeccion}
                            </Badge>
                          </TableCell>

                          {/* Columna 3: Nombre (estudiante, padre y teléfono) */}
                          <TableCell className="py-3.5 px-4">
                            <div className={`font-bold text-xs sm:text-sm ${cancelado ? 'text-zinc-500' : 'text-zinc-950'}`}>
                              {p.estudianteNombre}
                            </div>
                            {p.padreNombre && (
                              <div className="text-[11px] text-zinc-600 font-medium mt-0.5 flex items-center gap-1">
                                <span className="text-zinc-400">Padre:</span> {p.padreNombre}
                              </div>
                            )}
                            {p.telefonoContacto && (
                              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                Tel: {p.telefonoContacto}
                              </div>
                            )}
                          </TableCell>

                          {/* Columna 4: Pedido */}
                          <TableCell className="py-3.5 px-4">
                            <div className="space-y-1">
                              {p.entradaNombre && (
                                <div className={`text-xs ${cancelado ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                                  <span className="font-semibold text-orange-700">Sopa o postre:</span>{' '}
                                  {p.entradaNombre}
                                </div>
                              )}
                              <div className={`text-xs font-medium ${cancelado ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                                <span className="font-bold text-zinc-900">Segundo:</span>{' '}
                                {p.segundoNombre}
                              </div>
                              {p.ensaladaNombre && (
                                <div className={`text-xs ${cancelado ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                                  <span className="font-semibold text-emerald-700">Ensalada:</span>{' '}
                                  {p.ensaladaNombre}
                                </div>
                              )}
                              {p.refrigerioNombre && (
                                <div className={`text-xs ${cancelado ? 'line-through text-zinc-400' : 'text-emerald-700 font-semibold'}`}>
                                  <span className="font-bold text-emerald-800">Extras:</span>{' '}
                                  {p.refrigerioNombre}
                                </div>
                              )}
                              {p.observacion && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium rounded-md mt-0.5">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Obs: {p.observacion}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Columna 5: Fecha y Hora (Juntadas) */}
                          <TableCell className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="font-semibold text-zinc-900 flex items-center gap-1.5 whitespace-nowrap">
                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                {p.fecha ? p.fecha.slice(0, 10) : p.diaSemana || 'Hoy'}
                              </span>
                              <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                {formatearHora(p.createdAt)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Columna: Pago y Aceptación */}
                          <TableCell className="py-3.5 px-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              {/* Insignia del Método de Pago */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.metodoPago === 'Yape' && (
                                  <Badge className="text-[10px] font-bold bg-purple-600 text-white shadow-xs border-0">
                                    Yape
                                  </Badge>
                                )}
                                {p.metodoPago === 'Plin' && (
                                  <Badge className="text-[10px] font-bold bg-sky-500 text-white shadow-xs border-0">
                                    Plin
                                  </Badge>
                                )}
                                {(p.metodoPago === 'Pagar luego' || p.metodoPago === 'Efectivo') && (
                                  <Badge className="text-[10px] font-bold bg-yellow-400 text-slate-950 shadow-xs border-0">
                                    Pagar luego
                                  </Badge>
                                )}
                                {!p.metodoPago && (
                                  <Badge variant="secondary" className="text-[10px] font-medium">
                                    Pendiente
                                  </Badge>
                                )}
                                {p.comprobanteUrl && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setComprobanteModal(p.comprobanteUrl || null)}
                                    className="h-6 px-1.5 text-[11px] font-medium text-purple-700 hover:text-purple-800 gap-1 print:hidden"
                                    title="Ver comprobante adjunto"
                                  >
                                    <FileImage className="w-3.5 h-3.5" />
                                    <span>Voucher</span>
                                  </Button>
                                )}
                              </div>

                              {cancelado ? (
                                <Badge variant="secondary" className="text-xs font-medium text-zinc-500">
                                  Pedido cancelado
                                </Badge>
                              ) : pagado ? (
                                entregado ? (
                                  <Badge variant="success" className="text-xs font-medium gap-1 cursor-default select-none">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Pago aceptado</span>
                                  </Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCambiarPago(p.id, 'PENDIENTE')}
                                    className="h-7 text-xs font-semibold gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    title="Pago aceptado (Clic para revertir si aún no se entregó)"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Pago aceptado</span>
                                  </Button>
                                )
                              ) : p.metodoPago === 'Pagar luego' ? (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs font-semibold gap-1.5 bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                                  title="Este pedido es fiado: se acepta y liquida en el módulo de Fiados"
                                >
                                  <Link href={esSuperAdmin ? '/superadmin/fiado' : '/admin/fiado'}>
                                    <Receipt className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Cobro en Fiado</span>
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleCambiarPago(p.id, 'PAGADO')}
                                  className="h-7 text-xs font-semibold gap-1.5"
                                  title="Aceptar pago"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Aceptar pago</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>

                          {/* Columna: Entrega (al costado de Pago) */}
                          <TableCell className="py-3.5 px-4 text-left print:hidden">
                            <div className="flex flex-col gap-1 items-start">
                              {cancelado ? (
                                <>
                                  <Badge variant="destructive" className="text-xs font-medium gap-1">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancelado</span>
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => reactivarPedido(p.id)}
                                    className="h-6 px-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-950 gap-1 mt-0.5"
                                    title="Reactivar pedido a estado registrado"
                                  >
                                    <RotateCcw className="w-3 h-3 text-zinc-500" />
                                    <span>Reactivar pedido</span>
                                  </Button>
                                </>
                              ) : entregado ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCambiarEstado(p.id, 'REGISTRADO')}
                                    className="h-7 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 gap-1.5"
                                    title="Pedido entregado (Clic para marcar como no entregado)"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>✓ Entregado</span>
                                  </Button>
                                  {p.horaEntrega ? (
                                    <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-emerald-600" />
                                      Hora: {p.horaEntrega}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-zinc-400">Entregado</span>
                                  )}
                                </>
                              ) : (p.metodoPago === 'Yape' || p.metodoPago === 'Plin') && !pagado ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setAlertaBloqueoEntrega(
                                        `No se puede marcar como entregado el pedido #${p.codigoPedido} de ${p.estudianteNombre}: El pago por ${p.metodoPago} debe ser confirmado antes de realizar la entrega.`
                                      )
                                    }
                                    className="h-7 text-xs font-medium text-zinc-400 hover:text-rose-600 border-zinc-200 hover:border-rose-200 gap-1.5"
                                    title="Bloqueado: Confirma el pago de Yape/Plin antes de entregar"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Requiere Pago</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPedidoACancelar(p);
                                      setMotivoCancelacion('');
                                    }}
                                    className="h-6 px-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 gap-1 mt-0.5"
                                    title="Cancelar pedido de almuerzo"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>Cancelar pedido</span>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCambiarEstado(p.id, 'ENTREGADO')}
                                    className="h-7 text-xs font-semibold gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                                    title={
                                      p.metodoPago === 'Pagar luego'
                                        ? 'Marcar como entregado (se registrará en Fiado si aún no está cancelado)'
                                        : 'Marcar como entregado y registrar hora de entrega'
                                    }
                                  >
                                    <PackageCheck className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Marcar Entregado</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPedidoACancelar(p);
                                      setMotivoCancelacion('');
                                    }}
                                    className="h-6 px-1 text-[11px] font-medium text-rose-600 hover:text-rose-800 gap-1 mt-0.5"
                                    title="Cancelar pedido de almuerzo"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>Cancelar pedido</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}

          {/* BARRA DE PAGINACIÓN */}
          <Card className="p-3 sm:p-4 print:hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-500">
                  Mostrando <strong className="text-zinc-900">{totalFiltrados > 0 ? indiceInicio + 1 : 0}</strong> a{' '}
                  <strong className="text-zinc-900">{indiceFin}</strong> de{' '}
                  <strong className="text-zinc-950 font-bold">{totalFiltrados}</strong> pedidos
                  {filtroEstado !== 'TODOS' && <span className="text-zinc-400 font-semibold ml-1">(filtrados)</span>}
                </span>
                <div className="h-4 w-px bg-zinc-200 hidden sm:block mx-1" />
                <label className="flex items-center gap-1.5 text-zinc-500 font-medium">
                  <span>Por página:</span>
                  <select
                    value={porPagina}
                    onChange={(e) => {
                      setPorPagina(Number(e.target.value));
                      setPaginaActual(1);
                    }}
                    className="h-7 bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium rounded-md px-2 py-0.5 text-xs focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </label>
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                  {/* Botón Primera Página */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-xs font-bold"
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaValida === 1}
                    title="Primera página"
                  >
                    «
                  </Button>

                  {/* Botón Anterior */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 font-medium"
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaValida === 1}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === totalPaginas ||
                          Math.abs(p - paginaValida) <= 1
                        );
                      })
                      .map((p, i, arr) => {
                        const prev = arr[i - 1];
                        const mostrarPuntos = prev && p - prev > 1;
                        return (
                          <React.Fragment key={p}>
                            {mostrarPuntos && (
                              <span className="px-1 text-zinc-400 font-bold">...</span>
                            )}
                            <Button
                              type="button"
                              variant={p === paginaValida ? "default" : "outline"}
                              size="icon"
                              className="h-8 w-8 text-xs font-bold"
                              onClick={() => setPaginaActual(p)}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {/* Botón Siguiente */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 font-medium"
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaValida === totalPaginas}
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>

                  {/* Botón Última Página */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-xs font-bold"
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaValida === totalPaginas}
                    title="Última página"
                  >
                    »
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal para visualizar voucher comprimido */}
      {comprobanteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-bold text-slate-800">Comprobante de Pago</h3>
              <button
                onClick={() => setComprobanteModal(null)}
                className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comprobanteModal}
                alt="Comprobante de pago"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerta de bloqueo de entrega sin pago previo */}
      {alertaBloqueoEntrega && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Entrega No Permitida</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {alertaBloqueoEntrega}
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setAlertaBloqueoEntrega(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cancelar pedido */}
      {pedidoACancelar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  ¿Cancelar Pedido #{pedidoACancelar.codigoPedido}?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta acción actualizará cocina, fiados y el consolidado de pedidos.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Estudiante:</span>
                <span className="font-bold text-slate-900">{pedidoACancelar.estudianteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Colegio / Grado:</span>
                <span className="font-bold text-slate-800">
                  {pedidoACancelar.colegioNombre} - {pedidoACancelar.gradoSeccion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plato:</span>
                <span className="font-bold text-slate-800">{pedidoACancelar.segundoNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método de pago:</span>
                <span className="font-bold text-slate-800">{pedidoACancelar.metodoPago || 'No especificado'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo de la cancelación (opcional):
              </label>
              <textarea
                rows={2}
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Ej. Alumno no asistió, error de fecha, pedido duplicado..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={procesandoCancelacion}
                onClick={() => {
                  setPedidoACancelar(null);
                  setMotivoCancelacion('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                No, volver
              </button>
              <button
                type="button"
                disabled={procesandoCancelacion}
                onClick={confirmarCancelarPedido}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                {procesandoCancelacion ? 'Cancelando...' : 'Sí, cancelar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
