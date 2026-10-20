import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/padres/deudas');

export default function DeudasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
