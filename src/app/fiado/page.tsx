'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Phone,
  FileText,
  Building2,
  PackageCheck,
  X,
  CreditCard,
  Utensils,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearFechaEmisionPeru,
  calcularOffsetFechaPeru,
} from '@/lib/dateUtils';
import { PadreFiadoResumen, ItemFiadoPedido } from '@/types';

export default function FiadoPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();

  const fechaHoy = useMemo(() => obtenerFechaHoyPeru(), []);
  const [fiados, setFiados] = useState<PadreFiadoResumen[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [colegioFiltro, setColegioFiltro] = useState<string>(
    !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : 'TODOS'
  );
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTES' | 'TODOS' | 'SALDADOS'>('PENDIENTES');
  const [fechaFiltro, setFechaFiltro] = useState<string>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  // Paginación de Familias
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(8);

  const cambiarDia = (offset: number) => {
    const base = fechaFiltro === 'TODAS' ? fechaHoy : fechaFiltro;
    setFechaFiltro(calcularOffsetFechaPeru(base, offset));
  };

  // Resetear a primera página al modificar cualquier filtro o búsqueda
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, colegioFiltro, filtroEstado, fechaFiltro, porPagina]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Estados de interfaz
  const [tarjetasExpandidas, setTarjetasExpandidas] = useState<Record<string, boolean>>({});
  const [padreReporteModal, setPadreReporteModal] = useState<PadreFiadoResumen | null>(null);
  const [mostrarReporteGlobal, setMostrarReporteGlobal] = useState(false);

  // Confirmación de pago / liquidación
  const [confirmacion, setConfirmacion] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: React.ReactNode;
    onConfirmar: () => Promise<void>;
  }>({
    abierto: false,
    titulo: '',
    mensaje: null,
    onConfirmar: async () => {},
  });
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const col = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;
      const [resFiados, resColegios] = await Promise.all([
        dataService.obtenerFiados(col),
        dataService.obtenerColegios(),
      ]);
      setFiados(resFiados);
      if (resColegios) setColegios(resColegios);
    } catch (err) {
      console.error('Error cargando lista de fiados:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!esAdmin) return;
    let cancelado = false;
    const col = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;

    dataService.obtenerFiados(col).then((resFiados) => {
      if (!cancelado) {
        setFiados(resFiados);
        setCargando(false);
      }
    });
    dataService.obtenerColegios().then((resColegios) => {
      if (!cancelado && resColegios) setColegios(resColegios);
    });

    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });
    return () => {
      cancelado = true;
      desuscribir();
    };
  }, [esAdmin, colegioFiltro, usuario?.colegioNombre, esSuperAdmin]);

  // Conteo total de almuerzos fiados pendientes de HOY
  const totalFiadosHoy = useMemo(() => {
    return fiados.reduce((acc, p) => {
      return (
        acc +
        p.pedidos.filter((ped) => ped.fecha === fechaHoy && ped.estadoPago !== 'PAGADO').length
      );
    }, 0);
  }, [fiados, fechaHoy]);

  // Filtrado de padres según búsqueda, estado y fecha de consumo
  const fiadosFiltrados = useMemo(() => {
    return fiados
      .map((padre) => {
        // Todas las fechas únicas en las que este padre tiene consumos
        const fechasUnicas = Array.from(new Set(padre.pedidos.map((p) => p.fecha))).sort((a, b) =>
          b.localeCompare(a)
        );
        const tieneConsumoHoy = padre.pedidos.some((p) => p.fecha === fechaHoy);

        // Si se filtra por fecha específica, aislamos los pedidos de esa fecha
        const pedidosCorrespondientes =
          fechaFiltro === 'TODAS'
            ? padre.pedidos
            : padre.pedidos.filter((p) => p.fecha === fechaFiltro);

        const deudaCorrespondiente = pedidosCorrespondientes
          .filter((p) => p.estadoPago !== 'PAGADO')
          .reduce((acc, p) => acc + (Number(p.monto) || 12.0), 0);

        const entregadosCorrespondientes = pedidosCorrespondientes.filter(
          (p) => p.estadoPedido === 'ENTREGADO'
        ).length;

        return {
          ...padre,
          pedidos: pedidosCorrespondientes,
          totalDeuda: deudaCorrespondiente,
          totalDeudaHistorica: padre.totalDeuda,
          totalPedidos: pedidosCorrespondientes.length,
          pedidosEntregados: entregadosCorrespondientes,
          tieneConsumoHoy,
          fechasUnicas,
        };
      })
      .filter((padre) => {
        // Si hay filtro de fecha activo y la familia no tiene pedidos en esa fecha, se excluye
        if (fechaFiltro !== 'TODAS' && padre.totalPedidos === 0) return false;

        // Filtro de estado
        if (filtroEstado === 'PENDIENTES' && padre.totalDeuda <= 0) return false;
        if (filtroEstado === 'SALDADOS' && padre.totalDeuda > 0) return false;

        // Filtro de búsqueda
        if (!busqueda.trim()) return true;
        const term = busqueda.toLowerCase();
        const matchNombre = padre.nombrePadre.toLowerCase().includes(term);
        const matchTelefono = padre.telefono.includes(term);
        const matchHijos = padre.hijosNombres.some((h) => h.toLowerCase().includes(term));
        const matchColegio = padre.colegioNombre.toLowerCase().includes(term);
        const matchCodigos = padre.pedidos.some((p) => p.codigoPedido.toLowerCase().includes(term));
        const matchFechas = padre.fechasUnicas.some((f) => f.includes(term));

        return (
          matchNombre ||
          matchTelefono ||
          matchHijos ||
          matchColegio ||
          matchCodigos ||
          matchFechas
        );
      });
  }, [fiados, filtroEstado, busqueda, fechaFiltro, fechaHoy]);

  // Cálculo de Paginación de Familias
  const totalFamilias = fiadosFiltrados.length;
  const totalPaginas = Math.ceil(totalFamilias / porPagina) || 1;
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceInicio = (paginaValida - 1) * porPagina;
  const indiceFin = Math.min(indiceInicio + porPagina, totalFamilias);
  const fiadosPaginados = fiadosFiltrados.slice(indiceInicio, indiceFin);

  // KPIs
  const totalDeudaGlobal = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => acc + p.totalDeuda, 0);
  }, [fiadosFiltrados]);

  const totalFamiliasConDeuda = useMemo(() => {
    return fiadosFiltrados.filter((p) => p.totalDeuda > 0).length;
  }, [fiadosFiltrados]);

  const totalAlmuerzosFiados = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => {
      return acc + p.pedidos.filter((ped) => ped.estadoPago !== 'PAGADO').length;
    }, 0);
  }, [fiadosFiltrados]);

  const totalEntregadosSinCobrar = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => {
      return (
        acc +
        p.pedidos.filter((ped) => ped.estadoPedido === 'ENTREGADO' && ped.estadoPago !== 'PAGADO').length
      );
    }, 0);
  }, [fiadosFiltrados]);

  // Toggle expandir detalles de un padre
  const toggleExpandir = (clave: string) => {
    setTarjetasExpandidas((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  // Generar y enviar mensaje de cobro por WhatsApp organizado por hijo
  const enviarCobroWhatsApp = (padre: PadreFiadoResumen) => {
    const telefonoLimpio = padre.telefono.replace(/\D/g, '');
    const telefonoFinal = telefonoLimpio.startsWith('51')
      ? telefonoLimpio
      : `51${telefonoLimpio}`;

    const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

    // Desglose agrupado por cada hijo
    const porHijo: Record<string, ItemFiadoPedido[]> = {};
    pedidosPendientes.forEach((p) => {
      if (!porHijo[p.estudianteNombre]) porHijo[p.estudianteNombre] = [];
      porHijo[p.estudianteNombre].push(p);
    });

    const bloquesHijos = Object.entries(porHijo)
      .map(([hijo, peds]) => {
        const subtotal = peds.reduce((acc, p) => acc + (p.monto || 12), 0);
        const grado = peds[0]?.gradoSeccion ? ` (${peds[0].gradoSeccion})` : '';
        const filas = peds
          .map((p) => {
            const entregaTag =
              p.estadoPedido === 'ENTREGADO' ? '✓ Entregado' : '⏳ Pendiente';
            return `    • ${p.fecha}: ${p.entradaNombre ? `${p.entradaNombre} + ` : ''}${p.segundoNombre} [S/ ${(p.monto || 12).toFixed(2)}] (${entregaTag})`;
          })
          .join('\n');
        return `👦 *${hijo}*${grado} - Subtotal: S/ ${subtotal.toFixed(2)}:\n${filas}`;
      })
      .join('\n\n');

    const mensaje =
      `Hola *${padre.nombrePadre}*, le saludamos de *Placeres Culinarios* (${padre.colegioNombre}).\n\n` +
      `Le compartimos el estado de cuenta detallado de sus almuerzos bajo la modalidad *"Pagar luego / Fiado"*:\n\n` +
      `📋 *Detalle por Estudiante (${pedidosPendientes.length} almuerzos pendientes):*\n\n` +
      `${bloquesHijos}\n\n` +
      `💰 *Total pendiente de pago: S/ ${padre.totalDeuda.toFixed(2)}*\n\n` +
      `Puede realizar su abono a través de:\n` +
      `• *Yape / Plin:* 999-999-999 (Placeres Culinarios)\n` +
      `• O cancelarlo directamente en el módulo de atención escolar.\n\n` +
      `Agradecemos enviar su comprobante por este medio para registrar su abono. ¡Muchas gracias!`;

    const url = `https://wa.me/${telefonoFinal}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Exportar Reporte Global a Excel
  const exportarReporteGlobalExcel = () => {
    const colStr = colegioFiltro === 'TODOS' ? 'Todos los Colegios' : colegioFiltro;
    const filasHtml = fiadosFiltrados
      .map((p, idx) => {
        const hijosStr = p.hijosNombres.join(', ');
        const totalPeds = p.pedidos.length;
        const pendPeds = p.pedidos.filter((ped) => ped.estadoPago !== 'PAGADO').length;
        const entregadosSinCobrar = p.pedidos.filter(
          (ped) => ped.estadoPedido === 'ENTREGADO' && ped.estadoPago !== 'PAGADO'
        ).length;
        const fechasStr = p.fechasUnicas.join(', ');
        return `
        <tr>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${p.nombrePadre}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${p.telefono || 'Sin teléfono'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${p.colegioNombre}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${fechasStr}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px;">${hijosStr}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${totalPeds} (${pendPeds} pend / ${entregadosSinCobrar} entregados)</td>
          <td style="text-align: right; border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; color: #b45309;">S/ ${p.totalDeuda.toFixed(2)}</td>
        </tr>
      `;
      })
      .join('');

    const fechaFiltroLabel =
      fechaFiltro === 'TODAS'
        ? 'Todas las Fechas (Histórico Completo)'
        : formatearFechaLegiblePeru(fechaFiltro);

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #d97706; color: #ffffff; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #b45309; }
        </style>
      </head>
      <body>
        <h2 style="color: #92400e; margin-bottom: 2px;">REPORTE GLOBAL DE FIADOS / PAGAR LUEGO - PLACERES CULINARIOS</h2>
        <p style="color: #475569; margin-top: 0; margin-bottom: 12px;">
          <strong>Institución:</strong> ${colStr} &nbsp;|&nbsp;
          <strong>Fecha de Consumo:</strong> ${fechaFiltroLabel} &nbsp;|&nbsp;
          <strong>Emisión:</strong> ${formatearFechaEmisionPeru()} &nbsp;|&nbsp;
          <strong>Familias con Deuda:</strong> ${totalFamiliasConDeuda} &nbsp;|&nbsp;
          <strong>Total Deuda Acumulada:</strong> S/ ${totalDeudaGlobal.toFixed(2)}
        </p>
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">N°</th>
              <th style="width: 220px;">Padre de Familia</th>
              <th style="width: 120px;">Teléfono</th>
              <th style="width: 180px;">Colegio</th>
              <th style="width: 160px;">Fechas de Consumo</th>
              <th style="width: 220px;">Hijos</th>
              <th style="width: 180px; text-align: center;">Almuerzos Fiados</th>
              <th style="width: 130px; text-align: right;">Deuda Pendiente</th>
            </tr>
          </thead>
          <tbody>
            ${filasHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #fef3c7;">
              <td colspan="7" style="text-align: right; border: 1px solid #cbd5e1; padding: 8px;">TOTAL GENERAL ADEUDADO:</td>
              <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #b45309;">S/ ${totalDeudaGlobal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Global_Fiados_${colStr.replace(/\s+/g, '_')}_${obtenerFechaHoyPeru()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Acción: Marcar un almuerzo individual como pagado
  const handleSolicitarPagoIndividual = (pedido: ItemFiadoPedido) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Registrar pago del almuerzo?`,
      mensaje: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            ¿Confirmas que se recibió el abono de <strong>S/ {(pedido.monto || 12).toFixed(2)}</strong> por el almuerzo de{' '}
            <strong>{pedido.estudianteNombre}</strong> ({pedido.fecha})?
          </p>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800">Menú:</span>
            <span>
              {pedido.entradaNombre ? `${pedido.entradaNombre} + ` : ''}
              {pedido.segundoNombre}
            </span>
          </div>
        </div>
      ),
      onConfirmar: async () => {
        await dataService.marcarFiadoComoPagado(pedido.id);
        await cargarDatos();
      },
    });
  };

  // Acción: Liquidar toda la deuda del padre
  const handleSolicitarLiquidarTotal = (padre: PadreFiadoResumen) => {
    const ident = padre.padreId || padre.telefono;
    setConfirmacion({
      abierto: true,
      titulo: `¿Liquidar deuda total de ${padre.nombrePadre}?`,
      mensaje: (
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Esta acción marcará como <strong>PAGADOS</strong> todos los almuerzos pendientes de esta familia ({padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO').length} almuerzos) por un total de:
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
            <span className="text-2xl font-black text-emerald-700">
              S/ {padre.totalDeuda.toFixed(2)}
            </span>
            <span className="block text-[11px] text-emerald-800 mt-0.5">Monto total a saldar</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Los pedidos se mantendrán en el historial de la familia marcados como pagos confirmados.
          </p>
        </div>
      ),
      onConfirmar: async () => {
        const idsPendientes = padre.pedidos
          .filter((p) => p.estadoPago !== 'PAGADO')
          .map((p) => p.id);
        const colFiltro = colegioFiltro === 'TODOS' ? 'TODOS' : padre.colegioNombre;
        await dataService.liquidarDeudaPadre(ident, colFiltro, idsPendientes);
        await cargarDatos();
      },
    });
  };

  const ejecutarAccionConfirmada = async () => {
    setEjecutandoAccion(true);
    try {
      await confirmacion.onConfirmar();
      setConfirmacion((prev) => ({ ...prev, abierto: false }));
    } catch (err) {
      console.error('Error procesando confirmación de fiado:', err);
    } finally {
      setEjecutandoAccion(false);
    }
  };


  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando permisos...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el control administrativo de cuentas por cobrar y fiados de Placeres Culinarios." />
    );
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return (
      <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Control de Fiados
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  Pagar luego
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Cuentas por cobrar y cobranza
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            type="button"
            onClick={() => setMostrarReporteGlobal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl shadow-xs transition cursor-pointer"
            title="Ver e imprimir el reporte general de todas las familias y fiados"
          >
            <FileText className="w-4 h-4" />
            <span>Reporte Global</span>
          </button>
          <button
            type="button"
            onClick={exportarReporteGlobalExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition cursor-pointer"
            title="Descargar listado global de fiados en Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <Link
            href="/despacho"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition"
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Ir a Despacho</span>
          </Link>
          <Link
            href="/cocina"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition"
          >
            <Utensils className="w-4 h-4 text-orange-500" />
            <span>Ir a Cocina</span>
          </Link>
        </div>
      </div>

      {/* Selector de Colegio Asignado o Filtro Global */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 space-y-3">
        {/* Selector de Colegio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Colegio:
            </span>
          </div>

          {!esSuperAdmin && usuario?.colegioNombre ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-800">
              <span className="text-slate-900 font-black">{usuario.colegioNombre}</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setColegioFiltro('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  colegioFiltro === 'TODOS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos los Colegios
              </button>
              {colegios.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColegioFiltro(col)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    colegioFiltro === col
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selector de Fecha de Consumo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs sm:text-sm font-black text-slate-800 capitalize">
              {fechaFiltro === 'TODAS'
                ? 'Todas las Fechas'
                : formatearFechaLegiblePeru(fechaFiltro)}
            </span>
            {fechaFiltro === fechaHoy && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                Hoy
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Navegación Día Anterior */}
            <button
              type="button"
              onClick={() => cambiarDia(-1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Input nativo de Calendario */}
            <input
              type="date"
              value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value || fechaHoy)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer shadow-2xs"
              title="Seleccionar fecha en el calendario"
            />

            {/* Navegación Día Siguiente */}
            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Botón rápido HOY */}
            <button
              type="button"
              onClick={() => setFechaFiltro(fechaHoy)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                fechaFiltro === fechaHoy
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>Hoy</span>
              {totalFiadosHoy > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    fechaFiltro === fechaHoy
                      ? 'bg-white text-orange-600'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {totalFiadosHoy}
                </span>
              )}
            </button>

            {/* Botón Ver Todas las Fechas */}
            <button
              type="button"
              onClick={() => setFechaFiltro('TODAS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                fechaFiltro === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Todas las Fechas
            </button>
          </div>
        </div>

        {/* Buscador y Filtro de Estado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-0.5">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por padre, alumno, teléfono o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFiltroEstado('PENDIENTES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'PENDIENTES'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('SALDADOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'SALDADOS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Saldados
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'TODOS'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS (KPIS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Total por Cobrar
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            S/ {totalDeudaGlobal.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Familias Deudoras
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {totalFamiliasConDeuda} <span className="text-xs text-slate-400 font-normal">familias</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Almuerzos Fiados
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-600">
            {totalAlmuerzosFiados} <span className="text-xs text-slate-400 font-normal">platos</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Ya Entregados
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {totalEntregadosSinCobrar} <span className="text-xs text-slate-400 font-normal">entregados</span>
          </div>
        </div>
      </div>

      {/* LISTADO DE PADRES Y ALMUERZOS FIADOS */}
      {cargando ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Cargando estado de fiados...</p>
        </div>
      ) : fiadosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {filtroEstado === 'PENDIENTES'
              ? '¡No hay deudas de fiado pendientes!'
              : 'No se encontraron registros de fiado con los filtros seleccionados.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filtroEstado === 'PENDIENTES'
              ? 'Todos los pedidos con método "Pagar luego" se encuentran al día o no hay órdenes registradas bajo esta modalidad.'
              : 'Prueba cambiando los filtros de colegio o el término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fiadosPaginados.map((padre, idx) => {
            const claveCard = padre.padreId || padre.telefono || `card-${idx}`;
            const expandido = Boolean(tarjetasExpandidas[claveCard]);
            const tieneDeuda = padre.totalDeuda > 0;
            const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

            return (
              <div
                key={claveCard}
                className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                  tieneDeuda ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Cabecera de la Familia / Padre */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {padre.nombrePadre}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {padre.colegioNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {padre.telefono && (
                        <div className="flex items-center gap-1 font-medium text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{padre.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                        <span>Hijos: {padre.hijosNombres.join(', ')}</span>
                      </div>
                      <div className="text-slate-400">
                        • {padre.pedidos.length} {padre.pedidos.length === 1 ? 'almuerzo' : 'almuerzos'}
                      </div>
                    </div>

                    {/* Resumen de Fechas de Consumo */}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {padre.tieneConsumoHoy && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Consumo de HOY ({fechaHoy})
                        </span>
                      )}
                      {padre.fechasUnicas && padre.fechasUnicas.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {padre.fechasUnicas.slice(0, 4).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setFechaFiltro(f)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                f === fechaHoy
                                  ? 'bg-amber-200 text-amber-950 font-black border border-amber-300 hover:bg-amber-300'
                                  : fechaFiltro === f
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title={`Filtrar listado por fecha ${f}`}
                            >
                              {f === fechaHoy ? `Hoy (${f})` : f}
                            </button>
                          ))}
                          {padre.fechasUnicas.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{padre.fechasUnicas.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de Deuda y Botones de Acción */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-xl sm:text-2xl font-black block leading-none ${
                          tieneDeuda ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        S/ {padre.totalDeuda.toFixed(2)}
                      </span>
                      {fechaFiltro !== 'TODAS' && padre.totalDeudaHistorica > padre.totalDeuda && (
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                          Total acumulado: S/ {padre.totalDeudaHistorica.toFixed(2)}
                        </span>
                      )}
                      {tieneDeuda ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 inline-block">
                          {pedidosPendientes.length} pendientes
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1 inline-block">
                          ✓ Al día
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Botón WhatsApp */}
                      {padre.telefono && tieneDeuda && (
                        <button
                          type="button"
                          onClick={() => enviarCobroWhatsApp(padre)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Enviar estado de cuenta y recordatorio por WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      {/* Botón Ver Reporte Detallado */}
                      <button
                        type="button"
                        onClick={() => setPadreReporteModal(padre)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        title="Ver e imprimir reporte detallado por fecha de cada hijo"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Reporte</span>
                      </button>

                      {/* Botón Liquidar Deuda Total */}
                      {tieneDeuda && (
                        <button
                          type="button"
                          onClick={() => handleSolicitarLiquidarTotal(padre)}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Marcar todos los pedidos como pagados"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Liquidar</span>
                        </button>
                      )}

                      {/* Botón Desplegar / Contraer */}
                      <button
                        type="button"
                        onClick={() => toggleExpandir(claveCard)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                        title={expandido ? 'Ocultar detalles' : 'Ver detalle de almuerzos'}
                      >
                        {expandido ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desglose Expandido de Almuerzos */}
                {expandido && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-orange-500" />
                        Desglose de Almuerzos (&quot;Pagar luego&quot;)
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        {padre.pedidos.length} órdenes en total
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Estudiante</th>
                            <th className="py-2.5 px-3">Sopa o postre</th>
                            <th className="py-2.5 px-3">Segundo</th>
                            <th className="py-2.5 px-3 text-center">Entrega</th>
                            <th className="py-2.5 px-3 text-right">Monto</th>
                            <th className="py-2.5 px-3 text-center">Estado Pago</th>
                            <th className="py-2.5 px-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {padre.pedidos.map((ped) => {
                            const pagado = ped.estadoPago === 'PAGADO';
                            const entregado = ped.estadoPedido === 'ENTREGADO';
                            return (
                              <tr key={ped.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {ped.fecha === fechaHoy ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                                        HOY
                                      </span>
                                      <span className="font-bold text-slate-900">{ped.fecha}</span>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-slate-800">{ped.fecha}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                  {ped.estudianteNombre}
                                  <span className="block text-[10px] font-normal text-slate-500">
                                    {ped.gradoSeccion}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {ped.entradaNombre || '-'}
                                </td>
                                <td className="py-2.5 px-3 font-medium text-slate-800">
                                  {ped.segundoNombre}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {entregado ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ✓ Entregado {ped.horaEntrega ? `(${ped.horaEntrega})` : ''}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      ⏳ Pendiente
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                  S/ {(ped.monto || 12).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {pagado ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                      PAGADO
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                                      POR COBRAR
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  {!pagado ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarPagoIndividual(ped)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-2xs cursor-pointer"
                                    >
                                      Marcar Pagado
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-bold">
                                      ✓ Cancelado
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Barra de Paginación */}
          {totalFamilias > 0 && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 mt-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-500">
                  Mostrando <strong className="text-slate-800">{indiceInicio + 1}</strong> -{' '}
                  <strong className="text-slate-800">{indiceFin}</strong> de{' '}
                  <strong className="text-slate-900">{totalFamilias}</strong> familias
                </span>

                <label className="flex items-center gap-1.5 text-slate-500">
                  <span>Por pág:</span>
                  <select
                    value={porPagina}
                    onChange={(e) => setPorPagina(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                  </select>
                </label>
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaValida === 1}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                    title="Primera página"
                  >
                    «
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaValida === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter((p) => {
                        return p === 1 || p === totalPaginas || Math.abs(p - paginaValida) <= 1;
                      })
                      .map((p, i, arr) => {
                        const prev = arr[i - 1];
                        const mostrarPuntos = prev && p - prev > 1;
                        return (
                          <React.Fragment key={p}>
                            {mostrarPuntos && <span className="px-1 text-slate-400 font-bold">...</span>}
                            <button
                              type="button"
                              onClick={() => setPaginaActual(p)}
                              className={`w-7 h-7 rounded-xl text-xs font-bold transition cursor-pointer ${
                                paginaValida === p
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaValida === totalPaginas}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaValida === totalPaginas}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold cursor-pointer"
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE REPORTE GLOBAL DE FIADOS */}
      {mostrarReporteGlobal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Cabecera del Reporte Global */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                  Reporte General de Cobranza • Placeres Culinarios
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Reporte Global de Fiados (Pagar luego)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {colegioFiltro === 'TODOS' ? 'Todos los Colegios' : colegioFiltro} • Fecha: {fechaFiltro === 'TODAS' ? 'Todas las Fechas (Histórico Completo)' : formatearFechaLegiblePeru(fechaFiltro)} • Emisión: {formatearFechaEmisionPeru()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarReporteGlobal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Métricas Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Deuda Total</span>
                <span className="text-xl font-black text-amber-700">S/ {totalDeudaGlobal.toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Familias Deudoras</span>
                <span className="text-xl font-black text-slate-900">{totalFamiliasConDeuda}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Almuerzos Fiados</span>
                <span className="text-xl font-black text-slate-900">{totalAlmuerzosFiados}</span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Entregados sin Cobrar</span>
                <span className="text-xl font-black text-emerald-700">{totalEntregadosSinCobrar}</span>
              </div>
            </div>

            {/* Tabla Global */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 text-center">N°</th>
                    <th className="py-2.5 px-3">Padre de Familia</th>
                    <th className="py-2.5 px-3">Fechas</th>
                    <th className="py-2.5 px-3">Hijos</th>
                    <th className="py-2.5 px-3">Institución</th>
                    <th className="py-2.5 px-3 text-center">Almuerzos</th>
                    <th className="py-2.5 px-3 text-right">Deuda</th>
                    <th className="py-2.5 px-3 text-center print:hidden">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fiadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No hay registros de fiados en esta selección.
                      </td>
                    </tr>
                  ) : (
                    fiadosFiltrados.map((p, idx) => (
                      <tr key={p.padreId || p.telefono || idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {p.nombrePadre}
                          {p.telefono && <span className="block text-[10px] text-slate-400 font-normal">Tel: {p.telefono}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {p.fechasUnicas.map((f) => (
                              <span
                                key={f}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  f === fechaHoy
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {f === fechaHoy ? 'Hoy' : f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {p.hijosNombres.join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {p.colegioNombre}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{p.pedidos.filter(ped => ped.estadoPago !== 'PAGADO').length} pend</span>
                          <span className="text-[10px] text-slate-400 block">de {p.totalPedidos} total</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-700 whitespace-nowrap">
                          S/ {p.totalDeuda.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center print:hidden whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setMostrarReporteGlobal(false);
                              setPadreReporteModal(p);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50 font-black border-t border-amber-200 text-xs">
                    <td colSpan={6} className="py-3 px-3 text-right text-amber-900 uppercase">
                      Total Global Adeudado:
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-amber-700">
                      S/ {totalDeudaGlobal.toFixed(2)}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Acciones */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir Reporte</span>
                </button>
                <button
                  type="button"
                  onClick={exportarReporteGlobalExcel}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMostrarReporteGlobal(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTE DETALLADO / ESTADO DE CUENTA FAMILIAR */}
      {padreReporteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Cabecera del Reporte */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 print:border-b-2">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                  Estado de Cuenta • Pagar luego
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Reporte de Consumos Escolares
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {padreReporteModal.colegioNombre} • Emisión: {formatearFechaEmisionPeru()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPadreReporteModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Padre de Familia y Estudiantes */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Padre de Familia:
                </span>
                <span className="font-black text-slate-900 text-sm block">
                  {padreReporteModal.nombrePadre}
                </span>
                {padreReporteModal.telefono && (
                  <span className="text-slate-600 block mt-0.5 font-medium">
                    Teléfono: {padreReporteModal.telefono}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Estudiantes Vinculados:
                </span>
                <span className="font-bold text-slate-800 block">
                  {padreReporteModal.hijosNombres.join(', ')}
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Institución: {padreReporteModal.colegioNombre}
                </span>
              </div>
            </div>

            {/* Desglose Cronológico Agrupado por Hijo */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Detalle Cronológico por Estudiante:
              </h4>

              {(() => {
                const porHijo: Record<string, ItemFiadoPedido[]> = {};
                padreReporteModal.pedidos.forEach((ped) => {
                  if (!porHijo[ped.estudianteNombre]) porHijo[ped.estudianteNombre] = [];
                  porHijo[ped.estudianteNombre].push(ped);
                });

                return Object.entries(porHijo).map(([hijoNombre, pedidosHijo]) => {
                  const subtotalHijo = pedidosHijo
                    .filter((p) => p.estadoPago !== 'PAGADO')
                    .reduce((acc, p) => acc + (p.monto || 12), 0);
                  const grado = pedidosHijo[0]?.gradoSeccion;

                  return (
                    <div key={hijoNombre} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      <div className="bg-slate-100 px-3.5 py-2 flex items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                            👦
                          </span>
                          <div>
                            <span className="font-black text-slate-900 text-xs">{hijoNombre}</span>
                            {grado && <span className="text-[10px] text-slate-500 font-medium ml-2">({grado})</span>}
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-700">
                          Deuda hijo: S/ {subtotalHijo.toFixed(2)}
                        </span>
                      </div>

                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px]">
                            <th className="py-2 px-3">Fecha</th>
                            <th className="py-2 px-3">Platos (Sopa o postre + Segundo)</th>
                            <th className="py-2 px-3 text-center">Entrega</th>
                            <th className="py-2 px-3 text-right">Monto</th>
                            <th className="py-2 px-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {pedidosHijo.map((ped) => (
                            <tr key={ped.id}>
                              <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                {ped.fecha === fechaHoy ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                    HOY ({ped.fecha})
                                  </span>
                                ) : (
                                  <span>{ped.fecha}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                {ped.entradaNombre ? `${ped.entradaNombre} + ` : ''}
                                {ped.segundoNombre}
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                {ped.estadoPedido === 'ENTREGADO' ? (
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    ✓ Entregado {ped.horaEntrega ? `(${ped.horaEntrega})` : ''}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-500">
                                    Pendiente
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                S/ {(ped.monto || 12).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                {ped.estadoPago === 'PAGADO' ? (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                    PAGADO
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                                    PENDIENTE
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                });
              })()}

              {/* Totalizador de la familia */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 uppercase">Total Adeudado Familiar:</span>
                <span className="text-lg font-black text-amber-700">S/ {padreReporteModal.totalDeuda.toFixed(2)}</span>
              </div>
            </div>

            {/* Acciones del Reporte */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Imprimir Reporte</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {padreReporteModal.telefono && padreReporteModal.totalDeuda > 0 && (
                  <button
                    type="button"
                    onClick={() => enviarCobroWhatsApp(padreReporteModal)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar a WhatsApp</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPadreReporteModal(null)}
                  className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ACCIONES */}
      <ModalConfirmacion
        abierto={confirmacion.abierto}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        textoBotonConfirmar="Sí, registrar pago"
        tipo="advertencia"
        cargando={ejecutandoAccion}
        onConfirmar={ejecutarAccionConfirmada}
        onCerrar={() => setConfirmacion((prev) => ({ ...prev, abierto: false }))}
      />
    </div>
  );
}
