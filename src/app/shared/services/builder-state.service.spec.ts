import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BuilderStateService } from './builder-state.service';
import { BuilderApiService } from './builder-api.service';
import { Page } from '../models/page.model';
import { of } from 'rxjs';

describe('BuilderStateService', () => {
  let service: BuilderStateService;
  let api: BuilderApiService;
  const basePage: Page = {
    id: 'page-1',
    name: 'Página Teste',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'spec',
    updatedBy: 'spec',
    settings: { theme: 'default', resolutionClass: 'desktop', previewScale: 1 },
    layout: {
      id: 'layout-1',
      name: 'Layout',
      grid: {
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(12, minmax(60px, auto))',
        gap: '1rem',
        backgroundColor: '#fff'
      },
      components: [],
      filterBar: { backgroundColor: '#fff', fixed: true, showApplyButton: true }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BuilderStateService);
    api = TestBed.inject(BuilderApiService);
    spyOn(api, 'listPages').and.returnValue(of([structuredClone(basePage)]));
    service.loadWorkspace().subscribe();
  });

  it('should add component to current page', () => {
    service.setCurrentPage('page-1');
    service.upsertComponent({
      id: 'cmp-1',
      componentType: 'label',
      title: 'Label',
      position: { colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
      style: { zIndex: 1 }
    });

    expect(service.getCurrentPageSnapshot()?.layout.components.length).toBe(1);
  });

  it('should maintain selection observable', (done) => {
    service.setSelection(['cmp-1']);
    service.selectionChanges$.subscribe((selection) => {
      if (selection.includes('cmp-1')) {
        done();
      }
    });
  });
});
