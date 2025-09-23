import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuilderApiService } from './builder-api.service';
import { ActionBinding } from '../models/action-config.model';
import { ComponentInstance } from '../models/component-instance.model';
import { BuilderState, BuilderStateRefs } from '../models/builder-state.model';
import { GlobalFilterState } from '../models/filter-config.model';
import { Page } from '../models/page.model';
import { GridCellPosition } from '../models/layout.model';

@Injectable({ providedIn: 'root' })
export class BuilderStateService {
  private readonly state: BuilderState = {
    currentPageId: null,
    pages: new Map<string, Page>(),
    selectedComponentIds: new Set<string>(),
  };

  private readonly refs: BuilderStateRefs = {
    globalFilters$: new BehaviorSubject<GlobalFilterState[]>([]),
    pageLayout$: new BehaviorSubject<Page | null>(null),
    componentRegistry$: new BehaviorSubject<ComponentInstance[]>([]),
  };

  private selection$ = new BehaviorSubject<string[]>([]);

  readonly globalFilters$ = this.refs.globalFilters$.asObservable();
  readonly pageLayout$ = this.refs.pageLayout$.asObservable();
  readonly componentRegistry$ = this.refs.componentRegistry$.asObservable();
  readonly selectionChanges$ = this.selection$.asObservable();

  constructor(private readonly api: BuilderApiService) {}

  loadWorkspace(): Observable<Page[]> {
    return this.api.listPages().pipe(
      map((pages) => {
        pages.forEach((page) => this.state.pages.set(page.id, page));
        if (!this.state.currentPageId && pages.length) {
          this.setCurrentPage(pages[0].id);
        }
        return pages;
      })
    );
  }

  setCurrentPage(pageId: string): void {
    if (!this.state.pages.has(pageId)) {
      return;
    }
    this.state.currentPageId = pageId;
    const page = this.state.pages.get(pageId) ?? null;
    this.refs.pageLayout$.next(page);
    this.refs.componentRegistry$.next(page?.layout.components ?? []);
  }

  getCurrentPageSnapshot(): Page | null {
    const id = this.state.currentPageId;
    return id ? this.state.pages.get(id) ?? null : null;
  }

  setGlobalFilters(filters: GlobalFilterState[]): void {
    this.refs.globalFilters$.next(filters);
  }

  upsertComponent(component: ComponentInstance): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const index = page.layout.components.findIndex((c) => c.id === component.id);
    if (index > -1) {
      page.layout.components[index] = { ...page.layout.components[index], ...component };
    } else {
      page.layout.components.push(component);
    }
    this.refs.componentRegistry$.next([...page.layout.components]);
    this.persist(page);
  }

  updateComponentPosition(id: string, position: Partial<GridCellPosition>): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const component = page.layout.components.find((c) => c.id === id);
    if (!component) return;
    component.position = {
      ...component.position,
      ...position,
    };
    this.refs.componentRegistry$.next([...page.layout.components]);
    this.persist(page);
  }

  updateComponentStyle(id: string, patch: Partial<ComponentInstance['style']>): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const component = page.layout.components.find((c) => c.id === id);
    if (!component) return;
    component.style = {
      ...component.style,
      ...patch,
    };
    this.refs.componentRegistry$.next([...page.layout.components]);
    this.persist(page);
  }

  attachActions(id: string, actions: ActionBinding[]): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const component = page.layout.components.find((c) => c.id === id);
    if (!component) return;
    component.actions = [...actions];
    this.persistAndEmit(page);
  }

  attachViewConfig(id: string, config: ComponentInstance['view']): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const component = page.layout.components.find((c) => c.id === id);
    if (!component) return;
    component.view = config;
    this.persistAndEmit(page);
  }

  deleteComponent(id: string): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.components = page.layout.components.filter((c) => c.id !== id);
    this.state.selectedComponentIds.delete(id);
    this.selection$.next([...this.state.selectedComponentIds]);
    this.persistAndEmit(page);
  }

  duplicateComponent(id: string): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const component = page.layout.components.find((c) => c.id === id);
    if (!component) return;
    const clone: ComponentInstance = {
      ...structuredClone(component),
      id: crypto.randomUUID(),
      position: {
        ...component.position,
        colStart: component.position.colStart + 1,
      },
      title: `${component.title} (cópia)`
    };
    page.layout.components.push(clone);
    this.persistAndEmit(page);
    this.selectComponent(clone.id);
  }

  groupComponents(ids: string[], groupId: string = crypto.randomUUID()): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.components = page.layout.components.map((component) =>
      ids.includes(component.id) ? { ...component, groupId } : component
    );
    this.persistAndEmit(page);
  }

  ungroupComponents(ids: string[]): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.components = page.layout.components.map((component) =>
      ids.includes(component.id) ? { ...component, groupId: undefined } : component
    );
    this.persistAndEmit(page);
  }

  setSelection(ids: string[]): void {
    this.state.selectedComponentIds = new Set(ids);
    this.selection$.next(ids);
  }

  selectComponent(id: string): void {
    this.setSelection([id]);
  }

  bringToFront(id: string): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    const maxZ = Math.max(0, ...page.layout.components.map((c) => c.style?.zIndex ?? 0));
    this.updateComponentStyle(id, { zIndex: maxZ + 1 });
  }

  sendToBack(id: string): void {
    this.updateComponentStyle(id, { zIndex: 0 });
  }

  lockComponent(id: string, locked: boolean): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.components = page.layout.components.map((component) =>
      component.id === id ? { ...component, locked } : component
    );
    this.persistAndEmit(page);
  }

  freezeComponent(id: string, frozen: boolean): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.components = page.layout.components.map((component) =>
      component.id === id ? { ...component, style: { ...component.style, frozen } } : component
    );
    this.persistAndEmit(page);
  }

  updateFilterBar(layout: Page['layout']['filterBar']): void {
    const page = this.getCurrentPageSnapshot();
    if (!page) return;
    page.layout.filterBar = layout;
    this.persistAndEmit(page);
  }

  saveCurrentPage(): Observable<Page> {
    const page = this.getCurrentPageSnapshot();
    if (!page) {
      throw new Error('Página não selecionada');
    }
    return this.api.savePage(page);
  }

  private persist(page: Page): void {
    page.updatedAt = new Date().toISOString();
    this.state.pages.set(page.id, structuredClone(page));
    this.api.queuePersist(page);
  }

  private persistAndEmit(page: Page): void {
    this.refs.componentRegistry$.next([...page.layout.components]);
    this.persist(page);
  }
}
