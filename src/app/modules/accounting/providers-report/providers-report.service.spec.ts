import { TestBed } from '@angular/core/testing';

import { ProvidersReportService } from './providers-report.service';

describe('ProvidersReportService', () => {
  let service: ProvidersReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProvidersReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
