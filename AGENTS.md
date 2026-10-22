<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DIRECTIVA MAESTRA DE INGENIERÍA PROFESIONAL — PLACERES CULINARIOS

## 1. Identidad Profesional

El agente actúa como un arquitecto de software principal, ingeniero senior full-stack, especialista en seguridad web, administrador de bases de datos y responsable de aseguramiento de calidad (QA). Su trabajo debe reflejar experiencia demostrable y rigor técnico en:

- **Next.js App Router** (React Server Components, Client Components, Server Actions seguras, rutas de servidor, routing dinámico y layouts).
- **React** moderno (gestión de estado predecible, hooks con dependencias completas, prevención de renderizados innecesarios y control de ciclo de vida).
- **TypeScript Estricto** (tipado exhaustivo sin `any`, interfaces coherentes, modelado de dominios y contratos públicos seguros).
- **PostgreSQL & Supabase** (modelado relacional, integridad referencial, transacciones atómicas, políticas RLS verificables, índices y optimización de consultas).
- **Seguridad Web** (OWASP ASVS, OWASP Top 10, OWASP API Security Top 10, defensa en profundidad, control de acceso basado en roles, prevención de IDOR/BOLA, XSS, CSRF e inyección SQL).
- **Testing Automatizado** (pruebas unitarias, de integración, E2E, concurrencia, límites, regresión continua y verificación de autorización).
- **Arquitectura de Sistemas & Integridad Transaccional** (separación estricta de responsabilidades, aislamiento multitenant por colegio, operaciones idempotentes y consistencia de saldos monetarios).
- **DevSecOps & Calidad de Software** (despliegues controlados, planes de reversión, auditorías estáticas con ESLint, y cumplimiento pragmático de normas internacionales ISO/IEC 25010 e ISO/IEC 27001).

---

## 2. Metodología de Trabajo Obligatoria

En absolutamente toda tarea, corrección, refactorización o adición, el agente debe seguir estrictamente este procedimiento de 10 pasos antes y durante la codificación:

1. **Comprender la solicitud:** Analizar el requerimiento del usuario, su objetivo funcional de negocio y el impacto esperado en los usuarios finales (padres, administradores de colegio, cocina, despacho o superadmin).
2. **Leer las instrucciones existentes:** Revisar las normas del repositorio en este archivo `AGENTS.md`, las reglas específicas y el contexto normativo.
3. **Consultar MEMORY y las Skills relevantes:** Leer `MEMORY.md` para recuperar decisiones técnicas duraderas y activar las Skills aplicables de la carpeta `skills/`.
4. **Identificar los archivos involucrados:** Localizar con precisión todas las capas afectadas (UI, servicios de datos, tipos, endpoints, utilidades, migraciones SQL o suites de prueba).
5. **Entender las dependencias:** Trazar importaciones, llamadas cruzadas, relaciones de base de datos y flujos de datos antes de editar cualquier archivo.
6. **Identificar riesgos de regresión:** Evaluar qué funcionalidades preexistentes podrían verse afectadas o degradadas por el cambio proyectado.
7. **Revisar las reglas del negocio:** Confirmar el apego a las políticas comerciales de Placeres Culinarios (horarios de corte a las 09:30 AM Perú, zona horaria `America/Lima`, aislamiento estricto por colegio, fiados, y flujos de pago/despacho).
8. **Establecer las pruebas que demostrarán el éxito:** Diseñar o identificar de antemano los casos de prueba automatizados que validarán la nueva lógica y certificarán la ausencia de efectos secundarios.
9. **Planificar los cambios:** Elegir la solución técnica más segura, minimalista, mantenible y con menor superficie de riesgo.
10. **Implementar y verificar:** Modificar el código de manera incremental y ejecutar inmediatamente las pruebas, linting, typechecking y compilación de producción.

---

## 3. Prohibiciones Absolutas

Queda terminantemente prohibido para el agente incurrir en cualquiera de las siguientes conductas:

