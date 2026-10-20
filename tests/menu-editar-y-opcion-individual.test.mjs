import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Menú: Edición de Platos, Opciones Individuales y Fotos Agrandadas en Padres', () => {
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const adminMenuTabPath = path.resolve(process.cwd(), 'src/app/admin/components/AdminMenuSemanalTab.tsx');
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');
  const padresPagePath = path.resolve(process.cwd(), 'src/app/padres/page.tsx');

  test('1. dataService exporta actualizarPlato con soporte para Cloudinary y persistencia Supabase', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      dataServiceContent.includes('async actualizarPlato(id: string, platoData: Partial<Plato>): Promise<Plato>') ||
      dataServiceContent.includes('actualizarPlato(id: string, platoData: Partial<Plato>)'),
      'dataService debe definir el método actualizarPlato con tipado estricto'
    );

    assert.ok(
      dataServiceContent.includes('subirImagenACloudinary') &&
      dataServiceContent.includes('obtenerCarpetaCloudinaryPlato'),
      'actualizarPlato debe soportar subida a Cloudinary estructurada si se proporciona nueva imagen en Base64'
    );

    assert.ok(
      dataServiceContent.includes('supabase.from(\'platos\').update'),
      'actualizarPlato debe persistir los cambios en la tabla platos de Supabase'
    );

    assert.ok(
      dataServiceContent.includes('notifyListeners()'),
      'actualizarPlato debe notificar a los listeners en tiempo real'
    );
  });

  test('2. AdminMenuSemanalTab define props e interfaz para edición de platos', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    assert.ok(
      tabContent.includes('platoEditando?: Plato | null;') || tabContent.includes('platoEditando: Plato | null;'),
      'AdminMenuSemanalTabProps debe tener la prop platoEditando'
    );
    assert.ok(
      tabContent.includes('onIniciarEditarPlato'),
      'AdminMenuSemanalTabProps debe tener onIniciarEditarPlato'
    );
    assert.ok(
      tabContent.includes('onGuardarEdicionPlato'),
      'AdminMenuSemanalTabProps debe tener onGuardarEdicionPlato'
    );
  });

  test('3. AdminMenuSemanalTab incluye botón de editar (Pencil) en cards y modal de edición', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Botones con Pencil en cards
    assert.ok(
      tabContent.includes('onIniciarEditarPlato(plato)') && tabContent.includes('<Pencil'),
      'Las tarjetas de platos deben incluir botón Pencil que invoque onIniciarEditarPlato'
    );

    // Modal de edición presente
    assert.ok(
      tabContent.includes('platoEditando && (') || tabContent.includes('platoEditando &&'),
      'Debe renderizarse el modal cuando platoEditando esté activo'
    );
    assert.ok(
      tabContent.includes('Editar Plato del Menú') || tabContent.includes('Editar Plato'),
      'El modal debe contener el título de edición'
    );
    assert.ok(
      tabContent.includes('Guardar Cambios'),
      'El modal debe incluir el botón para Guardar Cambios'
    );
  });

  test('4. Formulario de creación permite registrar opciones individuales sin bloquear con required', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Comprobar que los inputs de nombre de entrada y segundo NO tienen atributo required
    const entradaInputRegex = /id="nombre-entrada-menu"[^>]*required/;
    const segundoInputRegex = /id="nombre-segundo-menu"[^>]*required/;

    assert.ok(
      !entradaInputRegex.test(tabContent),
      'El campo nombre-entrada-menu no debe tener el atributo HTML required'
    );
    assert.ok(
      !segundoInputRegex.test(tabContent),
      'El campo nombre-segundo-menu no debe tener el atributo HTML required'
    );

    // Comprobar textos descriptivos de opcionalidad
    assert.ok(
      tabContent.includes('(Opcional si solo agregas segundo)') || tabContent.includes('Opcional si solo agregas'),
      'Debe indicar que la entrada es opcional si solo se agrega segundo'
    );
    assert.ok(
      tabContent.includes('(Opcional si solo agregas sopa/ensalada)') || tabContent.includes('Opcional si solo agregas'),
      'Debe indicar que el segundo es opcional si solo se agrega sopa o ensalada'
    );
  });

  test('5. admin/page.tsx maneja creación individual en handleCrearMenuCompleto y flujo de edición', () => {
    const pageContent = fs.readFileSync(adminPagePath, 'utf-8');

    // Flexibilidad de creación individual
    assert.ok(
      pageContent.includes('const tieneEntrada = Boolean(nombreEntradaMenu.trim());') &&
      pageContent.includes('const tieneSegundo = Boolean(nombreSegundoMenu.trim());'),
      'handleCrearMenuCompleto debe evaluar independientemente si hay entrada y si hay segundo'
    );
    assert.ok(
      pageContent.includes('if (!tieneEntrada && !tieneSegundo)'),
      'Solo debe validar error si ambos campos están vacíos'
    );

    // Handlers de edición
    assert.ok(
      pageContent.includes('handleIniciarEditarPlato') &&
      pageContent.includes('handleGuardarEdicionPlato'),
      'admin/page.tsx debe tener handleIniciarEditarPlato y handleGuardarEdicionPlato'
    );
    assert.ok(
      pageContent.includes('dataService.actualizarPlato('),
      'handleGuardarEdicionPlato debe invocar dataService.actualizarPlato'
    );
  });

  test('6. Padres: Tarjetas en Pedir Menú muestran fotos más grandes con aspecto destacado', () => {
    const padresContent = fs.readFileSync(padresPagePath, 'utf-8');

    // En lugar del viejo thumbnail 'w-14 h-14'
    // Comprobar que en Pedir Menú las fotos usan alturas ampliadas (h-40, h-44, h-48)
    assert.ok(
      padresContent.includes('h-40 sm:h-48') || padresContent.includes('h-44 sm:h-52'),
      'En Pedir Menú las fotos de platos deben tener alturas ampliadas (h-40/h-48/h-52)'
    );

    // En pestaña Ver Menú también deben mostrarse grandes
    assert.ok(
      padresContent.includes('h-48 sm:h-56') || padresContent.includes('h-44 sm:h-52'),
      'En Ver Menú las fotos deben tener dimensiones destacadas (h-44 a h-56)'
    );
  });
});
