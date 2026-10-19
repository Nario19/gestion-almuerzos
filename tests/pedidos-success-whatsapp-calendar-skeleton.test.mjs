import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Verificación de Pantalla de Éxito, Calendario de Pedidos y Skeleton Loaders', async (t) => {
  await t.test('1. Pantalla de éxito en Home (/): Ya NO tiene botón de enviar comprobante por WhatsApp', () => {
    const pagePath = path.join(projectRoot, 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    // No debe contener el texto del botón de WhatsApp
    assert.doesNotMatch(
      content,
      /Enviar comprobante por WhatsApp/,
      'La pantalla de pedido registrado exitosamente ya no debe tener el botón de enviar comprobante por WhatsApp'
    );

    // Debe contener los botones de acción limpios
    assert.match(content, /Ver en Mis Pedidos/, 'Debe ofrecer acceso directo a Ver en Mis Pedidos');
    assert.match(content, /Hacer otro pedido/, 'Debe ofrecer la opción de Hacer otro pedido');
  });

  await t.test('2. Pantalla de historial de pedidos (/pedidos): Calendario y selector de fecha responsivo y optimizado', () => {
    const pedidosPath = path.join(projectRoot, 'src/app/pedidos/page.tsx');
    const content = fs.readFileSync(pedidosPath, 'utf8');

    // Input nativo de fecha con icono Calendar posicionado
    assert.match(content, /type="date"/, 'Debe incluir input nativo tipo date');
    assert.match(content, /Calendar className="w-4 h-4 text-orange-500 absolute left-3/, 'Debe incluir icono visual de Calendar integrado');
    assert.match(content, /Día anterior/, 'Debe incluir navegación de día anterior');
    assert.match(content, /Día siguiente/, 'Debe incluir navegación de día siguiente');
    assert.match(content, /Ver todos/, 'Debe permitir resetear el filtro con Ver todos');
  });

  await t.test('3. Biblioteca de Skeleton: Existe src/components/Skeleton.tsx y src/app/loading.tsx', () => {
    const skeletonPath = path.join(projectRoot, 'src/components/Skeleton.tsx');
    assert.ok(fs.existsSync(skeletonPath), 'src/components/Skeleton.tsx debe existir');
    const content = fs.readFileSync(skeletonPath, 'utf8');

    assert.match(content, /export function Skeleton/, 'Debe exportar Skeleton');
    assert.match(content, /export function SkeletonHomePage/, 'Debe exportar SkeletonHomePage');
    assert.match(content, /export function SkeletonPedidosPage/, 'Debe exportar SkeletonPedidosPage');
    assert.match(content, /export function SkeletonHijosPage/, 'Debe exportar SkeletonHijosPage');
    assert.match(content, /export function SkeletonPerfilPage/, 'Debe exportar SkeletonPerfilPage');
    assert.match(content, /export function SkeletonDashboardPage/, 'Debe exportar SkeletonDashboardPage');
    assert.match(content, /export function SkeletonLoginPage/, 'Debe exportar SkeletonLoginPage');

    const loadingPath = path.join(projectRoot, 'src/app/loading.tsx');
    assert.ok(fs.existsSync(loadingPath), 'src/app/loading.tsx debe existir en Next.js App Router');
  });

  await t.test('4. Todas las pantallas principales usan Skeleton en lugar de spinners de carga simples', () => {
    const checkFileForSkeleton = (filePath, skeletonName) => {
      const fullPath = path.join(projectRoot, filePath);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      assert.match(fileContent, new RegExp(skeletonName), `${filePath} debe utilizar ${skeletonName}`);
    };

    checkFileForSkeleton('src/app/page.tsx', 'SkeletonHomePage');
    checkFileForSkeleton('src/app/pedidos/page.tsx', 'SkeletonPedidosPage');
    checkFileForSkeleton('src/app/hijos/page.tsx', 'SkeletonHijosPage');
    checkFileForSkeleton('src/app/perfil/page.tsx', 'SkeletonPerfilPage');
    checkFileForSkeleton('src/app/login/page.tsx', 'SkeletonLoginPage');
    checkFileForSkeleton('src/app/admin/page.tsx', 'SkeletonDashboardPage');
    checkFileForSkeleton('src/app/despacho/page.tsx', 'SkeletonDashboardPage');
    checkFileForSkeleton('src/app/cocina/page.tsx', 'SkeletonDashboardPage');
    checkFileForSkeleton('src/app/fiado/page.tsx', 'SkeletonDashboardPage');
    checkFileForSkeleton('src/app/superadmin/page.tsx', 'SkeletonDashboardPage');
  });
});
