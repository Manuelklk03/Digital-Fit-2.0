import { test, expect } from "@playwright/test";
import { logoutViaUI } from "./helpers/auth.js";

test.describe("Flujo de Autenticación", () => {
  const timestamp = Date.now();
  const testUser = `e2e_user_${timestamp}`;
  const testEmail = `e2e_${timestamp}@digitalfit.local`;
  const testPassword = "Password123!";

  test("registro de nuevo usuario, login y logout completos", async ({
    page,
  }) => {
    // 1. Una ruta privada conserva el destino durante login y registro
    await page.goto("/mis-entrenamientos");
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fmis-entrenamientos/);
    await page.getByRole("link", { name: "Crear cuenta" }).click();
    await expect(page).toHaveURL(/\/register\?returnUrl=%2Fmis-entrenamientos/);
    await expect(
      page.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeVisible();

    // 2. Rellenar formulario de registro usando etiquetas accesibles
    await page.getByLabel("Nombre de usuario").fill(testUser);
    await page.getByLabel("Correo electrónico").fill(testEmail);
    await page.getByLabel("Contraseña").fill(testPassword);

    // 3. Enviar registro
    await page.getByRole("button", { name: "Registrarse" }).click();

    // 4. Verificar alerta de éxito y retorno a login con el destino conservado
    await expect(page.getByText("Cuenta creada correctamente")).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fmis-entrenamientos/, {
      timeout: 10000,
    });

    // 5. Iniciar sesión con el usuario recién creado
    await page.getByLabel("Nombre de usuario").fill(testUser);
    await page.getByLabel("Contraseña").fill(testPassword);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // 6. Verificar que la sesión se inicia correctamente (cabecera muestra el usuario y botón Salir)
    await expect(
      page.getByRole("banner").getByRole("button", { name: "Salir" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".estado-linea-superior")).toContainText(
      testUser,
    );
    await expect(page).toHaveURL(/\/mis-entrenamientos$/, { timeout: 10000 });

    // 7. Cerrar sesión
    await logoutViaUI(page);
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Entrar" }),
    ).toBeVisible({ timeout: 10000 });
  });
});
