import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/admin/despacho');

export default function DespachoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
