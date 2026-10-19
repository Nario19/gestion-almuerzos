import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Verificación de Sigla de Colegio Personalizada y Validación Obligatoria de Comprobante para Yape/Plin', async (t) => {
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  const superadminPath = path.join(rootDir, 'src', 'app', 'superadmin', 'page.tsx');
  const superadminContent = fs.readFileSync(superadminPath, 'utf-8');

  const padresPath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const padresContent = fs.readFileSync(padresPath, 'utf-8');

  const typesPath = path.join(rootDir, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  await t.test('1. ColegioDetallado define sigla?: string', () => {
    assert.ok(
      typesContent.includes('sigla?: string;'),
      'ColegioDetallado debe incluir el atributo opcional sigla'
    );
  });

  await t.test('2. dataService: obtenerIdentificadorColegio no contiene nombres de colegios quemados con if y soporta siglas dinámicas', () => {
    // Verificar que no existen los 5 if quemados en el código de la función
    assert.ok(
      !dataServiceContent.includes("if (normalizado.includes('claretiano'))"),
      'No debe tener if quemado para claretiano'
    );
    assert.ok(
      !dataServiceContent.includes("if (normalizado.includes('san agustin')"),
      'No debe tener if quemado para san agustin'
    );
    assert.ok(
      !dataServiceContent.includes("if (normalizado.includes('santa rosa'))"),
      'No debe tener if quemado para santa rosa'
    );
    assert.ok(
      !dataServiceContent.includes("if (normalizado.includes('la salle'))"),
      'No debe tener if quemado para la salle'
    );
    assert.ok(
      !dataServiceContent.includes("if (normalizado.includes('inmaculada'))"),
      'No debe tener if quemado para inmaculada'
    );

    // Verificar que la función consulta siglasPorColegioMemoria y colegiosDetalladosMemoria
    assert.ok(
      dataServiceContent.includes('siglasPorColegioMemoria'),
      'dataService debe registrar siglasPorColegioMemoria'
    );
    assert.ok(
      dataServiceContent.includes('colDet?.sigla'),
      'obtenerIdentificadorColegio debe consultar la sigla del colegio si está configurada'
    );
  });

  await t.test('3. dataService: crearColegioConAdmin y actualizarColegioConAdmin procesan y persisten sigla', () => {
    assert.ok(
      dataServiceContent.includes('sigla?: string'),
      'crearColegioConAdmin debe aceptar sigla'
    );
    assert.ok(
      dataServiceContent.includes('siglaLimpia'),
      'crearColegioConAdmin debe limpiar y normalizar la sigla'
    );
    assert.ok(
      dataServiceContent.includes('cfgObj.siglasColegio'),
      'dataService debe persistir las siglas en config de menus_dia (SABADO)'
    );
  });

  await t.test('4. En /superadmin: Formulario y tarjeta incluyen Sigla del Colegio', () => {
    assert.ok(
      superadminContent.includes('siglaColegio'),
      'Superadmin debe tener el estado siglaColegio'
    );
    assert.ok(
      superadminContent.includes('Sigla del Colegio (Identificador)'),
      'El modal de Superadmin debe tener el campo Sigla del Colegio'
    );
    assert.ok(
      superadminContent.includes('#{col.sigla || obtenerIdentificadorColegio(col.nombre)}'),
      'La tarjeta de colegio en Superadmin debe mostrar el badge de la sigla'
    );
  });

  await t.test('5. En /padres: Validación estricta de comprobante para Yape y Plin', () => {
    assert.ok(
      padresContent.includes("metodoPago === 'Yape' || metodoPago === 'Plin'"),
      'padres/page.tsx debe discriminar Yape y Plin'
    );
    assert.ok(
      padresContent.includes('Para pagos con ${metodoPago} es obligatorio adjuntar la captura del comprobante de pago.') ||
      padresContent.includes('es obligatorio adjuntar la captura del comprobante'),
      'Debe mostrar mensaje de validación obligatoria para comprobantes de Yape y Plin'
    );
    assert.ok(
      padresContent.includes("Obligatorio ({metodoPago})"),
      'El label del input de comprobante debe indicar Obligatorio para Yape/Plin'
    );
  });

  await t.test('6. En /padres: Modalidad Pagar luego permite confirmación sin comprobante', () => {
    assert.ok(
      padresContent.includes("Modalidad: Pagar luego"),
      'El modal debe indicar que en Pagar luego no se requiere comprobante previo'
    );
    assert.ok(
      padresContent.includes("metodoPago === 'Pagar luego'"),
      'Debe permitir confirmar directamente con Pagar luego'
    );
  });
});
