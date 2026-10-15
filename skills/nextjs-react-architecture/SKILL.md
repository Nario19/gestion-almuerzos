---
name: nextjs-react-architecture
description: Arquitectura moderna, eficiente y segura en Next.js App Router y React para Placeres Culinarios.
---

# SKILL 2 — NEXTJS REACT ARCHITECTURE

## Objetivo
Preservar y evolucionar una arquitectura web moderna, eficiente, tipada y libre de regresiones sobre Next.js (App Router) y React en Placeres Culinarios.

---

## 1. Directivas del App Router en Next.js

- **Server Components por Defecto:** Mantener los componentes del servidor como base para obtener datos de forma segura, reduciendo el bundle transferido al cliente.
- **Client Components con `'use client'`:** Utilizar `'use client'` únicamente cuando el componente requiera interactividad de usuario (event listeners, estados locales con `useState`, efectos con `useEffect`, o acceso a APIs del navegador como `localStorage`).
- **Límites Limpios:** Colocar los componentes de cliente lo más abajo posible en el árbol de componentes (hojas interactivas) para maximizar el renderizado en servidor.
- **Prevención de Problemas de Hidratación:**
  - No generar contenido no determinista en el primer render (por ejemplo, `new Date()` sin zona fija o `Math.random()`).
  - Utilizar el patrón de montaje seguro (`const [montado, setMontado] = useState(false); useEffect(() => setMontado(true), []); if (!montado) return null;`) cuando se acceda a datos exclusivos del navegador (`localStorage`).
  - Para fechas y horas, emplear siempre las funciones centralizadas de `src/lib/dateUtils.ts` fijadas en la zona horaria oficial `America/Lima` (UTC-5).

---

## 2. Server Actions y Rutas de Servidor Seguras

- **Validación en el Servidor:** Jamás confiar en datos enviados desde el cliente. Toda Server Action o Route Handler debe validar los datos de entrada en el servidor antes de tocar la base de datos.
- **Autorización por Petición:** Comprobar la sesión, el rol (`SUPER_ADMIN`, `ADMIN`, `PADRE`) y el colegio asignado en el servidor para evitar escalada de privilegios.
- **Protección contra CSRF e Inyección:** Las Server Actions cuentan con protección CSRF integrada en Next.js; complementar con consultas parametrizadas hacia PostgreSQL.

---

## 3. Manejo de Caché, Revalidación y Estados de Carga

- **Loading y Error Boundaries:** Implementar archivos `loading.tsx` y `error.tsx` en los segmentos de ruta donde haya operaciones asíncronas para proporcionar feedback visual inmediato y contención de fallos.
- **Revalidación Selectiva:** Utilizar `revalidatePath()` o `revalidateTag()` al mutar pedidos, colegios o platos para invalidar la caché del servidor de forma quirúrgica.
- **Suscripciones en Tiempo Real (Realtime):** En componentes clientes suscritos a cambios de Supabase, asegurar siempre la desuscripción en la función de limpieza de `useEffect` (`return () => desuscribir();`) para prevenir fugas de memoria o conexiones fantasma.

---

## 4. Gestión Segura de Sesiones y Protección de Rutas

- **Autenticación Basada en Servidor:** La sesión en el cliente (`authContext.tsx`) no debe asumir que el usuario tiene privilegios irrevocables. Debe revalidarse contra la base de datos para confirmar que la cuenta siga activa y que el rol/colegio no hayan sido revocados.
- **Bloqueo en Pantallas Administrativas:** Si un usuario con rol `ADMIN` no tiene un `colegioNombre` asignado válido, se le debe bloquear el acceso preventivo para impedir que gestione o visualice datos de otros colegios.

---

## 5. Compatibilidad y Dependencias

- **Guía Local de Next.js:** Antes de incorporar APIs experimentales o modificar la configuración en `next.config.ts`, consultar la documentación local en `node_modules/next/dist/docs/`.
- **Evaluación de Breaking Changes:** Antes de actualizar versiones mayores de Next.js o React, analizar la matriz de compatibilidad, dependencias de ESLint y ejecutar la suite de regresión completa.
