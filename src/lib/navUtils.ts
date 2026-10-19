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
    | 'PackageCheck';
}

/**
 * Deriva el título, subtítulo e icono para la barra superior según la ruta y estado de autenticación.
 */
export function obtenerInfoPantalla(pathname: string, estaAutenticado: boolean): InfoPantalla {
  const ruta = (pathname || '').toLowerCase();

  // Inicio: Pedir Menú (padre autenticado) o Carta Semanal (visitante)
  if (ruta === '/' || ruta === '') {
    return {
      titulo: estaAutenticado ? 'Pedir Menú' : 'Carta Semanal',
      subtitulo: estaAutenticado ? 'Almuerzos Escolares' : 'Menú Escolar',
      iconoNombre: 'UtensilsCrossed',
    };
  }

  // Historial de pedidos del padre
  if (ruta.startsWith('/pedidos')) {
    return {
      titulo: 'Mis Pedidos',
      subtitulo: 'Historial de Almuerzos',
      iconoNombre: 'ShoppingBag',
    };
  }

  // Gestión de hijos
  if (ruta.startsWith('/hijos')) {
    return {
      titulo: 'Mis Hijos',
      subtitulo: 'Estudiantes Registrados',
      iconoNombre: 'GraduationCap',
    };
  }

  // Perfil del apoderado
  if (ruta.startsWith('/perfil')) {
    return {
      titulo: 'Mi Perfil',
      subtitulo: 'Datos de la Cuenta',
      iconoNombre: 'User',
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

  // Paneles de Administración
  if (ruta.startsWith('/superadmin')) {
    return {
      titulo: 'Super Admin',
      subtitulo: 'Gestión Global de Colegios',
      iconoNombre: 'Building2',
    };
  }

  if (ruta.startsWith('/admin')) {
    return {
      titulo: 'Panel Admin',
      subtitulo: 'Demanda y Menú',
      iconoNombre: 'BarChart3',
    };
  }

  if (ruta.startsWith('/cocina')) {
    return {
      titulo: 'Cocina',
      subtitulo: 'Consolidado de Menús',
      iconoNombre: 'ChefHat',
    };
  }

  if (ruta.startsWith('/fiado')) {
    return {
      titulo: 'Control de Fiados',
      subtitulo: 'Créditos y Deudas',
      iconoNombre: 'Receipt',
    };
  }

  if (ruta.startsWith('/despacho')) {
    return {
      titulo: 'Despacho',
      subtitulo: 'Entregas y Pagos',
      iconoNombre: 'PackageCheck',
    };
  }

  // Fallback por defecto
  return {
    titulo: 'Placeres Culinarios',
    subtitulo: 'Servicio Escolar',
    iconoNombre: 'UtensilsCrossed',
  };
}
