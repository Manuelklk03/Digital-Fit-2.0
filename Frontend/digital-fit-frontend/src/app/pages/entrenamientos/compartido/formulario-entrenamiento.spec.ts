import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { EntrenamientoForm } from '../../../models/entrenamiento';
import { FormularioEntrenamientoComponent } from './formulario-entrenamiento';

describe('FormularioEntrenamientoComponent', () => {
  function crear(inicial: EntrenamientoForm | null = null) {
    const fixture = TestBed.createComponent(FormularioEntrenamientoComponent);
    fixture.componentRef.setInput('titulo', 'Título');
    fixture.componentRef.setInput('textoEnviar', 'Crear');
    fixture.componentRef.setInput('inicial', inicial);
    fixture.detectChanges();
    return fixture;
  }

  it('no emite y marca los campos inválidos', () => {
    const fixture = crear();
    const c = fixture.componentInstance;
    const emitido = vi.spyOn(c.guardar, 'emit');
    c.modelo.duracionEnMinutos = 0;

    c.enviar();
    fixture.detectChanges();

    expect(emitido).not.toHaveBeenCalled();
    expect(c.errores()).toEqual(['nombre', 'descripcion', 'duracionEnMinutos']);
    expect(fixture.nativeElement.querySelectorAll('[aria-invalid="true"]').length).toBe(3);
  });

  it('emite los datos recortados cuando son válidos', () => {
    const c = crear().componentInstance;
    const emitido = vi.spyOn(c.guardar, 'emit');
    Object.assign(c.modelo, {
      nombre: '  Pierna ',
      descripcion: ' Sentadillas ',
      duracionEnMinutos: '45',
    });

    c.enviar();

    expect(emitido).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Pierna',
        descripcion: 'Sentadillas',
        duracionEnMinutos: 45,
      }),
    );
  });

  it('precarga los datos al editar', () => {
    const inicial: EntrenamientoForm = {
      nombre: 'HIIT 20',
      descripcion: 'd',
      categoria: 'HIIT',
      nivel: 'AVANZADO',
      duracionEnMinutos: 20,
    };
    expect(crear(inicial).componentInstance.modelo).toEqual(inicial);
  });
});
