import { destinoTrasLogin } from './retorno-login';

describe('destinoTrasLogin', () => {
  it('conserva una ruta privada con consulta y fragmento', () => {
    expect(destinoTrasLogin('/mis-entrenamientos?pagina=2#lista', 'USER')).toBe(
      '/mis-entrenamientos?pagina=2#lista',
    );
  });

  it.each([
    'https://externo.example/ruta',
    '//externo.example/ruta',
    '/\\externo.example',
    '/\nexterno.example',
    'javascript:alert(1)',
    '/login',
    '/register',
    '/admin/crear-admin',
  ])('descarta un destino no permitido para USER: %s', (destino) => {
    expect(destinoTrasLogin(destino, 'USER')).toBe('/dashboard');
  });

  it('permite el acceso administrativo solo al rol ADMIN', () => {
    expect(destinoTrasLogin('/admin/crear-admin', 'ADMIN')).toBe('/admin/crear-admin');
    expect(destinoTrasLogin(null, 'ADMIN')).toBe('/inicio');
  });
});
