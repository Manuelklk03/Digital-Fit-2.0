import { TestBed } from '@angular/core/testing';

import { AdminCentrosPrivadosBaseService } from './admin-centro-base';

describe('AdminCentrosPrivadosBaseService', () => {
  let service: AdminCentrosPrivadosBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCentrosPrivadosBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
