import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/superadmin');

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
