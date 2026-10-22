# DESIGN SYSTEM SPECIFICATION — PLACERES CULINARIOS
**Version:** 1.0.0  
**Inspiration & Baseline:** [v0 Admin Dashboard Template](https://v0.app/templates/admin-dashboard-yBomF3O9Yu3?b=b_tPmW788qyUq)  
**Stack:** Next.js 16, React 19, Tailwind CSS 4, Lucide Icons, Radix/shadcn conventions.

---

## 1. Design Philosophy
El sistema visual de Placeres Culinarios transmite:
- **Profesionalismo y Rigor:** Interfaces sobrias, limpias y de alto contraste basadas en una paleta monocromática zinc/blanco/negro.
- **Claridad y Jerarquía:** La información técnica o redundante se elimina. Cada pantalla muestra únicamente los datos necesarios para la toma de decisiones.
- **Consistencia Absoluta:** Todos los módulos (Admin, Superadmin, Cocina, Despacho, Fiado, Pedido Manual y Portal de Padres) comparten los mismos tokens, componentes, bordes, radios y espaciados.
- **Eficiencia Operativa:** Áreas de toque accesibles, filtros inmediatos, tablas legibles y estados de carga transparentes.
- **Accesibilidad (WCAG 2.2 AA):** Contraste mínimo de 4.5:1 para texto regular, soporte para navegación por teclado, focus rings visibles y tooltips semánticos.

---

## 2. Design Tokens (Tailwind CSS 4)

### 2.1 Colores
- **Background App:** `#fafafa` (`bg-zinc-50`)
- **Superficie / Cards / Modales:** `#ffffff` (`bg-white`)
- **Texto Principal:** `#09090b` (`text-zinc-950`)
- **Texto Secundario:** `#71717a` (`text-zinc-500` / `text-zinc-600`)
- **Bordes Predeterminados:** `#e4e4e7` (`border-zinc-200`)
- **Bordes Sutiles / Divisores:** `#f4f4f5` (`border-zinc-100`)
- **Acento Primario (Sólido):** `#09090b` (`bg-zinc-950`, hover: `bg-zinc-800`, texto: `#ffffff`)
- **Acento Secundario (Neutro):** `#f4f4f5` (`bg-zinc-100`, hover: `bg-zinc-200/80`, texto: `text-zinc-900`)
- **Estados Semánticos:**
  - **Éxito (Entregado / Pagado):** `emerald-600` (`bg-emerald-50`, `border-emerald-200`, `text-emerald-700`)
  - **Advertencia / Fiado / Pendiente:** `amber-600` (`bg-amber-50`, `border-amber-200`, `text-amber-800`)
  - **Error / Peligro / Cancelado:** `rose-600` (`bg-rose-50`, `border-rose-200`, `text-rose-700`)
  - **Informativo / Preparación:** `sky-600` (`bg-sky-50`, `border-sky-200`, `text-sky-700`)

### 2.2 Radios y Sombras
- **Tarjetas / Contenedores Principales:** `rounded-xl` (`12px`)
- **Botones / Inputs / Badges:** `rounded-lg` (`8px`)
- **Píldoras / Filtros Redondeados:** `rounded-full`
- **Sombras:**
  - `shadow-2xs`: `0 1px 2px 0 rgb(0 0 0 / 0.03)`
  - `shadow-xs`: `0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)`
  - `shadow-sm`: `0 1px 3px 0 rgb(0 0 0 / 0.08)`

---

## 3. Typography & Hierarchy
- **Familia Tipográfica:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Títulos de Pantalla (Header Top):** `text-base sm:text-lg font-bold tracking-tight text-zinc-950`
- **Subtítulos y Contexto:** `text-xs text-zinc-500 font-medium`
- **Valores Métricos / KPIs:** `text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 tabular-nums`
- **Encabezados de Tabla:** `text-[11px] font-semibold text-zinc-500 uppercase tracking-wider`
- **Cuerpo de Celda:** `text-xs sm:text-sm text-zinc-800`

---

## 4. UI Components Specification

### 4.1 Buttons
- **Primary:** `bg-zinc-950 text-white hover:bg-zinc-800 shadow-xs rounded-lg px-3.5 py-2 text-xs font-semibold transition active:scale-[0.99]`
- **Secondary / Filter Default:** `bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg px-3 py-1.5 text-xs font-semibold transition`
- **Filter Active:** `bg-zinc-950 text-white border-zinc-950 shadow-xs rounded-lg px-3 py-1.5 text-xs font-semibold`
- **Ghost / Icon:** `p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition`
- **Destructive:** `bg-rose-600 text-white hover:bg-rose-700 rounded-lg px-3.5 py-2 text-xs font-semibold transition`

### 4.2 Cards
- **KPI Card:**
  ```tsx
  <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/90 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
      <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">{valor}</div>
    {subtexto && <p className="text-[11px] text-zinc-500 mt-1">{subtexto}</p>}
  </div>
  ```

### 4.3 Tables
- **Contenedor:** `bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden`
- **Thead:** `bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider`
- **Fila (Tr):** `border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors`
- **Celda (Td):** `py-3 px-4 text-xs sm:text-sm text-zinc-800`

### 4.4 Inputs & Filters
- **Input de Búsqueda:** `bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition`
- **Filtros rápidos:** Botones agrupados en `flex flex-wrap items-center gap-1.5`.

---

## 5. Sidebar & App Shell Architecture

### 5.1 Tres Estados del Sidebar
1. **Expandido (`w-64`):**
   - Logotipo y Nombre del Sistema ("Placeres Culinarios").
   - Nombre del Administrador y Rol.
   - Botón de Colapsar (`PanelLeftClose`).
   - Iconos + Etiquetas completas de navegación.
   - Botón de Cerrar Sesión en el pie.
2. **Colapsado (`w-16` / `64px`):**
   - Icono minimalista.
   - Botón de Expandir (`PanelLeftOpen`).
   - Iconos de navegación centrados con accesibilidad y `title`/tooltips.
   - Avatar / inicial en el pie y botón de logout compacto.
3. **Móvil (Drawer Deslizable):**
   - Oculto por defecto (`-translate-x-full`).
   - Botón hamburguesa `Menu` en la barra superior.
   - Backdrop oscuro (`bg-black/40 backdrop-blur-xs`).
   - Cierre automático al seleccionar una ruta o pulsar `X` / backdrop.

### 5.2 Header Superior Blanco (App Shell Top Bar)
- **Barra fija:** `sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 h-16 flex items-center justify-between px-4 sm:px-6`
- **Contenido Izquierdo:**
  - Botón de menú hamburguesa (en móvil).
  - Botón de colapso de sidebar (en desktop).
  - Divisor vertical (`h-5 w-px bg-zinc-200`).
  - **Título de la Pantalla:** (ej. *Panel de Administración*, *Control de Cocina*, *Despacho de Pedidos*, *Registro de Fiados*, *Pedido Manual*).
  - **Insignia del Colegio:** Píldora sutil con icono `Building2` y nombre del colegio asignado (ej. `🏫 COLEGIO ZAARTEA`).
- **Limpieza de Páginas Hijas:**
  - Las pantallas ya **no duplican** el título de página ni el nombre del colegio en su cuerpo, maximizando el espacio útil para tablas, métricas y controles.
