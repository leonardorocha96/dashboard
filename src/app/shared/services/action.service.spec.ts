import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActionService } from './action.service';
import { FilterService } from './filter.service';
import { ActionBinding } from '../models/action-config.model';

class MockFilterService {
  updated: Record<string, unknown> = {};
  updateValue(id: string, value: unknown): void {
    this.updated[id] = value;
  }
  apply(): void {}
}

describe('ActionService', () => {
  let service: ActionService;
  let httpMock: HttpTestingController;
  let filterService: MockFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: FilterService, useClass: MockFilterService }],
    });
    service = TestBed.inject(ActionService);
    httpMock = TestBed.inject(HttpTestingController);
    filterService = TestBed.inject(FilterService) as unknown as MockFilterService;
  });

  it('should update filters when filterOtherComponents executed', (done) => {
    const action: ActionBinding = {
      id: 'f1',
      type: 'filterOtherComponents',
      label: 'Filtrar',
      trigger: 'onClick',
      target: { componentIds: [] },
      payload: { filters: [{ filterId: 'status', value: 'ativo' }] }
    };

    service.execute(action, { componentId: 'cmp', trigger: 'onClick' }).subscribe(() => {
      expect(filterService.updated['status']).toBe('ativo');
      done();
    });
  });

  it('should call backend for apiCall', () => {
    const action: ActionBinding = {
      id: 'api1',
      type: 'apiCall',
      label: 'Enviar',
      trigger: 'onClick',
      target: { endpoint: '/api/action', method: 'POST' },
      payload: {}
    };

    service.execute(action, { componentId: 'cmp', trigger: 'onClick' }).subscribe();
    httpMock.expectOne('/api/action').flush({});
    httpMock.verify();
  });
});
