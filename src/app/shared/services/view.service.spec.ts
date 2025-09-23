import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ViewService } from './view.service';
import { BuilderApiService } from './builder-api.service';
import { FilterService } from './filter.service';
import { of, Subject } from 'rxjs';
import { ViewConfig } from '../models/view-config.model';

class MockFilterService {
  applyEvents$ = new Subject<any>();
  globalFilters$ = of([]);
  registerDefinitions(): void {}
  setGlobalFilters(): void {}
  getFilterBindings(): Record<string, unknown> {
    return {};
  }
  apply(): void {}
}

describe('ViewService', () => {
  let service: ViewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: FilterService, useClass: MockFilterService }],
    });
    service = TestBed.inject(ViewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should cache analysis results', (done) => {
    const view: ViewConfig = {
      id: 'view-1',
      componentId: 'cmp-1',
      mode: 'analysis',
      source: 'sales',
      dimensions: ['Mês'],
      measures: ['Vendas']
    };

    service.getData('cmp-1', view, []).subscribe((first) => {
      service.getData('cmp-1', view, []).subscribe((second) => {
        expect(second).toEqual(first);
        done();
      });
    });
  });

  it('should call backend for sql view', () => {
    const builderApi = TestBed.inject(BuilderApiService);
    builderApi.registerSqlWhitelist(['sql-allowed']);

    const view: ViewConfig = {
      id: 'sql-1',
      componentId: 'cmp-2',
      mode: 'sql',
      queryId: 'sql-allowed'
    };

    service.getData('cmp-2', view, []).subscribe();
    const req = httpMock.expectOne('/api/sql/run');
    req.flush({ data: [] });
    httpMock.verify();
  });
});
