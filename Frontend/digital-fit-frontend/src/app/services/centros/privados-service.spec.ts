import { TestBed } from '@angular/core/testing';

import { PrivadosService } from './privados-service';

describe('PrivadosService', () => {
  let service: PrivadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
