'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearHoraPeru,
  calcularOffsetFechaPeru,
  formatearFechaEmisionPeru,
} from '@/lib/dateUtils';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';

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
  const [busqueda, setBusqueda] = useState('');
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);
  const [alertaBloqueoEntrega, setAlertaBloqueoEntrega] = useState<string | null>(null);

  // Estados de paginación para optimizar y no sobrecargar la vista
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const cargarDatos = async () => {
    const data = await dataService.obtenerPedidos();
    setPedidos(data);
    const cols = await dataService.obtenerColegios();
    if (cols) setColegios(cols);
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
  }, [esAdmin]);

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

  // Filtrado de pedidos por Calendario (Fecha), Colegio y Búsqueda
  const pedidosFiltrados = pedidos.filter((p) => {
    const fechaPedido = (p.fecha || '').slice(0, 10);
    const matchFecha = fechaFiltro === 'TODAS' || fechaPedido === fechaFiltro;
    const matchColegio = colegioActivo === 'TODOS' || p.colegioNombre === colegioActivo;
    const matchBusqueda =
      p.estudianteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.gradoSeccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoPedido.toLowerCase().includes(busqueda.toLowerCase());
    return matchFecha && matchColegio && matchBusqueda;
  });

  // Métricas rápidas (sobre el consolidado total de la fecha y filtros)
  const total = pedidosFiltrados.length;
  const entregados = pedidosFiltrados.filter((p) => p.estadoPedido === 'ENTREGADO').length;
  const faltaEntregar = pedidosFiltrados.filter(
    (p) =>
      (p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO') &&
      p.estadoPedido !== 'ENTREGADO'
  ).length;
  const pagados = pedidosFiltrados.filter((p) => p.estadoPago === 'PAGADO').length;
  const pendientesPago = total - pagados;

  // Cálculo de Paginación para no sobrecargar el renderizado
  const totalPaginas = Math.ceil(total / porPagina) || 1;
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceInicio = (paginaValida - 1) * porPagina;
  const indiceFin = Math.min(indiceInicio + porPagina, total);
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
    const fecha = obtenerFechaHoyPeru();
    const filename = `Reporte_Despacho_${nombreColegio}_${nombreFecha}_${fecha}.xls`;

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
          p.observacion ? ` (Obs: ${p.observacion})` : ''
        }`;
        const pagoDetalle =
          p.estadoPago === 'PAGADO'
            ? `PAGADO (${p.metodoPago || 'Yape'})`
            : `POR PAGAR (S/ 12.00 - ${p.metodoPago || 'Pendiente'})`;
        const gradoSeccionDetalle =
          colegioFiltro === 'TODOS'
            ? `${p.colegioNombre} - ${p.gradoSeccion}`
            : p.gradoSeccion;
        const horaPedido = formatearHora(p.createdAt);
        const entregaDetalle =
          p.estadoPedido === 'ENTREGADO'
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
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando credenciales de despacho...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal de despacho y empaque de Placeres Culinarios." />;
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-emerald-600" />
            Despacho y Empaque
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Gestión de pedidos por colegio y grado para armado de loncheras
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Imprimir Lista (Genera y descarga en Excel con las 5 columnas) */}
          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xs transition cursor-pointer"
            title="Descarga el listado en formato Excel con N°, Grado y Sección, Nombres, Pedido y Pago"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Imprimir Lista (Excel)
          </button>

          {/* Botón secundario para imprimir a papel / PDF */}
          <button
            onClick={imprimir}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition cursor-pointer"
            title="Imprimir directamente en papel o PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:hidden">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Pedidos</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{total}</div>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Entregados</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{entregados}</div>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">Falta Entregar</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{faltaEntregar}</div>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pagados / Por Cobrar</span>
          <div className="text-sm sm:text-base font-black text-slate-800 mt-1">
            <span className="text-emerald-600">{pagados}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-rose-600">{pendientesPago}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 space-y-3.5 print:hidden">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por estudiante, grado o código (#ALM)..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
          />
        </div>

        {/* Filtro de Calendario / Fecha */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Filtrar por Fecha (Calendario)
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 capitalize">
                {formatearFechaLegible(fechaFiltro)}
                {fechaFiltro === fechaHoy && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                    Hoy
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Navegación Día Anterior */}
            <button
              type="button"
              onClick={() => cambiarDia(-1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Input nativo de Calendario */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
                onChange={(e) => {
                  setFechaFiltro(e.target.value || fechaHoy);
                  setPaginaActual(1);
                }}
                className="bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer shadow-2xs"
                title="Haz clic para seleccionar cualquier fecha en el calendario"
              />
            </div>

            {/* Navegación Día Siguiente */}
            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Botón rápido HOY */}
            <button
              type="button"
              onClick={() => {
                setFechaFiltro(fechaHoy);
                setPaginaActual(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                fechaFiltro === fechaHoy
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Hoy
            </button>

            {/* Botón Ver Todas las Fechas */}
            <button
              type="button"
              onClick={() => {
                setFechaFiltro('TODAS');
                setPaginaActual(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                fechaFiltro === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Todas las Fechas
            </button>
          </div>
        </div>

        {/* Filtro Dinámico de Colegios */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-bold px-1 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> Colegio:
          </span>
          {!esSuperAdmin && usuario?.colegioNombre ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
              🏫 Colegio: {usuario.colegioNombre}
            </span>
          ) : (
            ['TODOS', ...colegios].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColegioFiltro(c);
                  setPaginaActual(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  colegioActivo === c
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Encabezado para impresión física */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-black text-slate-900">Reporte de Despacho y Empaque</h2>
        <p className="text-xs text-slate-600">
          Fecha: <strong>{fechaFiltro === 'TODAS' ? 'Todas las Fechas' : formatearFechaLegible(fechaFiltro)}</strong> | Colegio: <strong>{colegioFiltro}</strong> | Fecha de Emisión: <strong>{formatearFechaEmisionPeru()}</strong> | Total: <strong>{total}</strong>
        </p>
      </div>

      {/* Lista / Reporte con estructura de columnas solicitada: N°, Grado y Sección, Nombres, Pedido, Pago */}
      {Object.keys(gruposColegio).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">
            No se encontraron pedidos para el {formatearFechaLegible(fechaFiltro)}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {fechaFiltro === fechaHoy
              ? 'Aún no se han registrado almuerzos para el día de hoy con los filtros seleccionados.'
              : 'No hay pedidos programados para esta fecha.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {fechaFiltro !== fechaHoy && (
              <button
                type="button"
                onClick={() => setFechaFiltro(fechaHoy)}
                className="px-3.5 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition cursor-pointer shadow-xs"
              >
                Ver Pedidos de Hoy
              </button>
            )}
            <button
              type="button"
              onClick={() => setFechaFiltro('TODAS')}
              className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            >
              Ver Todas las Fechas
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(gruposColegio).map(([colegioNombre, listaPedidos]) => (
            <div
              key={colegioNombre}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Encabezado del Colegio */}
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">{colegioNombre}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-xl">
                  {listaPedidos.length} alumnos
                </span>
              </div>

              {/* Tabla con la estructura de reporte solicitada: N°, Grado y Sección, Nombres, Pedido, Pago (+ Acción Empaque) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100/75 text-slate-600 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 text-center w-28">N° Almuerzo / Hora</th>
                      <th className="py-3 px-4 w-40">Grado y Sección</th>
                      <th className="py-3 px-4 w-48">Nombres</th>
                      <th className="py-3 px-4">Pedido</th>
                      <th className="py-3 px-4 w-44">Pago</th>
                      <th className="py-3 px-4 text-left w-44 print:hidden">Entrega</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {listaPedidos.map((p, idx) => {
                      const entregado = p.estadoPedido === 'ENTREGADO';
                      const pagado = p.estadoPago === 'PAGADO';
                      const matchNum = (p.codigoPedido || '').match(/-(\d+)$/);
                      const numeroAlmuerzo = matchNum ? parseInt(matchNum[1], 10) : (idx + 1);

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            entregado
                              ? 'bg-emerald-50/30'
                              : 'hover:bg-slate-50/50'
                          }`}
                        >
                          {/* Columna: N° y Hora del Pedido */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-mono font-black text-slate-900 text-xs sm:text-sm block">
                                Almuerzo #{numeroAlmuerzo}
                              </span>
                              <span className="inline-block text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-200 mt-0.5">
                                #{p.codigoPedido}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1"
                                title="Hora en que se registró el pedido"
                              >
                                <Clock className="w-2.5 h-2.5 text-orange-500" />
                                {formatearHora(p.createdAt)}
                              </span>
                            </div>
                          </td>

                          {/* Columna: Grado y Sección */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                              {p.gradoSeccion}
                            </span>
                          </td>

                          {/* Columna: Nombres */}
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900 text-xs sm:text-sm">
                              {p.estudianteNombre}
                            </div>
                            {p.padreNombre && (
                              <div className="text-[11px] text-slate-700 font-bold mt-0.5 flex items-center gap-1">
                                <span className="text-slate-400 font-normal">Padre:</span> {p.padreNombre}
                              </div>
                            )}
                            {p.telefonoContacto && (
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                Tel: {p.telefonoContacto}
                              </div>
                            )}
                          </td>

                          {/* Columna: Pedido */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  📅 {p.fecha ? p.fecha.slice(0, 10) : p.diaSemana || 'Hoy'}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                                  <Clock className="w-2.5 h-2.5 text-orange-500" />
                                  {formatearHora(p.createdAt)}
                                </span>
                              </div>
                              {p.entradaNombre && (
                                <div className="text-xs text-slate-700">
                                  <span className="font-semibold text-orange-700">Sopa o postre:</span>{' '}
                                  {p.entradaNombre}
                                </div>
                              )}
                              <div className="text-xs text-slate-800 font-medium">
                                <span className="font-bold text-amber-800">Segundo:</span>{' '}
                                {p.segundoNombre}
                              </div>
                              {p.observacion && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-md mt-0.5">
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                  <span>Obs: {p.observacion}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Columna: Pago y Aceptación */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              {/* Insignia del Método de Pago */}
                              <div className="flex items-center gap-1.5">
                                {p.metodoPago === 'Yape' && (
                                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-purple-600 text-white shadow-xs">
                                    Yape
                                  </span>
                                )}
                                {p.metodoPago === 'Plin' && (
                                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-sky-500 text-white shadow-xs">
                                    Plin
                                  </span>
                                )}
                                {(p.metodoPago === 'Pagar luego' || p.metodoPago === 'Efectivo') && (
                                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-yellow-400 text-slate-950 shadow-xs">
                                    Pagar luego
                                  </span>
                                )}
                                {!p.metodoPago && (
                                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                                    Pendiente
                                  </span>
                                )}
                                {p.comprobanteUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setComprobanteModal(p.comprobanteUrl || null)}
                                    className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-0.5 print:hidden cursor-pointer"
                                    title="Ver comprobante adjunto"
                                  >
                                    <FileImage className="w-3.5 h-3.5" />
                                    <span>Voucher</span>
                                  </button>
                                )}
                              </div>

                              {pagado ? (
                                entregado ? (
                                  <div
                                    className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default select-none shadow-2xs"
                                    title="Pago aceptado"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Pago aceptado</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCambiarPago(p.id, 'PENDIENTE')}
                                    className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 shadow-2xs"
                                    title="Pago aceptado (Clic para revertir si aún no se entregó)"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Pago aceptado</span>
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCambiarPago(p.id, 'PAGADO')}
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                  title="Aceptar pago"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Aceptar pago</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Columna: Entrega (al costado de Pago) */}
                          <td className="py-3.5 px-4 text-left print:hidden">
                            <div className="flex flex-col gap-1 items-start">
                              {entregado ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCambiarEstado(p.id, 'REGISTRADO')}
                                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                                    title="Pedido entregado (Clic para marcar como no entregado)"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>✓ Entregado</span>
                                  </button>
                                  {p.horaEntrega ? (
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-emerald-600" />
                                      Hora: {p.horaEntrega}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Entregado</span>
                                  )}
                                </>
                              ) : (p.metodoPago === 'Yape' || p.metodoPago === 'Plin') && !pagado ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAlertaBloqueoEntrega(
                                      `No se puede marcar como entregado el pedido #${p.codigoPedido} de ${p.estudianteNombre}: El pago por ${p.metodoPago} debe ser confirmado antes de realizar la entrega.`
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 hover:border-rose-300 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                  title="Bloqueado: Confirma el pago de Yape/Plin antes de entregar"
                                >
                                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Requiere Pago</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstado(p.id, 'ENTREGADO')}
                                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
                                  title={
                                    p.metodoPago === 'Pagar luego'
                                      ? 'Marcar como entregado (se registrará en Fiado si aún no está cancelado)'
                                      : 'Marcar como entregado y registrar hora de entrega'
                                  }
                                >
                                  <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Marcar Entregado</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* BARRA DE PAGINACIÓN */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-500">
                Mostrando <strong className="text-slate-800">{total > 0 ? indiceInicio + 1 : 0}</strong> a{' '}
                <strong className="text-slate-800">{indiceFin}</strong> de{' '}
                <strong className="text-slate-900">{total}</strong> pedidos
              </span>
              <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />
              <label className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Por página:</span>
                <select
                  value={porPagina}
                  onChange={(e) => {
                    setPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-orange-500 cursor-pointer"
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
                <button
                  type="button"
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaValida === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                  title="Primera página"
                >
                  «
                </button>

                {/* Botón Anterior */}
                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaValida === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

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
                            <span className="px-1 text-slate-400 font-bold">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPaginaActual(p)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                              p === paginaValida
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Botón Siguiente */}
                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaValida === totalPaginas}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold cursor-pointer"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Botón Última Página */}
                <button
                  type="button"
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaValida === totalPaginas}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                  title="Última página"
                >
                  »
                </button>
              </div>
            )}
          </div>
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
    </div>
  );
}
