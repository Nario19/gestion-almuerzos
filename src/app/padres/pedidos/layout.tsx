import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/padres/pedidos');

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
