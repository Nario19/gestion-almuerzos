import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/admin/pedido-manual');

export default function PedidoManualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
