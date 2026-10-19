import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/padres/perfil');

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
