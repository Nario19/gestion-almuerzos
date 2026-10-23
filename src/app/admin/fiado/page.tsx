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
import { dataService, CONFIG_PAGOS_DEFAULT } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearFechaEmisionPeru,
  calcularOffsetFechaPeru,
  formatearHoraPeru,
} from '@/lib/dateUtils';
import { PadreFiadoResumen, ItemFiadoPedido, ConfiguracionPagos } from '@/types';
import { descargarComprobanteFiadoPdf } from '@/lib/pdfComprobanteGenerator';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';

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
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);
  const [busqueda, setBusqueda] = useState('');

  // Sincronizar automáticamente colegioFiltro cuando el perfil de usuario cargue
  useEffect(() => {
    if (!esSuperAdmin && usuario?.colegioNombre) {
      setColegioFiltro(usuario.colegioNombre);
    }
  }, [esSuperAdmin, usuario?.colegioNombre]);

  const nombreColegioActivo = !esSuperAdmin
    ? (usuario?.colegioNombre || (colegioFiltro !== 'TODOS' ? colegioFiltro : (colegios.length === 1 ? colegios[0] : '')))
    : (colegioFiltro === 'TODOS' ? 'Todos los Colegios' : colegioFiltro);

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
  const [configPagos, setConfigPagos] = useState<ConfiguracionPagos>(CONFIG_PAGOS_DEFAULT);

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
      const [resFiados, resColegios, resConfigPagos] = await Promise.all([
        dataService.obtenerFiados(col),
        dataService.obtenerColegios(),
        dataService.obtenerConfiguracionPagos(),
      ]);
      setFiados(resFiados);
      if (resColegios) setColegios(resColegios);
      if (resConfigPagos) setConfigPagos(resConfigPagos);
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
    dataService.obtenerConfiguracionPagos().then((resConfigPagos) => {
      if (!cancelado && resConfigPagos) setConfigPagos(resConfigPagos);
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
        const pedidosHoy = padre.pedidos.filter((p) => p.fecha === fechaHoy);
        const tieneConsumoHoy = pedidosHoy.length > 0;
        const horaConsumoHoy = pedidosHoy.length > 0 ? formatearHoraPeru(pedidosHoy[pedidosHoy.length - 1].createdAt) : '';

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
          horaConsumoHoy,
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

  // Generar y descargar comprobante digital detallado en PDF del apoderado
  const descargarComprobantePadre = (padre: PadreFiadoResumen, config: ConfiguracionPagos) => {
    return descargarComprobanteFiadoPdf(padre, config);
  };

  // Generar y enviar mensaje de cobro o estado de cuenta por WhatsApp al número registrado
  const enviarCobroWhatsApp = async (padre: PadreFiadoResumen) => {
    if (!padre.telefono) {
      alert('Este apoderado no tiene un número de teléfono celular registrado para WhatsApp.');
      return;
    }
    const telefonoLimpio = padre.telefono.replace(/\D/g, '');
    if (!telefonoLimpio) {
      alert('El teléfono registrado no tiene un formato válido para WhatsApp.');
      return;
    }
    const telefonoFinal = telefonoLimpio.startsWith('51')
      ? telefonoLimpio
      : `51${telefonoLimpio}`;

    // Obtener la configuración vigente de pagos de Superadmin
    let config = configPagos;
    try {
      config = await dataService.obtenerConfiguracionPagos();
      setConfigPagos(config);
    } catch (_) {}

    // Descargar copia oficial del comprobante en PDF detallado para adjuntarlo al envío
    try {
      descargarComprobantePadre(padre, config);
    } catch (e) {
      console.error('Error generando comprobante PDF descargable:', e);
    }

    const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

    // Desglose agrupado por cada hijo (pedidos pendientes o todos los del reporte si está al día)
    const porHijo: Record<string, ItemFiadoPedido[]> = {};
    const pedidosAMostrar = pedidosPendientes.length > 0 ? pedidosPendientes : padre.pedidos;
    pedidosAMostrar.forEach((p) => {
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
              p.estadoPedido === 'ENTREGADO' ? 'Entregado' : 'Pendiente';
            const pagoTag = p.estadoPago === 'PAGADO' ? ' [PAGADO]' : '';
            return `    - ${p.fecha}: ${p.entradaNombre ? `${p.entradaNombre} + ` : ''}${p.segundoNombre}${p.ensaladaNombre && p.ensaladaNombre !== 'Sin ensalada' ? ` + ${p.ensaladaNombre}` : ''} [S/ ${(p.monto || 12).toFixed(2)}] (${entregaTag})${pagoTag}`;
          })
          .join('\n');
        return `- *${hijo}*${grado} - Subtotal: S/ ${subtotal.toFixed(2)}:\n${filas}`;
      })
      .join('\n\n');

    let mensaje = '';
    if (pedidosPendientes.length > 0) {
      mensaje =
        `Hola *${padre.nombrePadre}*, le saludamos de *Placeres Culinarios* (${padre.colegioNombre}).\n\n` +
        `Le informamos que *la deuda que tiene es de S/ ${padre.totalDeuda.toFixed(2)}* por concepto de almuerzos escolares bajo la modalidad *"Pagar luego / Fiado"*.\n\n` +
        `*Adjunto el comprobante y detalle de consumos en PDF:*\n\n` +
        `${bloquesHijos}\n\n` +
        `*Total pendiente de pago: S/ ${padre.totalDeuda.toFixed(2)}*\n\n` +
        `*Medios de pago establecidos:*\n` +
        `• *Yape:* ${config.numeroYape} (${config.titularYape})\n` +
        `• *Plin:* ${config.numeroPlin} (${config.titularPlin})\n` +
        `• O puede cancelar directamente en el módulo de atención escolar.\n\n` +
        `Agradecemos enviar su comprobante por este medio para registrar su abono. ¡Muchas gracias!`;
    } else {
      mensaje =
        `Hola *${padre.nombrePadre}*, le saludamos de *Placeres Culinarios* (${padre.colegioNombre}).\n\n` +
        `Le informamos que la deuda que tiene es de S/ 0.00.\n\n` +
        `*Adjunto el comprobante y detalle de consumos en PDF:*\n\n` +
        `${bloquesHijos}\n\n` +
        `*Su cuenta familiar se encuentra AL DIA (S/ 0.00 pendientes).*\n\n` +
        `¡Muchas gracias por su puntualidad y preferencia!`;
    }

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
              {pedido.ensaladaNombre && pedido.ensaladaNombre !== 'Sin ensalada' ? ` + ${pedido.ensaladaNombre}` : ''}
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
    return <SkeletonDashboardPage />;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Barra de Acciones y Reportes de Fiados */}
      <PageHeader
        title="Gestión de Fiados y Cobranzas"
        description="Control de saldos por cobrar, consumos bajo modalidad 'Pagar luego', emisión de comprobantes y cobranza por WhatsApp."
        actions={
          <div className="flex items-center gap-2">
            {!esSuperAdmin && (usuario?.colegioNombre || nombreColegioActivo) && (
              <span className="hidden">
                🏫 Colegio: {usuario?.colegioNombre || nombreColegioActivo}
              </span>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setMostrarReporteGlobal(true)}
              className="gap-1.5 h-8 text-xs font-semibold"
              title="Ver e imprimir el reporte general de todas las familias y fiados"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reporte Global</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportarReporteGlobalExcel}
              className="gap-1.5 h-8 text-xs font-semibold"
              title="Descargar listado global de fiados en Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
              <span>Excel</span>
            </Button>
          </div>
        }
      />

      {/* Selector de Colegio Asignado y Filtros Unificados */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Selector de Colegio */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Colegio:
              </span>
              {nombreColegioActivo ? (
                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold bg-zinc-50 border-zinc-200 text-zinc-900 shadow-2xs">
                  {nombreColegioActivo}
                </Badge>
              ) : null}
            </div>

            {esSuperAdmin && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant={colegioFiltro === 'TODOS' ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setColegioFiltro('TODOS')}
                >
                  Todos los Colegios
                </Button>
                {colegios.map((col) => (
                  <Button
                    key={col}
                    type="button"
                    variant={colegioFiltro === col ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setColegioFiltro(col)}
                  >
                    {col}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Selector de Fecha de Consumo */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-700" />
              <span className="text-xs sm:text-sm font-bold text-zinc-950 capitalize">
                {fechaFiltro === 'TODAS'
                  ? 'Todas las Fechas'
                  : formatearFechaLegiblePeru(fechaFiltro)}
              </span>
              {fechaFiltro === fechaHoy && (
                <Badge variant="success" className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold">
                  Hoy
                </Badge>
              )}
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
                onChange={(e) => setFechaFiltro(e.target.value || fechaHoy)}
                className="h-8 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-md px-2.5 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden cursor-pointer shadow-2xs"
                title="Seleccionar fecha en el calendario"
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
                className="h-8 px-3 text-xs gap-1.5"
                onClick={() => setFechaFiltro(fechaHoy)}
              >
                <span>Hoy</span>
                {totalFiadosHoy > 0 && (
                  <Badge
                    variant={fechaFiltro === fechaHoy ? "secondary" : "default"}
                    className="text-[10px] py-0 px-1 font-bold"
                  >
                    {totalFiadosHoy}
                  </Badge>
                )}
              </Button>

              {/* Botón Ver Todas las Fechas */}
              <Button
                type="button"
                variant={fechaFiltro === 'TODAS' ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setFechaFiltro('TODAS')}
              >
                Todas las Fechas
              </Button>
            </div>
          </div>

          {/* Buscador y Filtro de Estado */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-0.5">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por padre, alumno, teléfono o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden transition"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
              <Button
                type="button"
                variant={filtroEstado === 'PENDIENTES' ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setFiltroEstado('PENDIENTES')}
              >
                Pendientes
              </Button>
              <Button
                type="button"
                variant={filtroEstado === 'SALDADOS' ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setFiltroEstado('SALDADOS')}
              >
                Saldados
              </Button>
              <Button
                type="button"
                variant={filtroEstado === 'TODOS' ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setFiltroEstado('TODOS')}
              >
                Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TARJETAS DE MÉTRICAS (KPIS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total por Cobrar"
          value={`S/ ${totalDeudaGlobal.toFixed(2)}`}
          subtext="Saldo pendiente global"
          icon={DollarSign}
          variant={totalDeudaGlobal > 0 ? "warning" : "default"}
        />

        <StatCard
          label="Familias Deudoras"
          value={totalFamiliasConDeuda}
          subtext="Familias con saldo pendiente"
          icon={Users}
          variant="default"
        />

        <StatCard
          label="Almuerzos Fiados"
          value={totalAlmuerzosFiados}
          subtext="Platos consumidos"
          icon={Utensils}
          variant="default"
        />

        <StatCard
          label="Ya Entregados"
          value={totalEntregadosSinCobrar}
          subtext="Almuerzos entregados"
          icon={PackageCheck}
          variant={totalEntregadosSinCobrar > 0 ? "success" : "default"}
        />
      </div>

      {/* LISTADO DE PADRES Y ALMUERZOS FIADOS */}
      {cargando ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Cargando estado de fiados...</p>
        </div>
      ) : fiadosFiltrados.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <EmptyState
            icon={CheckCircle2}
            title={
              filtroEstado === 'PENDIENTES'
                ? '¡No hay deudas de fiado pendientes!'
                : 'No se encontraron registros de fiado con los filtros seleccionados.'
            }
            description={
              filtroEstado === 'PENDIENTES'
                ? 'Todos los pedidos con método "Pagar luego" se encuentran al día o no hay órdenes registradas bajo esta modalidad.'
                : 'Prueba cambiando los filtros de colegio o el término de búsqueda.'
            }
            className="border-none p-0"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {fiadosPaginados.map((padre, idx) => {
            const claveCard = padre.padreId || padre.telefono || `card-${idx}`;
            const expandido = Boolean(tarjetasExpandidas[claveCard]);
            const tieneDeuda = padre.totalDeuda > 0;
            const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

            return (
              <Card
                key={claveCard}
                className={`transition shadow-2xs overflow-hidden ${
                  tieneDeuda ? 'border-amber-200/90' : 'border-zinc-200/90'
                }`}
              >
                {/* Cabecera de la Familia / Padre */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-zinc-950 truncate">
                        {padre.nombrePadre}
                      </h2>
                      {(padre.colegioNombre || nombreColegioActivo) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-200">
                          <Building2 className="w-3 h-3 text-orange-600" />
                          Colegio: {padre.colegioNombre || nombreColegioActivo}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                      {padre.telefono && (
                        <div className="flex items-center gap-1 font-medium text-zinc-600">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{padre.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 font-medium text-zinc-700">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Hijos: {padre.hijosNombres.join(', ')}</span>
                      </div>
                      <div className="text-zinc-400">
                        • {padre.pedidos.length} {padre.pedidos.length === 1 ? 'almuerzo' : 'almuerzos'}
                      </div>
                    </div>

                    {/* Resumen de Fechas de Consumo */}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {padre.tieneConsumoHoy && (
                        <Badge variant="warning" className="gap-1 text-[10px] font-bold py-0 px-2 uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Consumo de HOY ({padre.horaConsumoHoy || fechaHoy})
                        </Badge>
                      )}
                      {padre.fechasUnicas && padre.fechasUnicas.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[11px] text-zinc-400 font-medium">Fechas:</span>
                          {padre.fechasUnicas.slice(0, 4).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setFechaFiltro(f)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                                f === fechaHoy
                                  ? 'bg-amber-100 text-amber-950 font-bold border-amber-300 hover:bg-amber-200'
                                  : fechaFiltro === f
                                  ? 'bg-zinc-950 text-white border-zinc-950'
                                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                              title={`Filtrar listado por fecha ${f}`}
                            >
                              {f === fechaHoy ? (padre.horaConsumoHoy || 'Hoy') : f}
                            </button>
                          ))}
                          {padre.fechasUnicas.length > 4 && (
                            <span className="text-[10px] text-zinc-400 font-semibold">
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
                        className={`text-xl sm:text-2xl font-bold block leading-none tracking-tight ${
                          tieneDeuda ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        S/ {padre.totalDeuda.toFixed(2)}
                      </span>
                      {fechaFiltro !== 'TODAS' && padre.totalDeudaHistorica > padre.totalDeuda && (
                        <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                          Total acumulado: S/ {padre.totalDeudaHistorica.toFixed(2)}
                        </span>
                      )}
                      {tieneDeuda ? (
                        <Badge variant="warning" className="text-[10px] font-semibold mt-1">
                          {pedidosPendientes.length} pendientes
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] font-semibold mt-1">
                          ✓ Al día
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Botón Ver Reporte Detallado */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPadreReporteModal(padre)}
                        className="h-8 text-xs font-semibold gap-1.5"
                        title="Ver e imprimir reporte detallado por fecha de cada hijo"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="hidden sm:inline">Reporte</span>
                      </Button>

                      {/* Botón Liquidar Deuda Total */}
                      {tieneDeuda && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleSolicitarLiquidarTotal(padre)}
                          className="h-8 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                          title="Marcar todos los pedidos como pagados"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Liquidar</span>
                        </Button>
                      )}

                      {/* Botón Desplegar / Contraer */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleExpandir(claveCard)}
                        className="h-8 w-8"
                        title={expandido ? 'Ocultar detalles' : 'Ver detalle de almuerzos'}
                      >
                        {expandido ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
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
                                      <span className="font-bold text-slate-900">
                                        {ped.createdAt ? formatearHoraPeru(ped.createdAt) : ped.fecha}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-800">{ped.fecha}</span>
                                      {ped.createdAt && (
                                        <span className="text-[10px] text-slate-400 font-normal">
                                          {formatearHoraPeru(ped.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                                    {ped.colegioNombre || padre.colegioNombre || nombreColegioActivo}
                                  </span>
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
              </Card>
            );
          })}

          {/* Barra de Paginación */}
          {totalFamilias > 0 && (
            <Card className="p-3 sm:p-4 mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-zinc-500">
                    Mostrando <strong className="text-zinc-900">{indiceInicio + 1}</strong> -{' '}
                    <strong className="text-zinc-900">{indiceFin}</strong> de{' '}
                    <strong className="text-zinc-950 font-bold">{totalFamilias}</strong> familias
                  </span>

                  <label className="flex items-center gap-1.5 text-zinc-500 font-medium">
                    <span>Por pág:</span>
                    <select
                      value={porPagina}
                      onChange={(e) => setPorPagina(Number(e.target.value))}
                      className="h-7 bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium rounded-md px-2 py-0.5 text-xs focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 cursor-pointer"
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
                              {mostrarPuntos && <span className="px-1 text-zinc-400 font-bold">...</span>}
                              <Button
                                type="button"
                                variant={paginaValida === p ? "default" : "outline"}
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
                            <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
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
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Imprimir este comprobante de consumos"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => descargarComprobanteFiadoPdf(padreReporteModal, configPagos)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Descargar comprobante detallado en PDF auténtico"
                >
                  <FileText className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => enviarCobroWhatsApp(padreReporteModal)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  title={
                    padreReporteModal.telefono
                      ? `Enviar reporte a WhatsApp (${padreReporteModal.telefono}) y descargar comprobante PDF`
                      : 'Sin teléfono registrado'
                  }
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar a WhatsApp</span>
                </button>
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
