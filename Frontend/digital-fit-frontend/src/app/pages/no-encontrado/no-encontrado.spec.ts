import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { NoEncontradoComponent } from './no-encontrado';

describe('NoEncontradoComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [NoEncontradoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => localStorage.removeItem('digitalfit_lang'));

  it('explica el error y enlaza a Inicio en ambos idiomas', () => {
    const fixture = TestBed.createComponent(NoEncontradoComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.querySelector('h1')?.textContent).toContain('No encontramos esta página');
    expect(main.querySelector('a')?.getAttribute('href')).toBe('/inicio');

    TestBed.inject(I18nService).cambiarIdioma('en');
    fixture.detectChanges();
    expect(main.querySelector('h1')?.textContent).toContain('We could not find this page');
    http.verify();
  });
});
