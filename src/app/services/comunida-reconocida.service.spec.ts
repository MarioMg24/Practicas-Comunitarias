import { TestBed } from '@angular/core/testing';

import { ComunidaReconocidaService } from './comunida-reconocida.service';

describe('ComunidaReconocidaService', () => {
  let service: ComunidaReconocidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComunidaReconocidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
