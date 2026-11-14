import { test, expect } from '@playwright/test';
import { loginViaUI, logoutViaUI } from './helpers/auth.js';

test.describe('Control de Acceso y Permisos por Rol', () => {
  test('usuario anónimo no accede a rutas protegidas y recibe 401 en endpoints admin', async ({ page, request }) => {
    // 1. Petición directa anónima a la API administrativa
    const respuestaApi = await request.get('/api/admin/entrenamientos-base');
    expect(respuestaApi.status()).toBe(401);

    // 2. Intentar acceder a Mis Entrenamientos sin autenticar redirige a /login
    await page.goto('/mis-entrenamientos');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

    // 3. En la cabecera no existen enlaces administrativos ni privados
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear admin' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Mis entrenamientos' })).not.toBeVisible();
  });

  test('usuario estándar no ve enlace administrativo y recibe 403 en endpoints de rol ADMIN', async ({ page }) => {
    // 1. Iniciar sesión con rol USER
    await loginViaUI(page, 'usuario1', 'password123');

    // 2. La navegación principal no muestra la opción de 'Crear admin'
    await expect(page.getByRole('link', { name: 'Crear admin' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Mis entrenamientos' })).toBeVisible();

    // 3. Intento de navegación directa por URL a /admin/crear-admin es interceptado por adminGuard
    await page.goto('/admin/crear-admin');
    await expect(page).not.toHaveURL(/.*\/admin\/crear-admin/, { timeout: 10000 });

    // 4. Petición HTTP usando la sesión activa del navegador contra la API de administración
    // El navegador ya tiene la cookie JSESSIONID y el token CSRF tras la navegación
    const respuestaAdmin = await page.request.get('/api/admin/entrenamientos-base');
    expect(respuestaAdmin.status()).toBe(403);

    // 5. Cerrar sesión limpiamente
    await logoutViaUI(page);
  });
});
