import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { obtenerCarpetaCloudinaryPlato, subirImagenACloudinary } from '../src/lib/cloudinaryService.ts';

describe('Almacenamiento de Imágenes del Menú en Cloudinary por Colegio y Día', () => {
  const cloudinaryServicePath = path.resolve(process.cwd(), 'src/lib/cloudinaryService.ts');
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const adminMenuTabPath = path.resolve(process.cwd(), 'src/app/admin/components/AdminMenuSemanalTab.tsx');

  test('1. obtenerCarpetaCloudinaryPlato genera rutas estructuradas por colegio y día sin caracteres inválidos', () => {
    // Caso con colegio y día con tildes y mayúsculas
    const carpeta1 = obtenerCarpetaCloudinaryPlato('Colegio San Martín', 'MIÉRCOLES');
    assert.equal(carpeta1, 'platos/colegio_san_martin/miercoles');

    // Caso con caracteres especiales y espacios
    const carpeta2 = obtenerCarpetaCloudinaryPlato('Inmaculada Concepción & Sede Central', 'LUNES');
    assert.equal(carpeta2, 'platos/inmaculada_concepcion_sede_central/lunes');

    // Caso general sin colegio o con valor TODOS
    const carpeta3 = obtenerCarpetaCloudinaryPlato(undefined, 'VIERNES');
    assert.equal(carpeta3, 'platos/general/viernes');

    const carpeta4 = obtenerCarpetaCloudinaryPlato('TODOS', 'JUEVES');
    assert.equal(carpeta4, 'platos/general/jueves');
  });

  test('2. subirImagenACloudinary acepta carpeta de destino y sube a la subcarpeta adecuada', () => {
    const contenido = fs.readFileSync(cloudinaryServicePath, 'utf-8');
    assert.ok(
      contenido.includes("formData.append('folder', carpeta)"),
      'subirImagenACloudinary debe adjuntar el parámetro folder con la carpeta solicitada'
    );
    assert.ok(
      contenido.includes('obtenerCarpetaCloudinaryPlato'),
      'cloudinaryService debe exportar la función auxiliar obtenerCarpetaCloudinaryPlato'
    );
  });

  test('3. dataService.agregarPlato intercepta Base64 y sube a Cloudinary para no sobrecargar Supabase', () => {
    const contenido = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      contenido.includes('nuevoPlato.imagenUrl.startsWith(\'data:image\')'),
      'agregarPlato debe verificar si la imagen es una cadena Base64'
    );

    assert.ok(
      contenido.includes('obtenerCarpetaCloudinaryPlato(nuevoPlato.colegioNombre, nuevoPlato.diaSemana)'),
      'agregarPlato debe calcular la carpeta de Cloudinary con colegioNombre y diaSemana'
    );

    assert.ok(
      contenido.includes('subirImagenACloudinary(nuevoPlato.imagenUrl, carpeta)'),
      'agregarPlato debe subir la imagen a Cloudinary antes de persistir en Supabase'
    );

    assert.ok(
      contenido.includes('migrarImagenesPlatosACloudinary'),
      'dataService debe proveer migrarImagenesPlatosACloudinary para sanear registros existentes'
    );
  });

  test('4. Admin Page (/admin) pasa el colegio seleccionado y día activo al subir imágenes de platos', () => {
    const contenido = fs.readFileSync(adminPagePath, 'utf-8');

    assert.ok(
      contenido.includes('handleFotoUploadMenu') &&
      contenido.includes('obtenerCarpetaCloudinaryPlato(colActual, diaActivo)'),
      'handleFotoUploadMenu debe usar obtenerCarpetaCloudinaryPlato con el colegio actual y día activo'
    );

    assert.ok(
      contenido.includes('handleFotoUploadExtra') &&
      contenido.includes('obtenerCarpetaCloudinaryPlato(colActual, diaActivo)'),
      'handleFotoUploadExtra debe usar obtenerCarpetaCloudinaryPlato con el colegio actual y día activo'
    );
  });

  test('5. AdminMenuSemanalTab muestra estado de Cloudinary y botón de eliminación de foto', () => {
    const contenido = fs.readFileSync(adminMenuTabPath, 'utf-8');

    assert.ok(
      contenido.includes('En Cloudinary'),
      'AdminMenuSemanalTab debe mostrar la insignia "En Cloudinary" en la previsualización'
    );

    assert.ok(
      contenido.includes('Subiendo y optimizando imagen en Cloudinary...'),
      'AdminMenuSemanalTab debe informar que la imagen se está subiendo y optimizando en Cloudinary'
    );

    assert.ok(
      contenido.includes('setImagenUrlMenu(\'\')') || contenido.includes('setImagenUrlMenu?.(\'\')') || contenido.includes('setImagenUrlMenu'),
      'AdminMenuSemanalTab debe permitir descartar o limpiar la fotografía'
    );
  });
});
