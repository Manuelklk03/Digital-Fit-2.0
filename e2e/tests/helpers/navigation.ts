import { expect, type Page } from '@playwright/test';

/** Abre la navegación cuando la anchura actual la presenta como menú desplegable. */
export async function abrirNavegacionSiColapsada(page: Page): Promise<void> {
  const botonMenu = page.getByRole('button', { name: /^(Menú|Menu)$/i });
  if (await botonMenu.isVisible()) {
    await botonMenu.click();
    await expect(botonMenu).toHaveAttribute('aria-expanded', 'true');
  }
}
