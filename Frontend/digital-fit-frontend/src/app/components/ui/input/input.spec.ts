import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { InputDirective, InputSize } from './input';

@Component({
  imports: [InputDirective],
  template: ` <input df-input [size]="size()" [error]="error()" placeholder="Introduce texto" /> `,
})
class TestHostComponent {
  readonly size = signal<InputSize>('md');
  readonly error = signal(false);
}

describe('InputDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse con la clase de tamaño por defecto', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('df-input-md')).toBe(true);
    expect(input.placeholder).toBe('Introduce texto');
  });

  it('debe aplicar la clase de error cuando error es true', () => {
    host.error.set(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('df-input-error')).toBe(true);
  });

  it('debe cambiar de tamaño dinámicamente', () => {
    host.size.set('lg');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('df-input-lg')).toBe(true);
  });
});
