import { test, expect } from '@playwright/test';

test.describe('Límite de Intentos de Inicio de Sesión (Rate Limiting)', () => {
  test('seis intentos fallidos consecutivos activan HTTP 429 y muestran aviso de bloqueo', async ({ page }) => {
    const timestamp = Date.now();
    const usuarioAislado = `usuario_bloqueado_${timestamp}`;
    const passwordIncorrecta = 'clave_invalida_xyz';

    await page.goto('/login');
    await expect(page.getByLabel('Nombre de usuario')).toBeVisible();

    const campoUsuario = page.getByLabel('Nombre de usuario');
    const campoPassword = page.getByLabel('Contraseña');
    const botonEntrar = page.getByRole('button', { name: 'Iniciar sesión' });

    // Rellenamos los campos una vez
    await campoUsuario.fill(usuarioAislado);
    await campoPassword.fill(passwordIncorrecta);

    // Ejecutamos los primeros 5 intentos fallidos (que devuelven 401)
    for (let i = 1; i <= 5; i++) {
      const respuestaLoginPromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST'
      );
      await botonEntrar.click();
      const respuesta = await respuestaLoginPromise;

      // Los primeros 5 intentos fallan por credenciales erróneas (401)
      expect(respuesta.status()).toBe(401);
      // Esperar brevemente a que el botón se reactive tras el intento
      await expect(botonEntrar).toBeEnabled();
    }

    // 6º intento: el usuario ha alcanzado el límite de 5 fallos consecutivos y debe recibir 429
    const respuesta429Promise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/login') && resp.request().method() === 'POST'
    );
    await botonEntrar.click();
    const respuesta429 = await respuesta429Promise;

    // Verificar respuesta HTTP 429 y cabecera Retry-After
    expect(respuesta429.status()).toBe(429);
    expect(respuesta429.headers()['retry-after']).toBeDefined();

    // Verificar que en la interfaz se muestra el mensaje específico de rate limit
    await expect(page.getByText('Demasiados intentos fallidos')).toBeVisible({ timeout: 7000 });
  });
});
