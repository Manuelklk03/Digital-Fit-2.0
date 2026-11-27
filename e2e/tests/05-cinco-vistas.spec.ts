import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers/auth.js";
import { abrirNavegacionSiColapsada } from "./helpers/navigation.js";

test("las cinco vistas se recorren en móvil sin desbordamiento horizontal", async ({
  page,
}) => {
  await loginViaUI(page, "usuario1", "Usuario123!");
  await page.setViewportSize({ width: 390, height: 844 });

  await abrirNavegacionSiColapsada(page);
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Entrenar" })
    .click();
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Entrenar" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: /Rutinas base/ }),
  ).toBeVisible();

  await abrirNavegacionSiColapsada(page);
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Progreso" })
    .click();
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Progreso" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: /Historial/ }),
  ).toBeVisible();

  await abrirNavegacionSiColapsada(page);
  await page.getByRole("banner").getByRole("link", { name: "Perfil" }).click();
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Perfil" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText("usuario1");
  await page.getByRole("main").getByRole("button", { name: "English" }).click();
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Profile" }),
  ).toBeVisible();

  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(desborda).toBe(false);
});
