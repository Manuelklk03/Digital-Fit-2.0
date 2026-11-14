import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { BadgeComponent, BadgeStyle, BadgeVariant } from './badge';

@Component({
  imports: [BadgeComponent],
  template: `
    <span df-badge [variant]="variant()" [badgeStyle]="badgeStyle()" [dot]="dot()"> Activo </span>
  `,
})
class TestHostComponent {
  readonly variant = signal<BadgeVariant>('neutral');
  readonly badgeStyle = signal<BadgeStyle>('subtle');
  readonly dot = signal(false);
}

describe('BadgeComponent', () => {
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

  it('debe crearse con la clase sutil neutral por defecto', () => {
    const el = fixture.nativeElement.querySelector('span');
    expect(el.classList.contains('df-badge-subtle-neutral')).toBe(true);
    expect(el.textContent).toContain('Activo');
  });

  it('debe cambiar de estilo y variante correctamente', () => {
    host.variant.set('accent');
    host.badgeStyle.set('solid');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('span');
    expect(el.classList.contains('df-badge-solid-accent')).toBe(true);
  });

  it('debe mostrar el indicador dot cuando dot es true', () => {
    host.dot.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('span');
    const dot = el.querySelector('.badge-dot');
    expect(dot).toBeTruthy();
  });
});
