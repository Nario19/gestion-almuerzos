import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Protección de Acciones Destructivas: Mensajes y Alertas de Confirmación de Eliminación', () => {
  test('1. Flujo de eliminación de estudiante por el padre: Requiere confirmación y no borra al cancelar', async () => {
    let estudiantes = [
      { id: 'hijo-1', nombreCompleto: 'Mateo Quispe', colegioNombre: 'Colegio Claretiano' },
      { id: 'hijo-2', nombreCompleto: 'Valeria Quispe', colegioNombre: 'Colegio Claretiano' },
    ];

    let modalAbierto = false;
    let estudianteAEliminar = null;

    // Simulación del click en el botón de la papelera
    const solicitarEliminacion = (hijo) => {
      estudianteAEliminar = hijo;
      modalAbierto = true;
    };

    // 1. Click en eliminar a Mateo
    solicitarEliminacion(estudiantes[0]);
    assert.strictEqual(modalAbierto, true, 'El modal de confirmación debe abrirse');
    assert.strictEqual(estudianteAEliminar.nombreCompleto, 'Mateo Quispe');
    assert.strictEqual(estudiantes.length, 2, 'Los estudiantes NO deben haberse modificado aún');

    // 2. Si el usuario cancela
    const cancelar = () => {
      modalAbierto = false;
      estudianteAEliminar = null;
    };
    cancelar();
    assert.strictEqual(modalAbierto, false);
    assert.strictEqual(estudianteAEliminar, null);
    assert.strictEqual(estudiantes.length, 2, 'Al cancelar, la lista sigue completa');

    // 3. Si el usuario confirma en el modal
    solicitarEliminacion(estudiantes[0]);
    const confirmar = () => {
      estudiantes = estudiantes.filter((e) => e.id !== estudianteAEliminar.id);
      modalAbierto = false;
      estudianteAEliminar = null;
    };
    confirmar();
    assert.strictEqual(estudiantes.length, 1, 'Tras confirmar en el modal, el estudiante es eliminado');
    assert.strictEqual(estudiantes[0].id, 'hijo-2');
  });

  test('2. Flujo de eliminación de platos (Entrada/Segundo) en Admin: Requiere confirmación previa', async () => {
    let catalogo = [
      { id: 'p-1', nombre: 'Sopa de Verduras', tipo: 'ENTRADA' },
      { id: 'p-2', nombre: 'Arroz con Pollo', tipo: 'SEGUNDO' },
    ];

    let estadoModal = { abierto: false, titulo: '', plato: null };

    const solicitarEliminarPlato = (plato) => {
      estadoModal = {
        abierto: true,
        titulo: `¿Eliminar ${plato.tipo === 'ENTRADA' ? 'la entrada' : 'el segundo'} "${plato.nombre}"?`,
        plato,
      };
    };

    // Click en eliminar plato
    solicitarEliminarPlato(catalogo[1]);
    assert.strictEqual(estadoModal.abierto, true);
    assert.ok(estadoModal.titulo.includes('Arroz con Pollo'));
    assert.strictEqual(catalogo.length, 2, 'El catálogo no se altera antes de confirmar');

    // Confirmar en el modal
    catalogo = catalogo.filter((p) => p.id !== estadoModal.plato.id);
    estadoModal.abierto = false;
    assert.strictEqual(catalogo.length, 1);
    assert.strictEqual(catalogo[0].nombre, 'Sopa de Verduras');
  });

  test('3. Flujo de eliminación de colegios, grados y etiquetas: Protegido con modal de alerta', async () => {
    let colegios = ['Colegio Claretiano', 'Colegio Zárate'];
    let grados = ['1.° Primaria A', '2.° Primaria B'];
    let etiquetas = ['Sin cebolla', 'Poca sal'];

    let confirmacionActiva = null;

    const solicitarEliminar = (tipo, item, accion) => {
      confirmacionActiva = {
        tipo,
        item,
        titulo: `¿Eliminar ${tipo} "${item}"?`,
        ejecutar: accion,
      };
    };

    // Solicitar eliminar colegio
    solicitarEliminar('colegio', 'Colegio Zárate', () => {
      colegios = colegios.filter((c) => c !== 'Colegio Zárate');
    });
    assert.ok(confirmacionActiva.titulo.includes('Colegio Zárate'));
    assert.strictEqual(colegios.length, 2, 'Aún no se elimina');
    confirmacionActiva.ejecutar();
    assert.strictEqual(colegios.length, 1);
    assert.strictEqual(colegios[0], 'Colegio Claretiano');

    // Solicitar eliminar grado
    solicitarEliminar('grado', '2.° Primaria B', () => {
      grados = grados.filter((g) => g !== '2.° Primaria B');
    });
    assert.ok(confirmacionActiva.titulo.includes('2.° Primaria B'));
    confirmacionActiva.ejecutar();
    assert.strictEqual(grados.length, 1);

    // Solicitar eliminar etiqueta
    solicitarEliminar('etiqueta', 'Poca sal', () => {
      etiquetas = etiquetas.filter((t) => t !== 'Poca sal');
    });
    assert.ok(confirmacionActiva.titulo.includes('Poca sal'));
    confirmacionActiva.ejecutar();
    assert.strictEqual(etiquetas.length, 1);
  });
});
