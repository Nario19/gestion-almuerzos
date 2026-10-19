'use client';

import { useEffect } from 'react';
import { dataService, FAVICON_DEFAULT } from '@/lib/dataService';

export default function FaviconUpdater() {
  useEffect(() => {
    let montado = true;

    const actualizarFavicon = async () => {
      try {
        const url = await dataService.obtenerFaviconUrl();
        if (!montado) return;
        const hrefFinal = url || FAVICON_DEFAULT;

        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = hrefFinal;
      } catch (_) {}
    };

    actualizarFavicon();
    const desuscribir = dataService.suscribirCambios(() => {
      actualizarFavicon();
    });

    return () => {
      montado = false;
      desuscribir();
    };
  }, []);

  return null;
}
