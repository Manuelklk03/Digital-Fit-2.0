import type { UsuarioSesion } from '../models/entrenamiento';

const ORIGEN_INTERNO = 'https://digital-fit.invalid';

/** Conserva solo rutas internas. El valor de la URL de login puede haber sido manipulado. */
export function destinoTrasLogin(candidato: string | null, rol: UsuarioSesion['rol']): string {
  const predeterminado = rol === 'ADMIN' ? '/inicio' : '/dashboard';
  const tieneControl =
    candidato !== null &&
    [...candidato].some((caracter) => {
      const codigo = caracter.charCodeAt(0);
      return codigo < 32 || codigo === 127;
    });
  if (
    !candidato?.startsWith('/') ||
    candidato.startsWith('//') ||
    candidato.includes('\\') ||
    tieneControl
  ) {
    return predeterminado;
  }

  try {
    const destino = new URL(candidato, ORIGEN_INTERNO);
    if (destino.origin !== ORIGEN_INTERNO) return predeterminado;
    if (['/login', '/register'].includes(destino.pathname)) return predeterminado;
    if (
      rol !== 'ADMIN' &&
      (destino.pathname === '/admin' || destino.pathname.startsWith('/admin/'))
    ) {
      return predeterminado;
    }
    return destino.pathname + destino.search + destino.hash;
  } catch {
    return predeterminado;
  }
}
