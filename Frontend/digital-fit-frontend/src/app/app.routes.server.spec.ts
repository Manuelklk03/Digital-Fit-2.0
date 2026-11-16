import { RenderMode } from '@angular/ssr';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

describe('serverRoutes', () => {
  it('prerenderiza exactamente las rutas indexables (las que declaran data.seo)', () => {
    const indexables = routes
      .filter((r) => r.data?.['seo'])
      .map((r) => r.path)
      .sort();
    const prerenderizadas = serverRoutes
      .filter((r) => r.renderMode === RenderMode.Prerender)
      .map((r) => r.path)
      .sort();

    expect(prerenderizadas).toEqual(indexables);
  });

  it('el resto de rutas se pinta en el navegador', () => {
    expect(serverRoutes.at(-1)).toEqual({ path: '**', renderMode: RenderMode.Client });
  });
});
