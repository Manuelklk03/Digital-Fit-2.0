import { TestBed } from '@angular/core/testing';

import { AdminLugaresPublicosBaseService } from './admin-lugarespublicos-base';

describe('AdminLugaresPublicosBaseService', () => {
  let service: AdminLugaresPublicosBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLugaresPublicosBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
