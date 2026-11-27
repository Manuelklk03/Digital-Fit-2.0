import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GuiaInicialService } from './guia-inicial.service';

describe('GuiaInicialService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('recuerda la omisión por cuenta y permite recuperar la guía', () => {
    const guia = TestBed.inject(GuiaInicialService);
    expect(guia.estaVisible('ana')).toBe(true);
    guia.establecerVisible('ana', false);
    expect(guia.estaVisible('ana')).toBe(false);
    expect(guia.estaVisible('otra-cuenta')).toBe(true);

    const nuevaInstancia = TestBed.runInInjectionContext(() => new GuiaInicialService());
    expect(nuevaInstancia.estaVisible('ana')).toBe(false);
    guia.establecerVisible('ana', true);
    expect(guia.estaVisible('ana')).toBe(true);
    expect(TestBed.runInInjectionContext(() => new GuiaInicialService()).estaVisible('ana')).toBe(
      true,
    );
  });

  it('no accede a localStorage durante el renderizado en servidor', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const guia = TestBed.inject(GuiaInicialService);
    expect(guia.estaVisible('ana')).toBe(false);
    expect(() => guia.establecerVisible('ana', false)).not.toThrow();
  });

  it('mantiene la preferencia durante la sesión si el navegador bloquea el almacenamiento', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const guia = TestBed.inject(GuiaInicialService);
    expect(guia.estaVisible('ana')).toBe(true);
    expect(() => guia.establecerVisible('ana', false)).not.toThrow();
    expect(guia.estaVisible('ana')).toBe(false);
  });
});
