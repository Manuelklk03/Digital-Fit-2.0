import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers/auth.js';

test.describe('Catálogo y Mis Entrenamientos', () => {
  test('navegar por el catálogo base, añadir rutina a mis entrenamientos y eliminarla', async ({ page }) => {
    // 1. Iniciar sesión con el usuario de demostración
    await loginViaUI(page, 'usuario1', 'Usuario123!');

    // 2. Navegar al catálogo de entrenamientos base
    await page.goto('/entrenamientos');
    await expect(page.getByRole('heading', { name: 'Entrenamientos base', level: 1 })).toBeVisible({ timeout: 10000 });

    // 3. Verificar que existen tarjetas de entrenamiento en el catálogo
    const primerBotonAnadir = page.getByRole('button', { name: 'Añadir a mis entrenamientos' }).first();
    await expect(primerBotonAnadir).toBeVisible({ timeout: 10000 });

    // 4. Añadir el primer entrenamiento del catálogo a mis entrenamientos
    await primerBotonAnadir.click();
    await expect(page.getByText('Añadido a tus entrenamientos.')).toBeVisible({ timeout: 10000 });

    // 5. Navegar a Mis Entrenamientos a través del enlace de navegación
    await page.getByRole('link', { name: 'Mis entrenamientos' }).click();
    await expect(page).toHaveURL(/.*\/mis-entrenamientos/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Mis entrenamientos', level: 1 })).toBeVisible();

    // 6. Verificar que aparece al menos un botón de borrar en mis entrenamientos
    const primerBotonBorrar = page.getByRole('button', { name: 'Borrar' }).first();
    await expect(primerBotonBorrar).toBeVisible({ timeout: 10000 });

    // 7. Preparar el manejador del diálogo nativo confirm() antes de hacer clic en Borrar
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // 8. Hacer clic en Borrar y confirmar la eliminación
    await primerBotonBorrar.click();
    await expect(page.getByText('Entrenamiento borrado.')).toBeVisible({ timeout: 10000 });
  });
});
