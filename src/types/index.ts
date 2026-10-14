export type TipoPlato = 'ENTRADA' | 'SEGUNDO' | 'BEBIDA' | 'POSTRE';

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';

export type MetodoPago = 'Yape' | 'Plin' | 'Pagar luego' | 'Efectivo' | 'Mensual';

export type EstadoPago = 'PENDIENTE' | 'VERIFICANDO' | 'PAGADO';

export type EstadoPedido = 'REGISTRADO' | 'EN_COCINA' | 'EMPACADO' | 'ENTREGADO';

export type RolUsuario = 'PADRE' | 'ADMIN' | 'SUPER_ADMIN';

export interface Hijo {
  id: string;
  padreId: string;
  nombreCompleto: string;
  colegioNombre: string;
  gradoSeccion: string;
  alergiasNotas?: string;
  createdAt?: string;
}

export interface UsuarioPadre {
  id: string;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email?: string;
  rol: RolUsuario;
  colegioNombre?: string; // Colegio asignado si es un Administrador de sede específica
  hijos: Hijo[];
}

export interface AdminColegioInfo {
  id?: string;
  nombreCompleto: string;
  dni: string;
  email: string;
  telefono: string;
  password?: string;
}

export interface ColegioDetallado {
  id: string;
  nombre: string;
  sede?: string;
  activo: boolean;
  admin?: AdminColegioInfo | null;
  totalPedidos?: number;
  createdAt?: string;
}

export interface Plato {
  id: string;
  menuId?: string;
  colegioNombre?: string; // Colegio asignado si el menú es independiente por institución
  diaSemana: DiaSemana;
  tipo: TipoPlato;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  disponible: boolean;
  orden: number;
}

export interface MenuDia {
  id: string;
  diaSemana: DiaSemana;
  fecha?: string;
  activo: boolean;
  horaCierre: string;
  mensajeAviso?: string;
  platos: Plato[];
}

export interface Pedido {
  id: string;
  codigoPedido: string;
  fecha: string;
  diaSemana?: string;
  padreId?: string;
  hijoId?: string;
  colegioNombre: string;
  gradoSeccion: string;
  estudianteNombre: string;
  telefonoContacto: string;
  entradaNombre: string;
  segundoNombre: string;
  observacion?: string;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  estadoPedido: EstadoPedido;
  comprobanteUrl?: string;
  monto: number;
  createdAt: string;
  horaEntrega?: string;
}

export interface ResumenCocinaItem {
  plato: string;
  tipo: TipoPlato;
  cantidad: number;
  observacionesEspeciales: {
    estudiante: string;
    grado: string;
    colegio: string;
    observacion: string;
  }[];
}

export interface ResumenCocina {
  totalPedidos: number;
  entradas: ResumenCocinaItem[]; // Corresponde a 'Sopa o postre'
  segundos: ResumenCocinaItem[]; // Corresponde a 'Segundo'
  pedidosConObservacion: number;
  pedidosPendientesPago: number;
  pedidosPagados: number;
}

export interface ItemFiadoPedido {
  id: string;
  codigoPedido: string;
  fecha: string;
  diaSemana?: string;
  hijoId?: string;
  estudianteNombre: string;
  gradoSeccion: string;
  colegioNombre: string;
  entradaNombre: string; // Sopa o postre
  segundoNombre: string; // Segundo
  monto: number;
  estadoPedido: EstadoPedido;
  horaEntrega?: string;
  estadoPago: EstadoPago;
  createdAt: string;
}

export interface PadreFiadoResumen {
  padreId?: string;
  nombrePadre: string;
  telefono: string;
  colegioNombre: string;
  hijosNombres: string[];
  totalDeuda: number;
  totalPedidos: number;
  pedidosEntregados: number;
  pedidos: ItemFiadoPedido[];
}

