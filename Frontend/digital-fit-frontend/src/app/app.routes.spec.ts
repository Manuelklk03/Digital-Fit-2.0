import { routes } from './app.routes';
import { userGuard } from './guards/user-guard';

describe('routes', () => {
  it('protege el Dashboard como vista de usuario', () => {
    const dashboard = routes.find((ruta) => ruta.path === 'dashboard');
    expect(dashboard?.canActivate).toContain(userGuard);
  });

  it('cada ruta con carga diferida resuelve un componente', async () => {
    const diferidas = routes.filter((r) => r.loadComponent);
    expect(diferidas.length).toBeGreaterThan(0);

    for (const ruta of diferidas) {
      const componente = await ruta.loadComponent!();
      expect(componente, ruta.path).toBeTypeOf('function');
    }
  });
});
