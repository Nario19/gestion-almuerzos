import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';
import AdminContainer from '@/components/AdminContainer';

export const metadata: Metadata = crearMetadataPagina('/superadmin');

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <AdminContainer>{children}</AdminContainer>;
}
