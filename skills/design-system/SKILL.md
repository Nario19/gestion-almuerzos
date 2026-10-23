---
name: design-system
description: Sistema de diseño maestro oficial de Placeres Culinarios basado en shadcn/ui y v0 Admin Dashboard
---

# Design System Skill — Placeres Culinarios (shadcn/ui Oficial)

Esta Skill es de **consulta obligatoria** antes y durante cualquier cambio en interfaces de usuario, componentes visuales, layouts o pantallas del sistema.

## 1. Referencia Maestra
- **Biblioteca Oficial:** [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- **Theming:** [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- **Plantilla base:** [v0 Admin Dashboard Template](https://v0.app/templates/admin-dashboard-yBomF3O9Yu3?b=b_tPmW788qyUq)
- **Especificación completa:** Consultar [DESIGN.md](file:///Users/reyesrios/Dev/gestion-almuerzos/DESIGN.md).

## 2. Reglas Mandatorias de Diseño
1. **Componentes Oficiales de `src/components/ui/`:**
   - Usar `Button`, `Card`, `Badge`, `Table`, `Input`, `Textarea`, `Dialog`, `Skeleton`, `Tabs` y `Separator`.
   - Prohibido crear variantes duplicadas paralelas (`CustomButton`, `BlueButton`, etc.).
2. **Paleta Monocromática Minimalista:** Utilizar la gama zinc/blanco/negro oficial de shadcn/ui. Colores semánticos (verde, ámbar, rojo) reservados exclusivamente para estados operativos (*Entregado*, *Fiado*, *Cancelado*).
3. **Jerarquía en el App Shell:**
   - La **Barra Superior Blanca (Header)** contiene el **Título de la pantalla actual** y el **Colegio asignado**.
   - El cuerpo de la página (`page.tsx`) **NUNCA debe repetir** el título principal ni el nombre del colegio de forma redundante.
4. **Sidebar Colapsable en 3 Estados:**
   - **Expandido (`w-64`):** Logotipo, textos, navegación completa y botón `PanelLeftClose`.
   - **Colapsado (`w-16`):** Iconos centrados, tooltips accesibles y botón `PanelLeftOpen`.
   - **Móvil:** Cajón drawer con backdrop oscuro y botón hamburguesa `Menu` en el Header.
5. **Tarjetas (Cards) y KPIs:**
   - Usar `StatCard` o `Card` con `rounded-xl`, `border border-zinc-200/90`, `shadow-xs`.
6. **Sin Clutter Técnico:**
   - Prohibido incluir badges o avisos de infraestructura como "Supabase Activo".
   - Evitar botones de navegación redundantes en filtros o cabeceras si ya existen en el Sidebar.

## 3. Checklist de Calidad Frontend
- [ ] ¿El componente proviene o reutiliza `src/components/ui/` o `src/components/shared/`?
- [ ] ¿El título y el colegio están en la barra blanca superior y no se repiten abajo?
- [ ] ¿El Sidebar se expande y colapsa suavemente sin desbordar el contenido?
- [ ] ¿Es 100% responsive en móvil (375px), tablet (768px) y desktop (1440px)?
- [ ] ¿Se mantuvieron intactas todas las funcionalidades y pruebas (0 regresiones)?
