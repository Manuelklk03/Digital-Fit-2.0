import { of } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido, TAMANO_MAXIMO_PAGINA } from './pagina-response';

describe('pagina-response', () => {
  it('soloContenido devuelve el array de la página', () => {
    const pagina: PaginaResponse<number> = { content: [1, 2], page: 0, size: 20, totalElements: 2, totalPages: 1 };
    let resultado: number[] | undefined;

    of(pagina).pipe(soloContenido<number>()).subscribe((c) => (resultado = c));

    expect(resultado).toEqual([1, 2]);
  });

  it('PARAMS_PAGINA_COMPLETA pide el tamaño máximo', () => {
    expect(PARAMS_PAGINA_COMPLETA.get('size')).toBe(String(TAMANO_MAXIMO_PAGINA));
  });
});
