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
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';

// Obtener fecha actual en formato YYYY-MM-DD en hora local
const obtenerFechaHoy = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DespachoPage() {
  const { esAdmin, cargando: cargandoAuth } = useAuth();
  const fechaHoy = obtenerFechaHoy();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [colegioFiltro, setColegioFiltro] = useState<string>('TODOS');
  // Por defecto el filtro de fecha es el día de hoy
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);
  const [busqueda, setBusqueda] = useState('');
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);

  const cargarDatos = async () => {
    const data = await dataService.obtenerPedidos();
    setPedidos(data);
    const cols = await dataService.obtenerColegios();
    if (cols) setColegios(cols);
  };

  useEffect(() => {
    if (!esAdmin) return;
    cargarDatos();
    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });
    return () => desuscribir();
  }, [esAdmin]);

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoPedido) => {
    await dataService.cambiarEstadoPedido(id, nuevoEstado);
    cargarDatos();
  };

  const handleCambiarPago = async (id: string, nuevoPago: EstadoPago) => {
    await dataService.cambiarEstadoPago(id, nuevoPago);
    cargarDatos();
  };

  // Formateador legible en español para la fecha
  const formatearFechaLegible = (fechaStr: string) => {
    if (fechaStr === 'TODAS') return 'Todas las fechas';
    try {
      const [y, m, d] = fechaStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (_) {
      return fechaStr;
    }
  };

  // Navegar día anterior o siguiente
  const cambiarDia = (offset: number) => {
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    try {
      const [y, m, d] = fechaFiltro.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + offset);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFechaFiltro(`${year}-${month}-${day}`);
    } catch (_) {}
  };

  // Filtrado de pedidos por Calendario (Fecha), Colegio y Búsqueda
  const pedidosFiltrados = pedidos.filter((p) => {
    const fechaPedido = (p.fecha || '').slice(0, 10);
    const matchFecha = fechaFiltro === 'TODAS' || fechaPedido === fechaFiltro;
    const matchColegio = colegioFiltro === 'TODOS' || p.colegioNombre === colegioFiltro;
    const matchBusqueda =
      p.estudianteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.gradoSeccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoPedido.toLowerCase().includes(busqueda.toLowerCase());
    return matchFecha && matchColegio && matchBusqueda;
  });

  // Métricas rápidas
  const total = pedidosFiltrados.length;
  const empacados = pedidosFiltrados.filter(
    (p) => p.estadoPedido === 'EMPACADO' || p.estadoPedido === 'ENTREGADO'
  ).length;
  const pendientesEmpaque = total - empacados;
  const pagados = pedidosFiltrados.filter((p) => p.estadoPago === 'PAGADO').length;
  const pendientesPago = total - pagados;

  // Agrupar pedidos por Colegio
  const gruposColegio = pedidosFiltrados.reduce((acc, pedido) => {
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
    const fecha = new Date().toISOString().slice(0, 10);
    const filename = `Reporte_Despacho_${nombreColegio}_${nombreFecha}_${fecha}.xls`;

    const filasHtml = pedidosFiltrados
      .map((p, idx) => {
        const pedidoDetalle = `${
          p.entradaNombre ? `Entrada: ${p.entradaNombre} | ` : ''
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

        return `
        <tr>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${
            idx + 1
          }</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${gradoSeccionDetalle}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${
            p.estudianteNombre
          }</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${pedidoDetalle}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; ${
            p.estadoPago === 'PAGADO' ? 'color: #047857;' : 'color: #b91c1c;'
          }">${pagoDetalle}</td>
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
          <strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-PE')} &nbsp;|&nbsp;
          <strong>Total Pedidos:</strong> ${pedidosFiltrados.length}
        </p>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">N°</th>
              <th style="width: 200px;">Grado y Sección</th>
              <th style="width: 240px;">Nombres</th>
              <th style="width: 320px;">Pedido</th>
              <th style="width: 160px;">Pago</th>
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
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Empacados</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{empacados}</div>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">Por Empacar</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{pendientesEmpaque}</div>
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
            onChange={(e) => setBusqueda(e.target.value)}
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
                onChange={(e) => setFechaFiltro(e.target.value || fechaHoy)}
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
              onClick={() => setFechaFiltro(fechaHoy)}
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
              onClick={() => setFechaFiltro('TODAS')}
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
          {['TODOS', ...colegios].map((c) => (
            <button
              key={c}
              onClick={() => setColegioFiltro(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                colegioFiltro === c
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Encabezado para impresión física */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-black text-slate-900">Reporte de Despacho y Empaque</h2>
        <p className="text-xs text-slate-600">
          Fecha: <strong>{fechaFiltro === 'TODAS' ? 'Todas las Fechas' : formatearFechaLegible(fechaFiltro)}</strong> | Colegio: <strong>{colegioFiltro}</strong> | Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-PE')}</strong> | Total: <strong>{total}</strong>
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
                      <th className="py-3 px-4 text-center w-14">N°</th>
                      <th className="py-3 px-4 w-44">Grado y Sección</th>
                      <th className="py-3 px-4 w-52">Nombres</th>
                      <th className="py-3 px-4">Pedido</th>
                      <th className="py-3 px-4 w-44">Pago</th>
                      <th className="py-3 px-4 text-right w-36 print:hidden">Empaque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {listaPedidos.map((p, idx) => {
                      const empacado =
                        p.estadoPedido === 'EMPACADO' || p.estadoPedido === 'ENTREGADO';
                      const pagado = p.estadoPago === 'PAGADO';

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            empacado
                              ? 'bg-slate-50/60 opacity-80'
                              : 'hover:bg-slate-50/50'
                          }`}
                        >
                          {/* Columna: N° */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                              {idx + 1}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              #{p.codigoPedido}
                            </span>
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
                            {p.telefonoContacto && (
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                Tel: {p.telefonoContacto}
                              </div>
                            )}
                          </td>

                          {/* Columna: Pedido */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {fechaFiltro === 'TODAS' && (
                                <div>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                                    📅 {p.fecha ? p.fecha.slice(0, 10) : p.diaSemana || 'Hoy'}
                                  </span>
                                </div>
                              )}
                              {p.entradaNombre && (
                                <div className="text-xs text-slate-700">
                                  <span className="font-semibold text-orange-700">Entrada:</span>{' '}
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

                          {/* Columna: Pago */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCambiarPago(p.id, pagado ? 'PENDIENTE' : 'PAGADO')
                                }
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                  pagado
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                }`}
                                title="Clic para alternar estado de pago"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                {pagado
                                  ? `Pagado (${p.metodoPago || 'Yape'})`
                                  : `Por Pagar (${p.metodoPago || 'S/ 12'})`}
                              </button>

                              {p.comprobanteUrl && (
                                <button
                                  type="button"
                                  onClick={() => setComprobanteModal(p.comprobanteUrl || null)}
                                  className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 print:hidden cursor-pointer"
                                >
                                  <FileImage className="w-3.5 h-3.5" />
                                  Ver Voucher
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Columna Acciones / Empaque */}
                          <td className="py-3.5 px-4 text-right print:hidden">
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstado(
                                  p.id,
                                  empacado ? 'REGISTRADO' : 'EMPACADO'
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition cursor-pointer ${
                                empacado
                                  ? 'bg-slate-800 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {empacado ? 'Empacado ✓' : 'Marcar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
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
    </div>
  );
}
