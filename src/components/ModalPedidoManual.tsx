'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UtensilsCrossed,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  FileText,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import {
  obtenerFechaHoyPeru,
  obtenerDiaActualSemanaPeru,
  formatearFechaLegiblePeru,
} from '@/lib/dateUtils';
import { Plato, MetodoPago, EstadoPago, DiaSemana, Pedido } from '@/types';

interface ModalPedidoManualProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function ModalPedidoManual({ abierto, onCerrar }: ModalPedidoManualProps) {
  const { usuario, esAdmin, esSuperAdmin } = useAuth();
  const fechaHoy = useMemo(() => obtenerFechaHoyPeru(), []);

  // Listas de datos
  const [colegios, setColegios] = useState<string[]>([]);
  const [grados, setGrados] = useState<string[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Formulario
  const [colegioSeleccionado, setColegioSeleccionado] = useState<string>('');
  const [fecha, setFecha] = useState<string>(fechaHoy);
  const [estudianteNombre, setEstudianteNombre] = useState('');
  const [gradoSeccion, setGradoSeccion] = useState('');
  const [gradoPersonalizado, setGradoPersonalizado] = useState(false);
  const [segundoNombre, setSegundoNombre] = useState('');
  const [platoPersonalizado, setPlatoPersonalizado] = useState(false);
  const [entradaNombre, setEntradaNombre] = useState('Sin entrada');
  const [ensaladaNombre, setEnsaladaNombre] = useState('Sin ensalada');
  const [observacion, setObservacion] = useState('');
  const [padreNombre, setPadreNombre] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [monto, setMonto] = useState<number>(12);

  // Estados de proceso
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);

  // Calcular el día escolar (LUNES a VIERNES) según la fecha
  const diaSemanaCalculado = useMemo<DiaSemana>(() => {
    try {
      const d = new Date(`${fecha}T12:00:00-05:00`);
      return obtenerDiaActualSemanaPeru(d);
    } catch (_) {
      return 'LUNES';
    }
  }, [fecha]);

  // Cargar lista de colegios al abrir el modal
  useEffect(() => {
    if (!abierto) return;
    let cancelado = false;

    // Si es SuperAdmin, carga todos los colegios
    if (esSuperAdmin) {
      dataService.obtenerColegios().then((cols) => {
        if (!cancelado && cols && cols.length > 0) {
          setColegios(cols);
          if (!colegioSeleccionado || !cols.includes(colegioSeleccionado)) {
            setColegioSeleccionado(cols[0]);
          }
        }
      });
    } else if (usuario?.colegioNombre) {
      // Si es Admin de sede, su colegio es fijo
      setColegioSeleccionado(usuario.colegioNombre);
      setColegios([usuario.colegioNombre]);
    }

    return () => {
      cancelado = true;
    };
  }, [abierto, esSuperAdmin, usuario?.colegioNombre]);

  // Cargar grados y platos cuando cambia el colegio o el día escolar
  useEffect(() => {
    if (!abierto || !colegioSeleccionado) return;
    let cancelado = false;
    setCargandoDatos(true);

    Promise.all([
      dataService.obtenerGrados(colegioSeleccionado),
      dataService.obtenerPlatosPorDia(diaSemanaCalculado, colegioSeleccionado),
    ])
      .then(([resGrados, resPlatos]) => {
        if (cancelado) return;
        setGrados(resGrados || []);
        if (resGrados && resGrados.length > 0 && !resGrados.includes(gradoSeccion)) {
          setGradoSeccion(resGrados[0]);
          setGradoPersonalizado(false);
        }

        setPlatos(resPlatos || []);
        const segundos = (resPlatos || []).filter(
          (p) => (p.tipo || '').toUpperCase() === 'SEGUNDO' || !(p.tipo || '').toUpperCase().includes('ENTRADA')
        );
        if (segundos.length > 0) {
          setSegundoNombre(segundos[0].nombre);
          setMonto(segundos[0].precio || 12);
          setPlatoPersonalizado(false);
        } else {
          setPlatoPersonalizado(true);
        }
      })
      .catch((e) => {
        console.error('Error cargando grados y platos del colegio:', e);
      })
      .finally(() => {
        if (!cancelado) setCargandoDatos(false);
      });

    return () => {
      cancelado = true;
    };
  }, [abierto, colegioSeleccionado, diaSemanaCalculado]);

