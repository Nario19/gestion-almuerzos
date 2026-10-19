import React from 'react';
import { SkeletonHomePage } from '@/components/Skeleton';

/**
 * Loading global de Next.js App Router.
 * Se muestra de forma instantánea mediante React Suspense durante la transición o hidratación inicial.
 */
export default function Loading() {
  return <SkeletonHomePage />;
}
