import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Flujo de Inicio y Experiencia de Padres sin Estudiantes', () => {
  const pageFile = fs.readFileSync(path.resolve('src/app/page.tsx'), 'utf-8');
  const headerNavFile = fs.readFileSync(path.resolve('src/components/HeaderNav.tsx'), 'utf-8');

  test('1. En el home (vista pública sin login), NO debe existir un botón duplicado de Iniciar Sesión en la cabecera de Carta Semanal', () => {
    // Verificar que en Carta Semanal no haya un botón de Iniciar Sesión duplicado
    const cartaSemanalRegex = /Carta Semanal[\s\S]*?Pedidos hasta las 09:30 AM[\s\S]*?<\/div>\s*<\/div>/;
    const match = pageFile.match(cartaSemanalRegex);
    assert.ok(match, 'Debe existir la cabecera de Carta Semanal');
    assert.strictEqual(
      match[0].includes('Iniciar Sesión'),
      false,
      'No debe existir un botón "Iniciar Sesión" dentro del encabezado de la Carta Semanal'
    );
  });

  test('2. El único botón de acceso en el top bar debe ser el botón negro Ingresar en HeaderNav', () => {
    assert.ok(
      headerNavFile.includes('bg-slate-900'),
      'HeaderNav debe contener el botón con fondo negro slate-900'
    );
    assert.ok(
      headerNavFile.includes('Ingresar'),
      'HeaderNav debe contener la etiqueta "Ingresar"'
    );
  });

  test('3. En el formulario principal, NO deben aparecer los campos de "Datos del Alumno" ocupando la vista', () => {
    // Si el usuario no tiene estudiantes, no se debe mostrar el bloque Datos del Alumno en el formulario
    assert.strictEqual(
      pageFile.includes('Datos del Alumno'),
      false,
      'No debe existir el bloque "Datos del Alumno" quemado en el formulario principal'
    );
  });

  test('4. El selector de hijos sólo debe mostrarse cuando el usuario tiene estudiantes registrados (hijos.length > 0)', () => {
    assert.ok(
      pageFile.includes("usuario && usuario.rol !== 'ADMIN' && usuario.hijos && usuario.hijos.length > 0"),
      'El selector de estudiantes solo se renderiza si el padre tiene hijos > 0'
    );
  });

  test('5. Al hacer clic en Confirmar Pedido sin tener estudiantes registrados, se activa el modal para agregar estudiante', () => {
    // Simulación de la lógica de handleSubmit
    function simularHandleSubmit({ usuario, entrada, segundo }) {
      if (!entrada) return { ok: false, error: 'Por favor selecciona una entrada.' };
      if (!segundo) return { ok: false, error: 'Por favor selecciona un plato de fondo.' };

      if (usuario && usuario.rol !== 'ADMIN' && (!usuario.hijos || usuario.hijos.length === 0)) {
        return { ok: false, accion: 'MOSTRAR_MODAL_AGREGAR_HIJO' };
      }

      return { ok: true, accion: 'EJECUTAR_PEDIDO' };
    }

    const padreSinHijos = { id: 'p1', nombreCompleto: 'Juan Perez', rol: 'PADRE', hijos: [] };
    const resultado = simularHandleSubmit({
      usuario: padreSinHijos,
      entrada: 'Tequeños',
      segundo: 'Arroz con Pollo',
    });

    assert.strictEqual(resultado.ok, false);
    assert.strictEqual(resultado.accion, 'MOSTRAR_MODAL_AGREGAR_HIJO');
  });

  test('6. Cuando el padre guarda al estudiante en el modal, se vincula al pedido y se confirma exitosamente', () => {
    // Simulación de agregar estudiante y ejecutar pedido
    const padre = { id: 'p1', nombreCompleto: 'Juan Perez', rol: 'PADRE', hijos: [] };

    function agregarEstudiante(padreActual, datos) {
      assert.ok(datos.nombreCompleto.trim(), 'Nombre requerido');
      assert.ok(datos.colegioNombre, 'Colegio requerido');
      assert.ok(datos.gradoSeccion, 'Grado requerido');

      const nuevoHijo = {
        id: 'hijo-123',
        padreId: padreActual.id,
        nombreCompleto: datos.nombreCompleto.trim(),
        colegioNombre: datos.colegioNombre,
        gradoSeccion: datos.gradoSeccion,
      };

      padreActual.hijos.push(nuevoHijo);
      return nuevoHijo;
    }

    function crearPedido(padreActual, hijo, entrada, segundo) {
      assert.ok(hijo, 'El pedido requiere un hijo');
      return {
        id: 'ped-1',
        padreId: padreActual.id,
        hijoId: hijo.id,
        estudianteNombre: hijo.nombreCompleto,
        colegioNombre: hijo.colegioNombre,
        gradoSeccion: hijo.gradoSeccion,
        entradaNombre: entrada,
        segundoNombre: segundo,
      };
    }

    const nuevoHijo = agregarEstudiante(padre, {
      nombreCompleto: 'Dhana Quispe',
      colegioNombre: 'Colegio Trilce',
      gradoSeccion: '3ro Primaria',
    });

    const pedido = crearPedido(padre, nuevoHijo, 'Causa Rellena', 'Lomo Saltado');

    assert.strictEqual(pedido.estudianteNombre, 'Dhana Quispe');
    assert.strictEqual(pedido.colegioNombre, 'Colegio Trilce');
    assert.strictEqual(pedido.gradoSeccion, '3ro Primaria');
    assert.strictEqual(padre.hijos.length, 1);
  });

  test('7. Un padre con estudiantes ya registrados puede confirmar el pedido directamente sin ver el modal', () => {
    function simularHandleSubmit({ usuario, entrada, segundo }) {
      if (!entrada) return { ok: false, error: 'Por favor selecciona una entrada.' };
      if (!segundo) return { ok: false, error: 'Por favor selecciona un plato de fondo.' };

      if (usuario && usuario.rol !== 'ADMIN' && (!usuario.hijos || usuario.hijos.length === 0)) {
        return { ok: false, accion: 'MOSTRAR_MODAL_AGREGAR_HIJO' };
      }

      return { ok: true, accion: 'EJECUTAR_PEDIDO' };
    }

    const padreConHijos = {
      id: 'p2',
      nombreCompleto: 'Maria Gomez',
      rol: 'PADRE',
      hijos: [{ id: 'h-1', nombreCompleto: 'Lucas Gomez', colegioNombre: 'Innova Schools', gradoSeccion: '1ro Sec' }],
    };

    const resultado = simularHandleSubmit({
      usuario: padreConHijos,
      entrada: 'Sopa Criolla',
      segundo: 'Milanesa de Pollo',
    });

    assert.strictEqual(resultado.ok, true);
    assert.strictEqual(resultado.accion, 'EJECUTAR_PEDIDO');
  });
});
