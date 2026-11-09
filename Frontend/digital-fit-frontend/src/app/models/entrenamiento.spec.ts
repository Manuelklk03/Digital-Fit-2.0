import { aParametros, fechaLegible, fechaParaBackend } from './entrenamiento';

describe('modelo de entrenamiento', () => {
  it('aParametros envía solo el campo elegido y omite valores vacíos', () => {
    expect(aParametros({ campo: 'nivel', valor: ' AVANZADO ' })).toEqual({ nivel: 'AVANZADO' });
    expect(aParametros({ campo: 'nombre', valor: '   ' })).toEqual({});
    expect(aParametros(null)).toEqual({});
  });

  it('fechaParaBackend usa el formato yyyy-MM-dd HH:mm:ss', () => {
    expect(fechaParaBackend(new Date(2026, 0, 5, 7, 8, 9))).toBe('2026-01-05 07:08:09');
  });

  it('fechaLegible formatea fechas válidas y devuelve el original si no lo son', () => {
    const legible = fechaLegible('2026-11-09 18:30:00', 'en');
    expect(legible).not.toBe('2026-11-09 18:30:00');
    expect(legible).toContain('Nov');
    expect(legible).toMatch(/6:30/);
    expect(fechaLegible('no-es-fecha', 'es')).toBe('no-es-fecha');
    expect(fechaLegible(null, 'es')).toBe('');
  });
});
