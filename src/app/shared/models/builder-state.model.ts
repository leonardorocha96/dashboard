import { BehaviorSubject } from 'rxjs';
import { ComponentInstance } from './component-instance.model';
import { Page } from './page.model';
import { GlobalFilterState } from './filter-config.model';

export interface BuilderState {
  currentPageId: string | null;
  pages: Map<string, Page>;
  selectedComponentIds: Set<string>;
  clipboard?: ComponentInstance[];
}

export interface BuilderStateRefs {
  globalFilters$: BehaviorSubject<GlobalFilterState[]>;
  pageLayout$: BehaviorSubject<Page | null>;
  componentRegistry$: BehaviorSubject<ComponentInstance[]>;
}
