import { routes } from './app.routes';

describe('routes', () => {
  it('cada ruta con carga diferida resuelve un componente', async () => {
    const diferidas = routes.filter((r) => r.loadComponent);
    expect(diferidas.length).toBeGreaterThan(0);

    for (const ruta of diferidas) {
      const componente = await ruta.loadComponent!();
      expect(componente, ruta.path).toBeTypeOf('function');
    }
  });
});
