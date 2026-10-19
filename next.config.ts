import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/cocina', destination: '/admin/cocina', permanent: false },
      { source: '/despacho', destination: '/admin/despacho', permanent: false },
      { source: '/fiado', destination: '/admin/fiado', permanent: false },
      { source: '/pedido-manual', destination: '/admin/pedido-manual', permanent: false },
      { source: '/pedidos', destination: '/padres/pedidos', permanent: false },
      { source: '/hijos', destination: '/padres/hijos', permanent: false },
      { source: '/perfil', destination: '/padres/perfil', permanent: false },
      { source: '/privacidad', destination: '/padres/privacidad', permanent: false },
    ];
  },
};

export default nextConfig;
