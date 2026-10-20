import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Imágenes Independientes para Entrada (Sopa o Ensalada) y Segundo en Menú del Día', () => {
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const adminMenuTabPath = path.resolve(process.cwd(), 'src/app/admin/components/AdminMenuSemanalTab.tsx');

  test('1. AdminMenuSemanalTabProps define propiedades tipadas independientes para foto de Entrada y Segundo', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Props de Entrada
    assert.ok(
      tabContent.includes('imagenUrlEntradaMenu?: string') || tabContent.includes('imagenUrlEntradaMenu: string'),
      'AdminMenuSemanalTabProps debe incluir imagenUrlEntradaMenu'
    );
    assert.ok(
      tabContent.includes('handleFotoUploadEntradaMenu'),
      'AdminMenuSemanalTabProps debe incluir handleFotoUploadEntradaMenu'
    );

    // Props de Segundo
    assert.ok(
      tabContent.includes('imagenUrlSegundoMenu?: string') || tabContent.includes('imagenUrlSegundoMenu: string'),
      'AdminMenuSemanalTabProps debe incluir imagenUrlSegundoMenu'
    );
    assert.ok(
      tabContent.includes('handleFotoUploadSegundoMenu'),
      'AdminMenuSemanalTabProps debe incluir handleFotoUploadSegundoMenu'
    );
  });

  test('2. Formulario de Menú en AdminMenuSemanalTab tiene upload independiente en Sección 1 (Sopa o Ensalada)', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    assert.ok(
      tabContent.includes('Fotografía de la {subtipoEntradaMenu} (Opcional)') ||
      tabContent.includes('Fotografía de la sopa o ensalada') ||
      tabContent.includes('Fotografía de la'),
      'La sección 1 debe incluir su propio campo para subir fotografía'
    );

    assert.ok(
      tabContent.includes('handleFotoUploadEntradaMenu'),
      'El input de la sección 1 debe estar conectado a handleFotoUploadEntradaMenu'
    );

    assert.ok(
      tabContent.includes('imagenUrlEntradaMenu') &&
      tabContent.includes('En Cloudinary'),
      'La previsualización de la entrada debe mostrar el badge de Cloudinary'
    );
  });

  test('3. Formulario de Menú en AdminMenuSemanalTab tiene upload independiente en Sección 2 (Segundo)', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    assert.ok(
      tabContent.includes('Fotografía del Segundo (Opcional)') || tabContent.includes('Fotografía del Segundo'),
      'La sección 2 debe incluir su propio campo para subir fotografía del segundo'
    );

    assert.ok(
      tabContent.includes('handleFotoUploadSegundoMenu'),
      'El input de la sección 2 debe estar conectado a handleFotoUploadSegundoMenu'
    );

    assert.ok(
      tabContent.includes('imagenUrlSegundoMenu') &&
      tabContent.includes('En Cloudinary'),
      'La previsualización del segundo debe mostrar el badge de Cloudinary'
    );
  });

  test('4. En src/app/admin/page.tsx existen estados separados y handlers para Entrada y Segundo', () => {
    const pageContent = fs.readFileSync(adminPagePath, 'utf-8');

    assert.ok(
      pageContent.includes('const [imagenUrlEntradaMenu, setImagenUrlEntradaMenu] = useState'),
      'admin/page.tsx debe tener el estado imagenUrlEntradaMenu'
    );

    assert.ok(
      pageContent.includes('const [imagenUrlSegundoMenu, setImagenUrlSegundoMenu] = useState'),
      'admin/page.tsx debe tener el estado imagenUrlSegundoMenu'
    );

    assert.ok(
      pageContent.includes('handleFotoUploadEntradaMenu') &&
      pageContent.includes('obtenerCarpetaCloudinaryPlato(colActual, diaActivo)'),
      'handleFotoUploadEntradaMenu debe calcular la subcarpeta de Cloudinary'
    );

    assert.ok(
      pageContent.includes('handleFotoUploadSegundoMenu') &&
      pageContent.includes('obtenerCarpetaCloudinaryPlato(colActual, diaActivo)'),
      'handleFotoUploadSegundoMenu debe calcular la subcarpeta de Cloudinary'
    );
  });

  test('5. handleCrearMenuCompleto asigna imágenes independientes a Entrada y Segundo y resetea ambos estados', () => {
    const pageContent = fs.readFileSync(adminPagePath, 'utf-8');

    // Entrada recibe imagenUrl de entrada
    assert.ok(
      pageContent.includes('tipo: \'ENTRADA\'') &&
      pageContent.includes('imagenUrl: imagenUrlEntradaMenu'),
      'La entrada debe crearse con la imagen asignada a la sopa o ensalada'
    );

    // Segundo recibe imagenUrl de segundo
    assert.ok(
      pageContent.includes('tipo: \'SEGUNDO\'') &&
      pageContent.includes('imagenUrl: imagenUrlSegundoMenu'),
      'El segundo debe crearse con la imagen asignada al segundo plato'
    );

    // Ambos estados se resetean
    assert.ok(
      pageContent.includes('setImagenUrlEntradaMenu(\'\')') &&
      pageContent.includes('setImagenUrlSegundoMenu(\'\')'),
      'Ambos estados de imagen deben resetearse al publicar el menú completo'
    );
  });
});
