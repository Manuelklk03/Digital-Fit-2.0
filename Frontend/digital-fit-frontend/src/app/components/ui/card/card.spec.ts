import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { CardComponent } from './card';

@Component({
  imports: [CardComponent],
  template: `
    <app-card [interactive]="interactive()">
      <div card-header>
        <h3>Título de Tarjeta</h3>
      </div>
      <p>Contenido principal</p>
      <div card-footer>
        <button>Acción</button>
      </div>
    </app-card>
  `,
})
class TestHostComponent {
  readonly interactive = signal(false);
}

describe('CardComponent', () => {
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

  it('debe crearse y proyectar cabecera, contenido y pie', () => {
    const card = fixture.nativeElement.querySelector('app-card');
    expect(card).toBeTruthy();
    expect(card.textContent).toContain('Título de Tarjeta');
    expect(card.textContent).toContain('Contenido principal');
    expect(card.textContent).toContain('Acción');
  });

  it('debe aplicar la clase df-card-interactive cuando interactive es true', () => {
    host.interactive.set(true);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('app-card');
    expect(card.classList.contains('df-card-interactive')).toBe(true);
  });
});
