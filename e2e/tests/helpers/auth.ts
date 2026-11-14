import { Page, expect } from '@playwright/test';

/**
 * Inicia sesión a través de la interfaz de usuario.
 */
export async function loginViaUI(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await expect(page.getByLabel('Nombre de usuario')).toBeVisible();

  await page.getByLabel('Nombre de usuario').fill(username);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  // Esperar a que la sesión esté establecida (botón Salir visible en el header)
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible({ timeout: 10000 });
}

/**
 * Cierra la sesión activa a través de la interfaz de usuario.
 */
export async function logoutViaUI(page: Page): Promise<void> {
  const botonSalir = page.getByRole('button', { name: 'Salir' });
  if (await botonSalir.isVisible()) {
    await botonSalir.click();
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible({ timeout: 10000 });
  }
}
