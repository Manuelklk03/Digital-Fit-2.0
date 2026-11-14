import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SkeletonComponent } from './skeleton';

@Component({
  imports: [SkeletonComponent],
  template: `<div df-skeleton></div>
    <div df-skeleton alto="132px"></div>`,
})
class HostComponent {}

describe('SkeletonComponent', () => {
  it('es decorativo y usa la altura indicada o la de por defecto', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const [porDefecto, personalizado] = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('[df-skeleton]'),
    );
    expect(porDefecto.getAttribute('aria-hidden')).toBe('true');
    expect(porDefecto.style.height).toBe('88px');
    expect(personalizado.style.height).toBe('132px');
  });
});
