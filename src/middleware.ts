import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Omitir inmediatamente archivos estáticos, llamadas internas de Next.js y endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Rutas 100% públicas que no requieren autenticación
  const esRutaPublica =
    pathname === '/' ||
    pathname === '/padres' ||
    pathname === '/login' ||
    pathname === '/padres/privacidad' ||
    pathname === '/privacidad';

  if (esRutaPublica) {
    return NextResponse.next();
  }

  // 3. Inspeccionar cookies de sesión
  const rawSesionRol = request.cookies.get('sesion_rol')?.value;
  const sesionRol = rawSesionRol
    ? decodeURIComponent(rawSesionRol).replace(/["']/g, '').trim().toUpperCase()
    : undefined;
  const sesionActiva = request.cookies.get('sesion_activa')?.value;
  const estaAutenticado = Boolean(sesionActiva === '1' || sesionRol);
  const esSuperAdmin = sesionRol === 'SUPER_ADMIN';
  const esAdmin = esSuperAdmin || sesionRol === 'ADMIN';

  // Helper para generar redirección al login con aviso de acceso restringido
  const redirigirALogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'no_acceso');
    loginUrl.searchParams.set('redirigir', pathname);
    return NextResponse.redirect(loginUrl);
  };

  // 4. Protección de rutas exclusivas de Super Administrador
  if (pathname.startsWith('/superadmin')) {
    if (!estaAutenticado || !esSuperAdmin) {
      return redirigirALogin();
    }
  }

  // 5. Protección de rutas de Administrador (Dashboard, Cocina, Despacho, Fiado, Pedido Manual)
  if (pathname.startsWith('/admin')) {
    if (!estaAutenticado || !esAdmin) {
      return redirigirALogin();
    }
  }

  // 6. Protección de rutas privadas de padres de familia (Mis Pedidos, Mis Deudas, Mis Hijos, Mi Perfil)
  if (
    pathname.startsWith('/padres/pedidos') ||
    pathname.startsWith('/padres/deudas') ||
    pathname.startsWith('/padres/hijos') ||
    pathname.startsWith('/padres/perfil')
  ) {
    if (!estaAutenticado) {
      return redirigirALogin();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
