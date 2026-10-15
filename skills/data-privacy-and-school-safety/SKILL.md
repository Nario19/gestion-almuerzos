---
name: data-privacy-and-school-safety
description: Protección de datos personales de menores de edad, privacidad escolar, notas médicas/alergias y cumplimiento normativo en Placeres Culinarios.
---

# SKILL 12 — DATA PRIVACY AND SCHOOL SAFETY

## Objetivo
Garantizar la protección irrestricta de los datos personales de estudiantes menores de edad, tutores legales e instituciones educativas, aplicando el principio de Privacidad desde el Diseño (Privacy by Design) y alineándose con la legislación peruana aplicable (Ley N° 29733 — Ley de Protección de Datos Personales).

---

## 1. Protección Especial de Datos de Menores de Edad

- **Categoría Especial:** Los datos de escolares (nombres completos, grados, secciones y colegios) requieren el máximo nivel de cuidado y confidencialidad.
- **Acceso Estrictamente Autorizado:**
  - Solo el padre o tutor registrado puede consultar o administrar los datos de sus hijos.
  - El personal administrativo escolar y de cocina accede a los nombres y grados de los alumnos únicamente en la medida necesaria para la preparación y entrega física del almuerzo.
- **Prohibición de Indexación Pública:** Ninguna lista de estudiantes ni pedidos debe ser accesible públicamente sin autenticación previa.

---

## 2. Tratamiento de Alergias y Datos Médicos / Sensibles

- **Disponibilidad para Personal Autorizado:** Las notas de alergias, intolerancias alimentarias y condiciones médicas son críticas para la salud del alumno. Deben mostrarse de forma destacada y sin pérdidas en los paneles de **Cocina** y **Despacho**.
- **Restricción a Terceros:** Jamás exponer alergias o notas médicas a otros padres o usuarios no involucrados en la preparación y entrega de los alimentos.
- **Preservación Invariable:** En ninguna circunstancia una actualización de estado de entrega o pago puede limpiar, truncar o sobrescribir el campo de observaciones o alergias.

---

## 3. Protección de Identificadores y Contacto (DNI, Teléfonos y Comprobantes)

- **DNI y Teléfonos:** Utilizados estrictamente para fines de autenticación y contacto operativo directo vía WhatsApp ante incidencias en la entrega o coordinación de fiados. No deben exponerse en URLs ni en logs de depuración del servidor.
- **Comprobantes Bancarios:** Las capturas de comprobantes de pago de Yape/Plin contienen datos bancarios y números telefónicos. Deben ser accesibles únicamente por los administradores de despacho y el superadmin para verificar transferencias.
- **Prohibición de Datos Sensibles en Logs:** Queda terminantemente prohibido imprimir contraseñas, números de tarjeta, tokens de sesión o datos médicos en `console.log()` en entornos de producción.

---

## 4. Seguridad en Exportaciones e Informes

- **Sanitización de Archivos Exportados:** Los archivos Excel o PDF descargados por administración deben generarse bajo demanda, protegerse contra inyección de fórmulas CSV y descargarse a través de conexiones cifradas HTTPS.
- **Retención y Eliminación Responsable:** Al eliminar la cuenta de un padre o desvincular a un estudiante, los registros históricos contables se conservan para auditoría fiscal pero se desvinculan de accesos operativos activos.
