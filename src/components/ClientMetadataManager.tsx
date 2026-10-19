'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { obtenerMetadataPorRuta } from '@/lib/metadataUtils';

export default function ClientMetadataManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const meta = obtenerMetadataPorRuta(pathname);
    if (meta?.title) {
      document.title = meta.title;
    }
    if (meta?.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', meta.description);
    }
  }, [pathname]);

  return null;
}
