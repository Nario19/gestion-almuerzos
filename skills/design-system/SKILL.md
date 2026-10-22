---
name: design-system
description: Sistema de diseño maestro y directivas UI/UX para Placeres Culinarios basado en la plantilla admin-dashboard v0
---

# Design System Skill — Placeres Culinarios

Esta Skill es de **consulta obligatoria** antes y durante cualquier cambio en interfaces de usuario, componentes visuales, layouts o pantallas del sistema.

## 1. Referencia Maestra
- **Plantilla base:** [v0 Admin Dashboard Template](https://v0.app/templates/admin-dashboard-yBomF3O9Yu3?b=b_tPmW788qyUq)
- **Especificación completa:** Consultar [DESIGN.md](file:///Users/reyesrios/Dev/gestion-almuerzos/DESIGN.md).

## 2. Reglas Mandatorias de Diseño
1. **Paleta Monocromática Minimalista:** Utilizar exclusivamente la gama zinc/blanco/negro (`bg-zinc-50`, `bg-white`, `text-zinc-950`, `text-zinc-500`, `border-zinc-200`). Erradicar colores estridentes no justificados o estilos dispares entre módulos.
2. **Jerarquía en el App Shell:**
   - La **Barra Superior Blanca (Header)** contiene el **Título de la pantalla actual** y el **Colegio asignado**.
   - El cuerpo de la página (`page.tsx`) **NUNCA debe repetir** el título principal ni el nombre del colegio de forma redundante.
3. **Sidebar Colapsable en 3 Estados:**
   - **Expandido (`w-64`):** Logotipo, textos, navegación completa y botón `PanelLeftClose`.
   - **Colapsado (`w-16`):** Iconos centrados, tooltips accesibles y botón `PanelLeftOpen`.
   - **Móvil:** Cajón drawer con backdrop oscuro y botón hamburguesa `Menu` en el Header.
4. **Tarjetas (Cards) Uniformes:**
   - Fondo blanco `bg-white`, borde fino `border border-zinc-200/90`, radio `rounded-xl`, sombra `shadow-xs`.
   - Título de métrica en mayúsculas pequeñas `text-[11px] font-semibold text-zinc-500 uppercase tracking-wider`.
   - Valor numérico en `text-xl sm:text-2xl font-bold tracking-tight text-zinc-950`.
5. **Botones y Filtros:**
   - Botón Primario: `bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg shadow-xs`.
   - Filtro Inactivo: `bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg`.
   - Filtro Activo: `bg-zinc-950 text-white border-zinc-950 shadow-xs rounded-lg`.
6. **Tablas Profesionales:**
   - Cabecera en `bg-zinc-50/80 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider`.
   - Filas con separación sutil `border-b border-zinc-100` y `hover:bg-zinc-50/60`.
7. **Sin Clutter Técnico:**
   - Prohibido incluir badges o avisos de infraestructura como "Supabase Activo".
   - Evitar botones de navegación redundantes en filtros o cabeceras si ya existen en el Sidebar.

## 3. Checklist de Verificación UI/UX
- [ ] ¿El título y el colegio están en la barra blanca superior y no se repiten abajo?
- [ ] ¿El Sidebar se expande y colapsa suavemente sin desbordar el contenido?
- [ ] ¿Los botones, inputs, filtros y tarjetas utilizan los tokens del Design System?
- [ ] ¿Es 100% responsive en móvil (375px), tablet (768px) y desktop (1440px)?
- [ ] ¿Se mantuvieron intactas todas las funcionalidades y pruebas (0 regresiones)?
