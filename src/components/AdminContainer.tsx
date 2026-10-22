'use client';

import React from 'react';
import { useSidebar } from '@/components/SidebarContext';

export default function AdminContainer({ children }: { children: React.ReactNode }) {
  const { sidebarColapsado } = useSidebar();
  return (
    <div
      className={`min-h-screen transition-all duration-200 ease-in-out ${
        sidebarColapsado ? 'lg:pl-16' : 'lg:pl-64'
      }`}
    >
      {children}
    </div>
  );
}
