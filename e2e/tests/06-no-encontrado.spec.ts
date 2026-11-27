import { test, expect } from "@playwright/test";

test("una URL inexistente muestra 404 sin enviarla al login", async ({
  page,
}) => {
  await page.goto("/ruta-que-no-existe");
  await expect(page).toHaveURL(/\/ruta-que-no-existe$/);
  await expect(
    page
      .getByRole("main")
      .getByRole("heading", { name: "No encontramos esta página" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Volver al inicio" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});
