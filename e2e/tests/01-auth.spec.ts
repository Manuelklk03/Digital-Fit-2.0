import { test, expect } from '@playwright/test';
import { logoutViaUI } from './helpers/auth.js';

test.describe('Flujo de Autenticación', () => {
  const timestamp = Date.now();
  const testUser = `e2e_user_${timestamp}`;
  const testEmail = `e2e_${timestamp}@digitalfit.local`;
  const testPassword = 'Password123!';

  test('registro de nuevo usuario, login y logout completos', async ({ page }) => {
    // 1. Navegar a registro
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();

    // 2. Rellenar formulario de registro usando etiquetas accesibles
    await page.getByLabel('Nombre de usuario').fill(testUser);
    await page.getByLabel('Correo electrónico').fill(testEmail);
    await page.getByLabel('Contraseña').fill(testPassword);

    // 3. Enviar registro
    await page.getByRole('button', { name: 'Registrarse' }).click();

    // 4. Verificar alerta de éxito y redirección automática a /login
    await expect(page.getByText('Cuenta creada correctamente')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

    // 5. Iniciar sesión con el usuario recién creado
    await page.getByLabel('Nombre de usuario').fill(testUser);
    await page.getByLabel('Contraseña').fill(testPassword);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // 6. Verificar que la sesión se inicia correctamente (cabecera muestra el usuario y botón Salir)
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.estado-linea-superior')).toContainText(testUser);

    // 7. Cerrar sesión
    await logoutViaUI(page);
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible({ timeout: 10000 });
  });
});
