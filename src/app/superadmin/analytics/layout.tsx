import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/superadmin/analytics');

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
