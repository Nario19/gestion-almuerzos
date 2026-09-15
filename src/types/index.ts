export type TipoPlato = 'ENTRADA' | 'SEGUNDO' | 'BEBIDA' | 'POSTRE';

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';

export type MetodoPago = 'Yape' | 'Plin' | 'Efectivo' | 'Mensual';

export type EstadoPago = 'PENDIENTE' | 'VERIFICANDO' | 'PAGADO';

export type EstadoPedido = 'REGISTRADO' | 'EN_COCINA' | 'EMPACADO' | 'ENTREGADO';

export type RolUsuario = 'PADRE' | 'ADMIN';

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
  hijos: Hijo[];
}

export interface Plato {
  id: string;
  menuId?: string;
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
  entradas: ResumenCocinaItem[];
  segundos: ResumenCocinaItem[];
  pedidosConObservacion: number;
  pedidosPendientesPago: number;
  pedidosPagados: number;
}
