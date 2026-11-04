import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ButtonComponent, ButtonSize, ButtonVariant } from './button';

@Component({
  imports: [ButtonComponent],
  template: `
    <button
      df-button
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
    >
      Acción
    </button>
  `,
})
class TestHostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
}

describe('ButtonComponent', () => {
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

  it('debe crearse y aplicar la clase variante y tamaño por defecto', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('df-btn-primary')).toBe(true);
    expect(btn.classList.contains('df-btn-md')).toBe(true);
    expect(btn.textContent).toContain('Acción');
  });

  it('debe cambiar de clase al modificar variant y size', () => {
    host.variant.set('danger');
    host.size.set('lg');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('df-btn-danger')).toBe(true);
    expect(btn.classList.contains('df-btn-lg')).toBe(true);
  });

  it('debe reflejar el estado disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('debe mostrar spinner en estado loading', () => {
    host.loading.set(true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    const spinner = btn.querySelector('.spinner');
    expect(spinner).toBeTruthy();
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });
});