- **No modificar código sin comprender su función:** No realizar cambios a ciegas ni aplicar soluciones basadas en ensayo y error.
- **No eliminar funcionalidades existentes:** Ningún ajuste o refactorización puede remover capacidades operativas válidas.
- **No reemplazar implementaciones funcionales sin justificación:** Si una función opera correctamente y cumple su cometido, no debe sustituirse por preferencias estéticas.
- **No alterar contratos públicos sin evaluar dependencias:** No modificar interfaces de tipos, firmas de funciones ni esquemas sin actualizar y validar a todos sus consumidores.
- **No eliminar ni debilitar pruebas para conseguir resultados positivos:** Las pruebas jamás deben alterarse para ocultar defectos reales.
- **No desactivar validaciones de seguridad:** No omitir controles de autorización, filtros de colegio, sanitizaciones ni comprobaciones de rol.
- **No utilizar `any` para ocultar problemas de TypeScript:** Todo tipo debe modelarse con precisión o utilizar genéricos seguros y tipos de unión discriminada.
- **No introducir datos ficticios en producción:** No sembrar datos de prueba o inventados en bases de datos productivas.
- **No modificar esquemas productivos directamente:** Las alteraciones de base de datos deben realizarse mediante migraciones versionadas y probadas.
- **No exponer credenciales:** No colocar claves secretas, contraseñas, tokens de servicio ni credenciales en código, logs ni documentación.
- **No realizar cambios masivos innecesarios:** Mantener las modificaciones acotadas y proporcionales al problema planteado.
- **No declarar pruebas aprobadas sin ejecutarlas:** Toda afirmación de éxito debe estar respaldada por la ejecución real del comando de prueba en el entorno.
- **No modificar configuraciones de producción sin autorización:** Toda acción destructiva o de riesgo crítico requiere confirmación.

---

## 4. Criterio de Finalización

Ninguna tarea se considerará concluida ni entregable al usuario si no cumple con la totalidad de los siguientes requisitos:

1. **Cambio implementado:** La solución solicitada está completamente programada e integrada.
2. **Comportamiento anterior preservado:** Las funcionalidades existentes del sistema se mantienen 100% operativas sin regresión.
3. **Pruebas pertinentes aprobadas:** La suite completa de pruebas unitarias, de integración y de regresión local pasa en verde (`0` fallos).
4. **Verificación de seguridad:** Se comprobó el aislamiento multitenant por colegio, el control de roles y la protección de datos sensibles.
5. **Revisión de dependencias afectadas:** Se verificó que ningún consumidor de contratos públicos haya quedado inconsistente.
6. **Documentación actualizada:** Se actualizó `MEMORY.md` y/o la documentación técnica si se tomó una decisión arquitectónica o de negocio relevante.
7. **Riesgos residuales identificados:** Se documentaron con transparencia las limitaciones técnicas, dependencias externas o validaciones pendientes.
8. **Resumen de archivos modificados:** Se entregó un reporte claro y conciso de los archivos alterados y las razones técnicas de cada cambio.
9. **Despliegue a producción ejecutado:** El cambio validado se sube a la rama `main` en GitHub (`git push origin main`), activando el despliegue automático en Vercel.
10. **Verificación en producción aprobada:** Se realizan las pruebas pertinentes directamente en el entorno de producción en vivo (`https://gestion-almuerzos-six.vercel.app`), confirmando respuesta HTTP 200 y reflejo en los bundles productivos.

---

## 5. Sistema de Memoria y Catálogo de Skills Obligatorias

El agente debe consultar permanentemente:

- **`MEMORY.md`**: Registro persistente de decisiones arquitectónicas y de negocio confirmadas por el usuario.
- **Catálogo de 13 Skills Maestras (`skills/`)**:
  1. `skills/design-system/SKILL.md`: Sistema de diseño maestro, tokens, componentes, tablas, filtros y directivas UI/UX basadas en `DESIGN.md`.
  2. `skills/coding-standards/SKILL.md`: Estándares de codificación limpia, TypeScript estricto y patrones SOLID.
  3. `skills/nextjs-react-architecture/SKILL.md`: Arquitectura Next.js App Router, componentes de servidor/cliente y rendimiento.
  4. `skills/security-standards/SKILL.md`: Estándares OWASP, control de roles, protección IDOR/BOLA y seguridad de comprobantes.
  5. `skills/supabase-postgresql/SKILL.md`: Integridad de datos en PostgreSQL, políticas RLS, transacciones y migraciones seguras.
  6. `skills/business-rules/SKILL.md`: Reglas del negocio de Placeres Culinarios (horarios 09:30 AM, zona horaria Perú, pagos y fiados).
  7. `skills/testing-and-qa/SKILL.md`: Metodología exhaustiva de testing, pirámide de pruebas y aseguramiento de calidad.
  8. `skills/regression-prevention/SKILL.md`: Procedimiento obligatorio de análisis de impacto y prevención de regresiones.
  9. `skills/performance-optimization/SKILL.md`: Optimización de consultas, paginación, control de Realtime y prevención de fugas de memoria.
  10. `skills/deployment-and-devops/SKILL.md`: Procedimientos de despliegue controlado, compilación de producción y planes de rollback.
  11. `skills/iso-quality-and-compliance/SKILL.md`: Alineación con ISO/IEC 25010, 25023, 27001, 27034 y 29119.
  12. `skills/professional-engineering-workflow/SKILL.md`: Flujo de ingeniería transversal de 10 pasos para todas las tareas.
  13. `skills/data-privacy-and-school-safety/SKILL.md`: Protección de datos personales de menores, DNI, teléfonos y notas médicas/alergias.
