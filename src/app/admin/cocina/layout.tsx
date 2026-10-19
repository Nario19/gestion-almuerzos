import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/admin/cocina');

export default function CocinaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
