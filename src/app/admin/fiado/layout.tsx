import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/admin/fiado');

export default function FiadoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
