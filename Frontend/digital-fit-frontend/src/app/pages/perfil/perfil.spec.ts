import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => localStorage.removeItem('digitalfit_lang'));

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
});