  if (!abierto) return null;

  // Filtrar platos por tipo (Entrada, Segundo, Ensalada)
  const esPlatoEnsalada = (p: Plato) => {
    const t = (p.tipo || '').toLowerCase().trim();
    const n = (p.nombre || '').toLowerCase().trim();
    const d = (p.descripcion || '').toLowerCase().trim();
    return t === 'ensalada' || d.includes('[ensalada]') || n.includes('ensalada');
  };
  const esPlatoEntrada = (p: Plato) => {
    if (esPlatoEnsalada(p)) return false;
    const t = (p.tipo || '').toLowerCase().trim();
    return t.includes('entrada') || t.includes('sopa') || t.includes('postre') || t.includes('caldo') || t.includes('crema');
  };
  const platosEnsaladas = platos.filter(esPlatoEnsalada);
  const platosEntradas = platos.filter(esPlatoEntrada);
  const platosSegundos = platos.filter(
    (p) => !esPlatoEnsalada(p) && ((p.tipo || '').toUpperCase() === 'SEGUNDO' || !esPlatoEntrada(p))
  );

  const reiniciarFormulario = () => {
    setEstudianteNombre('');
    setObservacion('');
    setPadreNombre('');
    setTelefonoContacto('');
    setEntradaNombre('Sin entrada');
    setEnsaladaNombre('Sin ensalada');
    setPedidoCreado(null);
    setError(null);
    setMetodoPago('Efectivo');
  };

  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!estudianteNombre.trim()) {
      setError('Debes ingresar el nombre y apellido de la alumna o alumno.');
      return;
    }
    if (!colegioSeleccionado.trim()) {
      setError('Debes seleccionar un colegio válido.');
      return;
    }
    if (!gradoSeccion.trim()) {
      setError('Debes seleccionar o especificar el grado y sección escolar.');
      return;
    }
    if (!segundoNombre.trim()) {
      setError('Debes seleccionar o escribir el plato de almuerzo (segundo).');
      return;
    }

    setGuardando(true);
    try {
      // Determinar estado de pago según el método
      let estadoPagoFinal: EstadoPago = 'PAGADO';
      if (metodoPago === 'Pagar luego') {
        estadoPagoFinal = 'PENDIENTE';
      } else if (metodoPago === 'Efectivo') {
        estadoPagoFinal = 'PAGADO';
      } else {
        // Yape o Plin directo en ventanilla
        estadoPagoFinal = 'PAGADO';
      }

      const nuevo = await dataService.crearPedido({
        colegioNombre: colegioSeleccionado,
        gradoSeccion: gradoSeccion.trim(),
        estudianteNombre: estudianteNombre.trim().toUpperCase(),
        telefonoContacto: telefonoContacto.trim() || '999999999',
        entradaNombre: entradaNombre.trim() || 'Sin entrada',
        segundoNombre: segundoNombre.trim(),
        ensaladaNombre: ensaladaNombre.trim() || 'Sin ensalada',
        observacion: observacion.trim() || undefined,
        metodoPago: metodoPago,
        estadoPago: estadoPagoFinal,
        monto: Number(monto) || 12,
        fecha: fecha,
        diaSemana: diaSemanaCalculado,
        padreNombre: padreNombre.trim() || 'Atención en ventanilla / Tutor',
      });

      setPedidoCreado(nuevo);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    } catch (err: unknown) {
      console.error('Error creando pedido manual:', err);
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el pedido.';
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Ventanilla / Manual
                </span>
                {esSuperAdmin ? (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    Sede: {colegioSeleccionado}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Tomar Pedido Manual
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Para personas mayores, tutores o apoderados que piden presencialmente o por llamada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pantalla de Éxito cuando el pedido fue registrado */}
        {pedidoCreado ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ¡Pedido Registrado Exitosamente!
              </span>
              <h4 className="text-2xl font-black text-slate-900 pt-1">
                {pedidoCreado.codigoPedido}
              </h4>
              <p className="text-xs text-slate-600">
                Alumna/o: <strong>{pedidoCreado.estudianteNombre}</strong> ({pedidoCreado.gradoSeccion})
              </p>
              <p className="text-xs text-slate-500">
                Institución: <strong>{pedidoCreado.colegioNombre}</strong> • Fecha: <strong>{pedidoCreado.fecha}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Plato:</span>
                <span className="font-bold text-slate-900">{pedidoCreado.segundoNombre}</span>
              </div>
              {pedidoCreado.entradaNombre && pedidoCreado.entradaNombre !== 'Sin entrada' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrada/Postre:</span>
                  <span className="font-semibold text-slate-800">{pedidoCreado.entradaNombre}</span>
                </div>
              )}
              {pedidoCreado.ensaladaNombre && pedidoCreado.ensaladaNombre !== 'Sin ensalada' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ensalada:</span>
                  <span className="font-semibold text-slate-800">{pedidoCreado.ensaladaNombre}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Método de pago:</span>
                <span className="font-bold text-slate-900">{pedidoCreado.metodoPago}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Total:</span>
                <span className="font-black text-emerald-700 text-sm">S/ {pedidoCreado.monto.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={reiniciarFormulario}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Registrar Otro Pedido</span>
              </button>
              <button
                type="button"
                onClick={onCerrar}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar y Volver
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCrearPedido} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SELECCIÓN DE COLEGIO Y FECHA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              {/* Colegio: Selector para SuperAdmin, fijo para Admin */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Colegio / Sede Escolar:</span>
                </label>
                {esSuperAdmin ? (
                  <select
                    value={colegioSeleccionado}
                    onChange={(e) => setColegioSeleccionado(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                  >
                    {colegios.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{colegioSeleccionado || 'Sede asignada'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Sede actual</span>
                  </div>
                )}
              </div>

              {/* Fecha del Almuerzo */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Fecha del Almuerzo:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value || fechaHoy)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                  />
                  <span className="text-[10px] font-black uppercase px-2 py-2 rounded-xl bg-slate-200 text-slate-700 whitespace-nowrap">
                    {diaSemanaCalculado}
                  </span>
                </div>
              </div>
            </div>

            {/* DATOS DE LA ALUMNA / ALUMNO */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>Datos de la Alumna / Alumno</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombre de la Alumna / Alumno */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombres y Apellidos de la Alumna/o <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EJ: VALERIA RÍOS PÉREZ"
                    value={estudianteNombre}
                    onChange={(e) => setEstudianteNombre(e.target.value.toUpperCase())}
                    className="w-full uppercase bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                  />
                </div>

                {/* Grado y Sección */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Grado y Sección <span className="text-rose-500">*</span>:
                    </label>
                    <button
                      type="button"
                      onClick={() => setGradoPersonalizado(!gradoPersonalizado)}
                      className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      {gradoPersonalizado ? 'Elegir de lista' : 'Escribir manual'}
                    </button>
                  </div>

                  {gradoPersonalizado || grados.length === 0 ? (
                    <input
                      type="text"
                      required
                      placeholder="EJ: 3° PRIMARIA - B"
                      value={gradoSeccion}
                      onChange={(e) => setGradoSeccion(e.target.value.toUpperCase())}
                      className="w-full uppercase bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                    />
                  ) : (
                    <select
                      value={gradoSeccion}
                      onChange={(e) => setGradoSeccion(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                    >
                      {grados.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* SELECCIÓN DE ALMUERZO Y PLATO */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  <span>Almuerzo / Plato para {colegioSeleccionado} ({diaSemanaCalculado})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setPlatoPersonalizado(!platoPersonalizado)}
                  className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  {platoPersonalizado ? 'Seleccionar de carta' : 'Escribir plato manual'}
                </button>
              </div>

              {/* Selector de Segundo / Plato Principal */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Segundo / Plato Principal <span className="text-rose-500">*</span>:
                </label>

                {platoPersonalizado || platosSegundos.length === 0 ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="EJ: SECO DE POLLO CON ARROZ Y FREJOLES"
                      value={segundoNombre}
                      onChange={(e) => setSegundoNombre(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Escribe el nombre del plato si no se encuentra registrado en la carta escolar.
                    </span>
                  </div>
                ) : (
                  <select
                    value={segundoNombre}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setSegundoNombre(sel);
                      const platoEncontrado = platosSegundos.find((p) => p.nombre === sel);
                      if (platoEncontrado && platoEncontrado.precio) {
                        setMonto(platoEncontrado.precio);
                      }
                    }}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                  >
                    {platosSegundos.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre} — S/ {(p.precio || 12).toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selector de Entrada / Sopa / Postre (Opcional) */}
              {platosEntradas.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Entrada, Sopa o Fruta (Opcional):
                  </label>
                  <select
                    value={entradaNombre}
                    onChange={(e) => setEntradaNombre(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                  >
                    <option value="Sin entrada">Sin entrada / postre</option>
                    {platosEntradas.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre} ({p.tipo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selector de Ensalada (Opcional) */}
              {platosEnsaladas.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ensalada (Opcional):
                  </label>
                  <select
                    value={ensaladaNombre}
                    onChange={(e) => setEnsaladaNombre(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
                  >
                    <option value="Sin ensalada">Sin ensalada</option>
                    {platosEnsaladas.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observación o Alergias */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Observaciones, Alergias o Preferencias:
                </label>
                <input
                  type="text"
                  placeholder="EJ: Sin ensalada, alérgica al maní, poco picante..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* DATOS DEL TUTOR O APODERADO EN VENTANILLA (OPCIONAL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nombre del Apoderado / Tutor (Opcional):</span>
                </label>
                <input
                  type="text"
                  placeholder="EJ: Abuela María / Carlos Ríos"
                  value={padreNombre}
                  onChange={(e) => setPadreNombre(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teléfono WhatsApp (Opcional):</span>
                </label>
                <input
                  type="tel"
                  placeholder="EJ: 987654321"
                  value={telefonoContacto}
                  onChange={(e) => setTelefonoContacto(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* MÉTODO DE PAGO Y MONTO */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Método de Pago:</span>
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 font-bold">Monto:</span>
                  <span className="text-emerald-700 font-black text-sm">S/ {Number(monto).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Efectivo */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('Efectivo')}
                  className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    metodoPago === 'Efectivo'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">💵</span>
                  <span>Efectivo</span>
                  <span className="text-[10px] font-semibold opacity-90">Pagado</span>
                </button>

                {/* Yape */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('Yape')}
                  className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    metodoPago === 'Yape'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🟣</span>
                  <span>Yape</span>
                  <span className="text-[10px] font-semibold opacity-90">Ventanilla</span>
                </button>

                {/* Plin */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('Plin')}
                  className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    metodoPago === 'Plin'
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🔵</span>
                  <span>Plin</span>
                  <span className="text-[10px] font-semibold opacity-90">Ventanilla</span>
                </button>

                {/* Pagar luego / Fiado */}
                <button
                  type="button"
                  onClick={() => setMetodoPago('Pagar luego')}
                  className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    metodoPago === 'Pagar luego'
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">⏳</span>
                  <span>Pagar luego</span>
                  <span className="text-[10px] font-semibold opacity-90">Fiado</span>
                </button>
              </div>

              {metodoPago === 'Pagar luego' && (
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2 font-medium">
                  ⚠️ Esta orden se registrará como <strong>PENDIENTE DE PAGO</strong> y se añadirá a la lista de cobranza en <strong>Control de Fiados</strong>.
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onCerrar}
                disabled={guardando}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || cargandoDatos}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar y Confirmar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
