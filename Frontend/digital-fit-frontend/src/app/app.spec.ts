import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { NavigationCancel, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('muestra el esqueleto hasta que termina la primera navegación', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.carga-inicial [df-skeleton]')).not.toBeNull();

    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.carga-inicial')).toBeNull();
  });

  it('con un guard que redirige al login mantiene el esqueleto hasta que termina la navegación al destino', async () => {
    // Igual que authGuard: llama a router.navigate y devuelve false, lo que cancela la primera navegación.
    const guardiaQueRedirige = () => {
      inject(Router).navigate(['/login']);
      return false;
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', canActivate: [guardiaQueRedirige], children: [] },
          { path: 'login', children: [] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    const esqueletoTrasCancelar: boolean[] = [];
    router.events.subscribe((e) => {
      if (e instanceof NavigationCancel) {
        fixture.detectChanges();
        esqueletoTrasCancelar.push(fixture.nativeElement.querySelector('.carga-inicial') !== null);
      }
    });

    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(esqueletoTrasCancelar.length).toBeGreaterThan(0);
    expect(esqueletoTrasCancelar.every(Boolean)).toBe(true);
    expect(router.url).toBe('/login');
    expect(fixture.nativeElement.querySelector('.carga-inicial')).toBeNull();
  });
});
