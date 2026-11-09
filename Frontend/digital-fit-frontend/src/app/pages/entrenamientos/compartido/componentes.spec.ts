import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FiltroEntrenamientosComponent } from './filtro-entrenamientos';
import { PaginadorComponent } from './paginador';

describe('PaginadorComponent', () => {
  function crear(pagina: number, total: number) {
    const fixture = TestBed.createComponent(PaginadorComponent);
    fixture.componentRef.setInput('pagina', pagina);
    fixture.componentRef.setInput('totalPaginas', total);
    fixture.detectChanges();
    return fixture;
  }

  it('no se muestra con una sola página', () => {
    expect(crear(0, 1).nativeElement.querySelector('nav')).toBeNull();
  });

  it('emite la página anterior y la siguiente y desactiva los extremos', () => {
    const fixture = crear(1, 3);
    const emitido = vi.spyOn(fixture.componentInstance.cambiar, 'emit');
    const [anterior, siguiente] = fixture.nativeElement.querySelectorAll('button');

    anterior.click();
    siguiente.click();

    expect(emitido.mock.calls).toEqual([[0], [2]]);
    expect(fixture.nativeElement.textContent).toContain('2');
    expect(crear(0, 3).nativeElement.querySelector('button').disabled).toBe(true);
  });
});

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
