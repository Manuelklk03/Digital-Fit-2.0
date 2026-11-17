import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FiltroEntrenamientosComponent } from './filtro-entrenamientos';

describe('FiltroEntrenamientosComponent', () => {
  it('emite un único campo con valor y null si está vacío o se limpia', () => {
    const c = TestBed.createComponent(FiltroEntrenamientosComponent).componentInstance;
    const emitido = vi.spyOn(c.filtrar, 'emit');

    c.cambiarCampo('nivel');
    c.valor = 'AVANZADO';
    c.aplicar();
    c.valor = '  ';
    c.aplicar();
    c.limpiar();

    expect(emitido.mock.calls).toEqual([[{ campo: 'nivel', valor: 'AVANZADO' }], [null], [null]]);
    expect(c.campo()).toBe('nombre');
  });

  it('muestra un select con las opciones del campo elegido', () => {
    const fixture = TestBed.createComponent(FiltroEntrenamientosComponent);
    fixture.componentInstance.cambiarCampo('categoria');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select#filtro-valor').options.length).toBe(26);
  });
});
