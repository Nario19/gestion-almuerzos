# DESIGN SYSTEM SPECIFICATION — PLACERES CULINARIOS
**Version:** 2.0.0 (shadcn/ui Official Standard)  
**Inspiration & Baseline:** [shadcn/ui](https://ui.shadcn.com) & [v0 Admin Dashboard](https://v0.app/templates/admin-dashboard-yBomF3O9Yu3?b=b_tPmW788qyUq)  
**Stack:** Next.js 16, React 19, Tailwind CSS 4, Lucide Icons, shadcn/ui Design Tokens & Components.

---

## 1. Design Philosophy
El sistema visual de Placeres Culinarios transmite:
- **Profesionalismo y Rigor:** Interfaces sobrias, limpias y de alto contraste basadas en una paleta monocromática zinc/blanco/negro.
- **Claridad y Jerarquía:** La información técnica o redundante se elimina. Cada pantalla muestra únicamente los datos necesarios para la toma de decisiones.
- **Consistencia Absoluta:** Todos los módulos (Admin, Superadmin, Cocina, Despacho, Fiado, Pedido Manual y Portal de Padres) comparten los mismos componentes de `src/components/ui/` y tokens centralizados.
- **Eficiencia Operativa:** Áreas de toque accesibles, filtros inmediatos, tablas legibles y estados de carga transparentes.
- **Accesibilidad (WCAG 2.2 AA):** Contraste mínimo de 4.5:1 para texto regular, soporte para navegación por teclado, focus rings visibles y tooltips semánticos.

---

## 2. Design Tokens Oficiales (Tailwind CSS 4 & shadcn/ui)

### 2.1 Colores CSS Variables (`src/app/globals.css`)
- `--background`: `#ffffff`
- `--foreground`: `#09090b`
- `--card`: `#ffffff` / `--card-foreground`: `#09090b`
- `--primary`: `#09090b` / `--primary-foreground`: `#ffffff`
- `--secondary`: `#f4f4f5` / `--secondary-foreground`: `#18181b`
- `--muted`: `#f4f4f5` / `--muted-foreground`: `#71717a`
- `--border`: `#e4e4e7` / `--input`: `#e4e4e7`
- `--destructive`: `#ef4444` / `--destructive-foreground`: `#ffffff`
- `--radius`: `0.5rem` (`8px`)

### 2.2 Estados Semánticos
- **Éxito (Entregado / Pagado):** `emerald-600` (`bg-emerald-50`, `border-emerald-200`, `text-emerald-700`)
- **Advertencia / Fiado / Pendiente:** `amber-600` (`bg-amber-50`, `border-amber-200`, `text-amber-800`)
- **Error / Peligro / Cancelado:** `rose-600` (`bg-rose-50`, `border-rose-200`, `text-rose-700`)
- **Informativo / Preparación:** `sky-600` (`bg-sky-50`, `border-sky-200`, `text-sky-700`)

---

## 3. Catálogo de Componentes Oficiales (`src/components/ui/`)

| Componente | Import | Variantes / Propósito |
| :--- | :--- | :--- |
| `Button` | `@/components/ui/button` | `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`. Tamaños: `default`, `sm`, `lg`, `icon`. |
| `Card` | `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| `Badge` | `@/components/ui/badge` | `default`, `secondary`, `outline`, `destructive`, `success`, `warning`. |
| `Table` | `@/components/ui/table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. |
| `Input` | `@/components/ui/input` | Input estilizado con foco, hover y accesibilidad. |
| `Textarea` | `@/components/ui/textarea` | Campo multilínea para observaciones y notas médicas. |
| `Dialog` | `@/components/ui/dialog` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`. |
| `Separator` | `@/components/ui/separator` | Divisores `horizontal` y `vertical`. |
| `Skeleton` | `@/components/ui/skeleton` | Placeholders animados durante cargas. |
| `Tabs` | `@/components/ui/tabs` | `TabsList`, `TabsTrigger`. |

---

## 4. Componentes Compuestos Compartidos (`src/components/shared/`)

- **`StatCard` (`@/components/shared/StatCard`):** Tarjeta métrica estandarizada para KPIs de negocio con iconos, porcentajes, variantes semánticas y soporte interactivo.
- **`SearchInput` (`@/components/shared/SearchInput`):** Input de búsqueda rápido con icono de lupa y botón para limpiar.
- **`EmptyState` (`@/components/shared/EmptyState`):** Estado vacío con ilustración/icono, mensaje claro y botón de acción.

---

## 5. Sidebar & App Shell Architecture

- **Sidebar Colapsable en 3 Estados:**
  1. *Expandido (`w-64`):* Marca, iconos, etiquetas, botón `PanelLeftClose`, datos del usuario y Cerrar Sesión.
  2. *Colapsado (`w-16` / 64px):* Iconos centrados accesibles con tooltips (`title`), botón `PanelLeftOpen`, avatar y logout compacto.
  3. *Móvil:* Drawer deslizante con backdrop oscuro accesible mediante botón hamburguesa `Menu`.
- **Barra Superior Blanca (App Shell Top Bar):** Contiene el título de la pantalla actual y el colegio asignado (`🏫 {colegio}`).
- **Erradicación de Duplicados:** Ninguna pantalla administrativa repite el título institucional en su cuerpo.
