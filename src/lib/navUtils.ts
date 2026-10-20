/**
 * Utilidades para títulos, subtítulos e iconografía dinámica de la barra de navegación superior (HeaderNav).
 * Permite que cada pantalla refleje su contexto en el top bar tipo app móvil nativa.
 */

export interface InfoPantalla {
  titulo: string;
  subtitulo: string;
  iconoNombre:
    | 'UtensilsCrossed'
    | 'ShoppingBag'
    | 'GraduationCap'
    | 'User'
    | 'LogIn'
    | 'Building2'
    | 'BarChart3'
    | 'ChefHat'
    | 'Receipt'
    | 'PackageCheck'
    | 'ShieldCheck';
}

/**
 * Deriva el título, subtítulo e icono para la barra superior según la ruta y estado de autenticación.
 */
export function obtenerInfoPantalla(pathname: string, estaAutenticado: boolean): InfoPantalla {
  const ruta = (pathname || '').toLowerCase();

  // Inicio: Pedir Menú (padre autenticado) o Carta Semanal (visitante)
  if (ruta === '/' || ruta === '' || ruta === '/padres' || ruta === '/padres/') {
    return {
      titulo: estaAutenticado ? 'Pedir Menú' : 'Carta Semanal',
      subtitulo: estaAutenticado ? 'Almuerzos Escolares' : 'Menú Escolar',
      iconoNombre: 'UtensilsCrossed',
    };
  }

  // Historial de pedidos del padre
  if (ruta.startsWith('/padres/pedidos') || ruta.startsWith('/pedidos')) {
    return {
      titulo: 'Mis Pedidos',
      subtitulo: 'Historial de Almuerzos',
      iconoNombre: 'ShoppingBag',
    };
  }

  // Deudas y fiados del padre
  if (ruta.startsWith('/padres/deudas') || ruta.startsWith('/deudas')) {
    return {
      titulo: 'Mis Deudas',
      subtitulo: 'Fiados y Pagos Pendientes',
      iconoNombre: 'Receipt',
    };
  }

  // Gestión de hijos
  if (ruta.startsWith('/padres/hijos') || ruta.startsWith('/hijos')) {
    return {
      titulo: 'Mis Hijos',
      subtitulo: 'Estudiantes Registrados',
      iconoNombre: 'GraduationCap',
    };
  }

  // Perfil del apoderado
  if (ruta.startsWith('/padres/perfil') || ruta.startsWith('/perfil')) {
    return {
      titulo: 'Mi Perfil',
      subtitulo: 'Datos de la Cuenta',
      iconoNombre: 'User',
    };
  }

  // Política de Privacidad
  if (ruta.startsWith('/padres/privacidad') || ruta.startsWith('/privacidad')) {
    return {
      titulo: 'Privacidad',
      subtitulo: 'Protección de Datos',
      iconoNombre: 'ShieldCheck',
    };
  }

  // Inicio de sesión / registro
  if (ruta.startsWith('/login')) {
    return {
      titulo: 'Iniciar Sesión',
      subtitulo: 'Acceso a la Plataforma',
      iconoNombre: 'LogIn',
    };
  }

  // Pedido Manual
  if (
    ruta.startsWith('/admin/pedido-manual') ||
    ruta.startsWith('/pedido-manual') ||
    ruta.startsWith('/superadmin/pedido-manual')
  ) {
    return {
      titulo: 'Pedido Manual',
      subtitulo: 'Toma de Almuerzo Escolar',
      iconoNombre: 'UtensilsCrossed',
    };
  }

  // Paneles de Administración
  if (ruta.startsWith('/superadmin')) {
    return {
      titulo: 'Super Admin',
      subtitulo: 'Gestión Global de Colegios',
      iconoNombre: 'Building2',
    };
  }

  if (ruta.startsWith('/admin/cocina') || ruta.startsWith('/cocina')) {
    return {
      titulo: 'Cocina',
      subtitulo: 'Consolidado de Menús',
      iconoNombre: 'ChefHat',
    };
  }

  if (ruta.startsWith('/admin/fiado') || ruta.startsWith('/fiado')) {
    return {
      titulo: 'Control de Fiados',
      subtitulo: 'Créditos y Deudas',
      iconoNombre: 'Receipt',
    };
  }

  if (ruta.startsWith('/admin/despacho') || ruta.startsWith('/despacho')) {
    return {
      titulo: 'Despacho',
      subtitulo: 'Entregas y Pagos',
      iconoNombre: 'PackageCheck',
    };
  }

  if (ruta.startsWith('/admin')) {
    return {
      titulo: 'Panel Admin',
      subtitulo: 'Demanda y Menú',
      iconoNombre: 'BarChart3',
    };
  }

  // Fallback por defecto
  return {
    titulo: 'Placeres Culinarios',
    subtitulo: 'Servicio Escolar',
    iconoNombre: 'UtensilsCrossed',
  };
}

/**
 * Determina si la ruta actual pertenece a la interfaz de administración (Admin o Superadmin).
 * En la interfaz administrativa el navbar superior ya NO muestra el título de la pantalla,
 * sino la marca de la empresa "Placeres Culinarios" con el logo corporativo.
 */
export function esRutaAdministrativa(pathname: string): boolean {
  const ruta = (pathname || '').toLowerCase();
  return (
    ruta.startsWith('/admin') ||
    ruta.startsWith('/superadmin') ||
    ruta.startsWith('/cocina') ||
    ruta.startsWith('/despacho') ||
    ruta.startsWith('/fiado') ||
    ruta.startsWith('/pedido-manual')
  );
}


