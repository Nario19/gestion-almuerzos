import type { Metadata } from 'next';

export interface PageMetadataInfo {
  title: string;
  description: string;
}

export const METADATA_BASE = {
  appName: 'Placeres Culinarios',
  defaultTitle: 'Placeres Culinarios | Gestión de Almuerzos Escolares',
  defaultDescription:
    'Sistema integral de gestión de almuerzos escolares saludables, control de menú semanal y pedidos para colegios.',
};

export const RUTA_METADATA_MAP: Record<string, PageMetadataInfo> = {
  '/': {
    title: 'Carta Semanal y Almuerzos Escolares | Placeres Culinarios',
    description:
      'Consulta los menús saludables del día, platos de fondo, sopas nutritivas y programa el almuerzo escolar de tus hijos.',
  },
  '/padres': {
    title: 'Pedir Menú Escolar | Placeres Culinarios',
    description:
      'Selecciona el almuerzo del día para tus hijos con confirmación inmediata y entrega puntual en el colegio.',
  },
  '/padres/pedidos': {
    title: 'Mis Pedidos | Placeres Culinarios',
    description:
      'Historial de pedidos escolares, estados de preparación en cocina, comprobantes adjuntos y detalle de entregas.',
  },
  '/padres/deudas': {
    title: 'Mis Deudas y Fiados | Placeres Culinarios',
    description:
      'Control y seguimiento de almuerzos bajo modalidad fiado o pagar luego, saldos por estudiante y estados de liquidación.',
  },
  '/padres/hijos': {
    title: 'Mis Hijos | Placeres Culinarios',
    description:
      'Registro y administración de estudiantes escolares, colegios asociados, grados, secciones y notas médicas de alergias.',
  },
  '/padres/perfil': {
    title: 'Mi Perfil | Placeres Culinarios',
    description:
      'Datos del apoderado, teléfono de contacto para entregas y preferencias de la cuenta familiar.',
  },
  '/padres/privacidad': {
    title: 'Política de Privacidad y Protección de Datos | Placeres Culinarios',
    description:
      'Compromiso de protección de datos personales de menores de edad y tutores legales conforme a la Ley N° 29733 de Perú.',
  },
  '/privacidad': {
    title: 'Política de Privacidad y Protección de Datos | Placeres Culinarios',
    description:
      'Compromiso de protección de datos personales de menores de edad y tutores legales conforme a la Ley N° 29733 de Perú.',
  },
  '/login': {
    title: 'Iniciar Sesión | Placeres Culinarios',
    description:
      'Ingresa a tu cuenta de apoderado o personal administrativo de cocina y despacho escolar.',
  },
  '/admin': {
    title: 'Panel Administrativo & KPIs | Placeres Culinarios',
    description:
      'Gestión de menú escolar semanal, demanda de platos, configuración de grados, secciones y notas de cocina.',
  },
  '/admin/despacho': {
    title: 'Despacho de Almuerzos | Placeres Culinarios',
    description:
      'Control de entregas de loncheras escolares en mostrador, verificación de pagos y exportación de reportes.',
  },
  '/admin/cocina': {
    title: 'Consolidado de Cocina | Placeres Culinarios',
    description:
      'Planificación de raciones, porciones de platos de fondo, dietas especiales y alertas de alergias para cocina.',
  },
  '/admin/fiado': {
    title: 'Control de Fiados y Pagos | Placeres Culinarios',
    description:
      'Seguimiento de cuentas familiares bajo modalidad pagar luego y cobranza formal por WhatsApp con comprobante.',
  },
  '/admin/pedido-manual': {
    title: 'Registro de Pedido Manual | Placeres Culinarios',
    description:
      'Módulo de ventanilla para toma rápida de pedidos escolares para abuelitos y apoderados.',
  },
  '/superadmin': {
    title: 'Super Administrador Global | Placeres Culinarios',
    description:
      'Administración central de colegios, directores, horarios límites y métodos de pago.',
  },
  '/superadmin/analytics': {
    title: 'Analítica y Toma de Decisiones | Placeres Culinarios',
    description:
      'Business intelligence y métricas operativas de ventas, platos estrella, recaudación y demanda por colegio.',
  },
};

export function obtenerMetadataPorRuta(pathname: string): PageMetadataInfo {
  const rutaLimpia = (pathname || '/').toLowerCase().split('?')[0].replace(/\/+$/, '') || '/';
  if (RUTA_METADATA_MAP[rutaLimpia]) {
    return RUTA_METADATA_MAP[rutaLimpia];
  }

  // Coincidencias por prefijo
  for (const [prefijo, info] of Object.entries(RUTA_METADATA_MAP)) {
    if (prefijo !== '/' && rutaLimpia.startsWith(prefijo)) {
      return info;
    }
  }

  return {
    title: METADATA_BASE.defaultTitle,
    description: METADATA_BASE.defaultDescription,
  };
}

export function crearMetadataPagina(ruta: string): Metadata {
  const info = obtenerMetadataPorRuta(ruta);
  return {
    title: info.title,
    description: info.description,
    openGraph: {
      title: info.title,
      description: info.description,
      siteName: METADATA_BASE.appName,
      locale: 'es_PE',
      type: 'website',
    },
  };
}
