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
  ExternalLink,
} from 'lucide-react';
import { dataService, COLEGIOS_DEFAULT } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';

export default function DespachoPage() {
  const { esAdmin, cargando: cargandoAuth } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [colegioFiltro, setColegioFiltro] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);

  const cargarDatos = async () => {
    const data = await dataService.obtenerPedidos();
    setPedidos(data);
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

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const matchColegio = colegioFiltro === 'TODOS' || p.colegioNombre === colegioFiltro;
    const matchBusqueda =
      p.estudianteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.gradoSeccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoPedido.toLowerCase().includes(busqueda.toLowerCase());
    return matchColegio && matchBusqueda;
  });

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

  // Agrupar por Colegio y luego por Grado/Sección
  const grupos = pedidosFiltrados.reduce((acc, pedido) => {
    const key = `${pedido.colegioNombre} - ${pedido.gradoSeccion}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pedido);
    return acc;
  }, {} as Record<string, Pedido[]>);

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-emerald-600" />
            Despacho y Empaque
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={imprimir}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir Lista
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por estudiante, grado o código (#ALM)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
            />
          </div>

          {/* Filtro de Colegio */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-bold px-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Colegio:
            </span>
            {['TODOS', ...COLEGIOS_DEFAULT].map((c) => (
              <button
                key={c}
                onClick={() => setColegioFiltro(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
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
      </div>

      {/* Lista Agrupada por Colegio y Grado */}
      {Object.keys(grupos).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No se encontraron pedidos con estos filtros</p>
          <p className="text-xs text-slate-400 mt-1">Verifica los criterios de búsqueda o el colegio seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([grupoTitulo, listaPedidos]) => (
            <div
              key={grupoTitulo}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Cabecera del grupo (Colegio y Sección) */}
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">{grupoTitulo}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-xl">
                  {listaPedidos.length} alumnos
                </span>
              </div>

              {/* Tabla de Alumnos */}
              <div className="divide-y divide-slate-100">
                {listaPedidos.map((p) => {
                  const empacado = p.estadoPedido === 'EMPACADO' || p.estadoPedido === 'ENTREGADO';
                  const pagado = p.estadoPago === 'PAGADO';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                        empacado ? 'bg-slate-50/70 opacity-80' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Información del Alumno y Menú */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{p.codigoPedido}
                          </span>
                          <span className="text-sm sm:text-base font-black text-slate-900">
                            {p.estudianteNombre}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {p.gradoSeccion}
                          </span>
                        </div>

                        {/* Platos seleccionados */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-medium">
                          <span className="px-2.5 py-1 bg-orange-50 text-orange-800 rounded-lg border border-orange-200/60 font-semibold">
                            🍲 {p.entradaNombre}
                          </span>
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200/60 font-semibold">
                            🍛 {p.segundoNombre}
                          </span>
                        </div>

                        {/* Observación destacada */}
                        {p.observacion && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Obs: {p.observacion}
                          </div>
                        )}
                      </div>

                      {/* Estado de Pago y Comprobante */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                        {/* Ver comprobante si subió foto */}
                        {p.comprobanteUrl && (
                          <button
                            type="button"
                            onClick={() => setComprobanteModal(p.comprobanteUrl || null)}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 flex items-center gap-1 transition print:hidden"
                          >
                            <FileImage className="w-3.5 h-3.5" />
                            Ver Voucher
                          </button>
                        )}

                        {/* Selector de Pago */}
                        <button
                          type="button"
                          onClick={() => handleCambiarPago(p.id, pagado ? 'PENDIENTE' : 'PAGADO')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition print:border ${
                            pagado
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {pagado ? 'Pagado (S/ 12)' : 'Por Pagar'}
                        </button>

                        {/* Botón de Marcar como Empacado */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCambiarEstado(p.id, empacado ? 'REGISTRADO' : 'EMPACADO')
                          }
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition print:hidden ${
                            empacado
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          {empacado ? 'Empacado ✓' : 'Marcar Empaque'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
