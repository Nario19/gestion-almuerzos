import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/padres/hijos');

export default function HijosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
