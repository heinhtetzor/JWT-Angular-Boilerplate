import { TestBed } from '@angular/core/testing';

import { WebrequestInterceptor } from './webrequest.interceptor';

describe('WebrequestInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebrequestInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: WebrequestInterceptor = TestBed.inject(WebrequestInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
