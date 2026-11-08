import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertComponent } from './alert';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe emitir el evento cerrar al pulsar el botón de cierre', () => {
    const spy = vi.spyOn(component.cerrar, 'emit');
    const boton = fixture.nativeElement.querySelector('button');
    boton?.click();

    expect(spy).toHaveBeenCalled();
  });
});
