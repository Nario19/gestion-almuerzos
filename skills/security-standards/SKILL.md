---
name: security-standards
description: Estándares de seguridad de nivel de producción, cumplimiento OWASP, aislamiento multitenant y protección de datos escolares en Placeres Culinarios.
---

# SKILL 3 — SECURITY STANDARDS

## Objetivo
Blindar la aplicación contra amenazas de seguridad web, garantizar el cumplimiento estricto de las directrices OWASP (Top 10, ASVS y API Security Top 10) y asegurar que la información escolar y financiera permanezca estrictamente confidencial e inalterable.

---

## 1. Control de Acceso y Aislamiento Multitenant (Anti-IDOR / Anti-BOLA)

- **Principio de Mínimo Privilegio:** Cada usuario interactúa únicamente con los recursos explícitamente autorizados para su rol y contexto.
- **Aislamiento por Rol:**
  - **PADRE:** Acceso exclusivo a sus propios hijos y a los pedidos asociados a su perfil. Jamás debe poder listar, editar o consultar hijos o pedidos de otros padres mediante manipulación de parámetros (IDOR).
  - **ADMIN (Colegio):** Acceso estrictamente limitado a los estudiantes, menús, despachos y deudas correspondientes a su colegio asignado (`colegioNombre` / `colegioId`). No puede ver ni modificar datos de otras instituciones educativas.
  - **SUPER_ADMIN:** Gestión global autorizada de colegios, administradores y parámetros generales del sistema.
- **Pruebas Automatizadas de Autorización Obligatorias:**
  - Toda modificación de rutas administrativas o consultas de datos debe incluir pruebas que verifiquen:
    1. Un ADMIN del Colegio A es rechazado al intentar consultar o editar datos del Colegio B.
    2. Un PADRE no puede recuperar pedidos o registrar platos para un estudiante ajeno.
    3. Un usuario desautenticado o sin sesión válida no puede invocar operaciones de mutación.

---

## 2. Prevención de Vulnerabilidades Críticas OWASP

- **Inyección SQL (SQLi):**
  - Todas las consultas a PostgreSQL deben realizarse mediante el cliente tipado y parametrizado de Supabase (`.from('tabla').select().eq(...)`).
  - Queda prohibida la concatenación directa de cadenas no sanitizadas en consultas RPC o bloques SQL crudos.
- **Cross-Site Scripting (XSS):**
  - React escapa automáticamente las variables en JSX. Queda terminantemente prohibido el uso de `dangerouslySetInnerHTML` salvo justificación auditada y con sanitización previa (DOMPurify).
  - Al generar reportes de exportación HTML/Excel, neutralizar y escapar siempre los caracteres especiales (`<`, `>`, `&`, `"`, `'`).
- **CSV / Excel Formula Injection:**
  - En la exportación a CSV o Excel de nombres de alumnos, observaciones o colegios, desarmar celdas que comiencen con caracteres ejecutables de fórmula (`=`, `+`, `-`, `@`) prefijándolas con un apóstrofe `'` o comilla simple.
- **Cross-Site Request Forgery (CSRF):**
  - Mantener la protección por defecto de Server Actions en Next.js. Si se exponen API Routes, validar cabeceras `Origin` y `Host`.

---

## 3. Seguridad de Sesiones, Comprobantes y Datos Personales

- **Gestión Segura de Sesiones:**
  - No confiar ciegamente en datos almacenados en el navegador (`localStorage`).
  - Revalidar la existencia, vigencia y rol de la cuenta en la base de datos ante operaciones críticas.
  - Si una cuenta es pausada o desactivada en la base de datos, las llamadas subsiguientes deben revocar el acceso de inmediato.
- **Protección de Comprobantes de Pago (Yape / Plin):**
  - Los comprobantes bancarios contienen información financiera sensible. Deben almacenarse en buckets privados de Supabase Storage o transmitirse con identificadores aleatorios protegidos contra enumeración.
- **Gestión de Secretos:**
  - Nunca commitear claves de servicio (`SUPABASE_SERVICE_ROLE_KEY`), tokens de despliegue ni contraseñas.
  - Utilizar variables de entorno en `.env.local` y configurarlas de manera segura en Vercel y Supabase.

---

## 4. Procedimiento de Remediación de Hallazgos de Seguridad

- Todo hallazgo de seguridad crítico o alto (como R01 o R02 de la auditoría) debe:
  1. Aislarse y reproducirse mediante una prueba controlada.
  2. Implementarse la solución mínima segura sin alterar las funcionalidades operativas del negocio.
  3. Validarse en un entorno local seguro antes de su despliegue a producción.
