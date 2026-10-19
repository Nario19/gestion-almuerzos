import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/admin');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
