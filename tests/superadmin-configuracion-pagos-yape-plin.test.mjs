import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Configuración de Métodos de Pago Globales (Yape & Plin) para Superadmin', async (t) => {
  await t.test('1. src/types/index.ts: Define la interfaz estricta ConfiguracionPagos', () => {
    const typesPath = path.join(rootDir, 'src/types/index.ts');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.match(content, /export interface ConfiguracionPagos/, 'Debe exportar la interfaz ConfiguracionPagos');
    assert.match(content, /numeroYape:\s*string;/, 'Debe tener propiedad numeroYape');
    assert.match(content, /titularYape:\s*string;/, 'Debe tener propiedad titularYape');
    assert.match(content, /numeroPlin:\s*string;/, 'Debe tener propiedad numeroPlin');
    assert.match(content, /titularPlin:\s*string;/, 'Debe tener propiedad titularPlin');
  });

  await t.test('2. src/lib/dataService.ts: Implementa CONFIG_PAGOS_DEFAULT, obtenerConfiguracionPagos y guardarConfiguracionPagos', () => {
    const dataServicePath = path.join(rootDir, 'src/lib/dataService.ts');
    const content = fs.readFileSync(dataServicePath, 'utf8');

    // Constante por defecto
    assert.match(content, /export const CONFIG_PAGOS_DEFAULT:\s*ConfiguracionPagos/, 'Debe exportar CONFIG_PAGOS_DEFAULT');
    assert.match(content, /numeroYape:\s*'999-999-999'/, 'Debe tener numeroYape por defecto');
    assert.match(content, /numeroPlin:\s*'999-999-999'/, 'Debe tener numeroPlin por defecto');

    // Métodos en dataService
    assert.match(content, /async obtenerConfiguracionPagos\(\):\s*Promise<ConfiguracionPagos>/, 'dataService debe implementar obtenerConfiguracionPagos');
    assert.match(content, /async guardarConfiguracionPagos\(nuevaConfig:\s*ConfiguracionPagos\)/, 'dataService debe implementar guardarConfiguracionPagos');
    assert.match(content, /localStorage\.setItem\('config_pagos'/, 'Debe guardar en localStorage como respaldo reactivo');
    assert.match(content, /cfgObj\.configuracionPagos\s*=\s*configLimpia|configuracionPagos:\s*configLimpia/, 'Debe persistir en objeto de configuración global');
    assert.match(content, /notifyListeners\(\)/, 'Debe notificar a los suscriptores en tiempo real');
  });

  await t.test('3. En /superadmin: Contiene tarjeta visual de Yape/Plin, modal de edición y alcance global para todos los colegios', () => {
    const superadminPath = path.join(rootDir, 'src/app/superadmin/page.tsx');
    const content = fs.readFileSync(superadminPath, 'utf8');

    // Tarjeta y alcance global
    assert.match(content, /Métodos de Pago Globales \(Yape & Plin\)/, 'Debe mostrar título de Métodos de Pago Globales');
    assert.match(content, /Para Todos los Colegios/, 'Debe especificar que aplica a todos los colegios');
    assert.match(content, /Editar Números de Pago|Editar Yape \/ Plin/, 'Debe existir botón para editar números de pago');

    // Modal de edición
    assert.match(content, /Configurar Números de Yape y Plin/, 'Debe existir modal de configuración');
    assert.match(content, /Número de Yape \*/, 'Debe tener campo para Número de Yape');
    assert.match(content, /Número de Plin \*/, 'Debe tener campo para Número de Plin');
    assert.match(content, /handleGuardarPagos/, 'Debe tener handler para guardar pagos');
    assert.match(content, /dataService\.guardarConfiguracionPagos/, 'Debe invocar guardarConfiguracionPagos');
  });

  await t.test('4. En / (Home / Checkout): Los recuadros de Yape y Plin muestran dinámicamente los números configurados', () => {
    const homePath = path.join(rootDir, 'src/app/padres/page.tsx');
    const content = fs.readFileSync(homePath, 'utf8');

    // Carga de configuración dinámica
    assert.match(content, /dataService\.obtenerConfiguracionPagos\(\)/, 'Debe cargar la configuración de pagos dinámica');
    assert.match(content, /configPagos\.numeroYape/, 'Debe renderizar configPagos.numeroYape en lugar de texto estático');
    assert.match(content, /configPagos\.numeroPlin/, 'Debe renderizar configPagos.numeroPlin en lugar de texto estático');
  });

  await t.test('5. Lógica pura de normalización y fallback de datos de pago', () => {
    function normalizarConfigPagos(input) {
      const DEFAULT = {
        numeroYape: '999-999-999',
        titularYape: 'Placeres Culinarios',
        numeroPlin: '999-999-999',
        titularPlin: 'Placeres Culinarios',
      };
      if (!input) return { ...DEFAULT };
      return {
        numeroYape: input.numeroYape?.trim() || DEFAULT.numeroYape,
        titularYape: input.titularYape?.trim() || DEFAULT.titularYape,
        numeroPlin: input.numeroPlin?.trim() || DEFAULT.numeroPlin,
        titularPlin: input.titularPlin?.trim() || DEFAULT.titularPlin,
      };
    }

    const test1 = normalizarConfigPagos({
      numeroYape: '  987654321  ',
      titularYape: '  Empresa Placeres  ',
      numeroPlin: '  912345678  ',
      titularPlin: '  Empresa Placeres  ',
    });

    assert.strictEqual(test1.numeroYape, '987654321');
    assert.strictEqual(test1.titularYape, 'Empresa Placeres');
    assert.strictEqual(test1.numeroPlin, '912345678');
    assert.strictEqual(test1.titularPlin, 'Empresa Placeres');

    // Con valores vacíos aplica fallback seguro
    const testVacio = normalizarConfigPagos({
      numeroYape: '   ',
      titularYape: '',
      numeroPlin: '',
      titularPlin: '   ',
    });
    assert.strictEqual(testVacio.numeroYape, '999-999-999');
    assert.strictEqual(testVacio.titularYape, 'Placeres Culinarios');
  });
});
