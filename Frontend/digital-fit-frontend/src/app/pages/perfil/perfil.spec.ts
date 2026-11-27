import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { I18nService } from '../../i18n/i18n.service';
import { GuiaInicialService } from '../../services/guia-inicial.service';
import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('muestra los datos de la sesión y cambia el idioma', () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    for (const peticion of http.match('/api/auth/me')) {
      peticion.flush({ username: 'ana', email: 'ana@example.test', rol: 'USER' });
    }
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.textContent).toContain('ana@example.test');
    expect(main.querySelectorAll('dd').length).toBe(2);
    const ingles = Array.from(main.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('English'),
    );
    ingles?.click();
    fixture.detectChanges();
    expect(TestBed.inject(I18nService).idiomaActual()).toBe('en');
    expect(main.querySelector('h1')?.textContent).toBe('Profile');
    expect(ingles?.getAttribute('aria-pressed')).toBe('true');
    http.verify();
  });

  it('recupera la guía desde Perfil y abre el Dashboard', () => {
    const fixture = TestBed.createComponent(PerfilComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    for (const peticion of http.match('/api/auth/me')) {
      peticion.flush({ username: 'ana', email: 'ana@example.test', rol: 'USER' });
    }
    fixture.detectChanges();

    const guia = TestBed.inject(GuiaInicialService);
    guia.establecerVisible('ana', false);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const boton = Array.from(
      fixture.nativeElement.querySelectorAll('main button') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.includes('Abrir guía'));
    expect(boton).toBeDefined();
    boton?.click();
    expect(guia.estaVisible('ana')).toBe(true);
    expect(navegar).toHaveBeenCalledWith(['/dashboard']);
    http.verify();
  });
});
