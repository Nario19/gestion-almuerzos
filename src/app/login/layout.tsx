import type { Metadata } from 'next';
import { crearMetadataPagina } from '@/lib/metadataUtils';

export const metadata: Metadata = crearMetadataPagina('/login');

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
