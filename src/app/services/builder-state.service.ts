import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import {
  ComponentTemplate,
  DashboardComponentDataBinding,
  DashboardComponentModel,
  DashboardComponentStyle,
  DashboardPage,
  DashboardProject,
  DataCollection,
  DataSource,
  LayoutDimensions,
} from '../models/dashboard.models';
import { createId } from '../utils/id';
import { OPERATIONAL_DATA_SOURCES } from '../data/operational-datasets';

interface ComponentUpdate {
  title?: string;
  subtitle?: string;
  data?: Partial<DashboardComponentDataBinding>;
  style?: Partial<DashboardComponentStyle>;
  position?: Partial<LayoutDimensions>;
}

@Injectable({ providedIn: 'root' })
export class BuilderStateService {
  private readonly projectSubject = new BehaviorSubject<DashboardProject>({
    id: createId('project'),
    name: 'Vendas - Painel Executivo',
    folder: 'Diretoria',
    status: 'rascunho',
    description: 'Painel integrado com visão geral de vendas e indicadores críticos.',
    lastUpdated: new Date().toISOString(),
  });

  private readonly dataSourcesSubject = new BehaviorSubject<DataSource[]>(
    this.buildInitialDataSources(),
  );
  private readonly pagesSubject = new BehaviorSubject<DashboardPage[]>(this.buildInitialPages());
  private readonly activePageIdSubject = new BehaviorSubject<string>(this.pagesSubject.value[0]?.id ?? '');
  private readonly selectedComponentIdSubject = new BehaviorSubject<string | null>(
    this.pagesSubject.value[0]?.components[0]?.id ?? null,
  );

  readonly project$ = this.projectSubject.asObservable();
  readonly pages$ = this.pagesSubject.asObservable();
  readonly activePageId$ = this.activePageIdSubject.asObservable();
  readonly dataSources$ = this.dataSourcesSubject.asObservable();

  readonly activePage$ = combineLatest([this.pages$, this.activePageId$]).pipe(
    map(([pages, activeId]) => pages.find(page => page.id === activeId) ?? null),
  );

  readonly selectedComponent$ = combineLatest([
    this.activePage$,
    this.selectedComponentIdSubject.asObservable(),
  ]).pipe(
    map(([page, componentId]) => page?.components.find(component => component.id === componentId) ?? null),
  );

  addComponentFromTemplate(template: ComponentTemplate): void {
    const activePageId = this.activePageIdSubject.value;
    if (!activePageId) {
      return;
    }

    const pages = this.pagesSubject.value;
    const pageIndex = pages.findIndex(page => page.id === activePageId);
    if (pageIndex === -1) {
      return;
    }

    const targetPage = pages[pageIndex];
    const newComponent = this.createComponentFromTemplate(template, targetPage);
    const updatedPage: DashboardPage = {
      ...targetPage,
      components: [...targetPage.components, newComponent],
    };

    const updatedPages = [...pages];
    updatedPages[pageIndex] = updatedPage;
    this.pagesSubject.next(updatedPages);
    this.selectedComponentIdSubject.next(newComponent.id);
    this.touchProject();
  }

  updateComponent(componentId: string, changes: ComponentUpdate): void {
    const pages = this.pagesSubject.value.map(page => {
      const hasComponent = page.components.some(component => component.id === componentId);
      if (!hasComponent) {
        return page;
      }

      const updatedComponents = page.components.map(component => {
        if (component.id !== componentId) {
          return component;
        }

        return {
          ...component,
          title: changes.title ?? component.title,
          subtitle: changes.subtitle ?? component.subtitle,
          data: {
            ...component.data,
            ...changes.data,
          },
          style: {
            ...component.style,
            ...changes.style,
          },
          position: {
            ...component.position,
            ...changes.position,
          },
        };
      });

      return {
        ...page,
        components: updatedComponents,
      };
    });

    this.pagesSubject.next(pages);
    this.touchProject();
  }

  moveComponent(componentId: string, position: LayoutDimensions): void {
    this.updateComponent(componentId, { position });
  }

  selectComponent(componentId: string | null): void {
    this.selectedComponentIdSubject.next(componentId);
  }

  setActivePage(pageId: string): void {
    if (this.activePageIdSubject.value === pageId) {
      return;
    }

    this.activePageIdSubject.next(pageId);
    const activePage = this.pagesSubject.value.find(page => page.id === pageId);
    this.selectedComponentIdSubject.next(activePage?.components[0]?.id ?? null);
  }

  addPage(): void {
    const page: DashboardPage = {
      id: createId('page'),
      name: `Página ${this.pagesSubject.value.length + 1}`,
      components: [],
    };

    this.pagesSubject.next([...this.pagesSubject.value, page]);
    this.setActivePage(page.id);
    this.touchProject();
  }

  renamePage(pageId: string, name: string): void {
    this.pagesSubject.next(
      this.pagesSubject.value.map(page => (page.id === pageId ? { ...page, name } : page)),
    );
    this.touchProject();
  }

  duplicatePage(pageId: string): void {
    const sourcePage = this.pagesSubject.value.find(page => page.id === pageId);
    if (!sourcePage) {
      return;
    }

    const clone: DashboardPage = {
      id: createId('page'),
      name: `${sourcePage.name} (cópia)`,
      components: sourcePage.components.map(component => ({
        ...component,
        id: createId('component'),
        position: { ...component.position, y: component.position.y + 32 },
      })),
    };

    this.pagesSubject.next([...this.pagesSubject.value, clone]);
    this.setActivePage(clone.id);
    this.touchProject();
  }

  updateProjectStatus(status: DashboardProject['status']): void {
    this.projectSubject.next({
      ...this.projectSubject.value,
      status,
      lastUpdated: new Date().toISOString(),
    });
  }

  upsertDataSource(dataSource: DataSource): void {
    const existingIndex = this.dataSourcesSubject.value.findIndex(item => item.id === dataSource.id);
    if (existingIndex === -1) {
      this.dataSourcesSubject.next([...this.dataSourcesSubject.value, dataSource]);
    } else {
      const updated = [...this.dataSourcesSubject.value];
      updated[existingIndex] = dataSource;
      this.dataSourcesSubject.next(updated);
    }
  }

  createDataSource(partial: Omit<DataSource, 'id' | 'lastUpdate'> & { lastUpdate?: string }): DataSource {
    const dataSource: DataSource = {
      ...partial,
      id: createId('ds'),
      lastUpdate: partial.lastUpdate ?? new Date().toISOString(),
    };

    this.upsertDataSource(dataSource);
    return dataSource;
  }

  removeDataSource(dataSourceId: string): void {
    this.dataSourcesSubject.next(
      this.dataSourcesSubject.value.filter(item => item.id !== dataSourceId),
    );
  }

  private createComponentFromTemplate(
    template: ComponentTemplate,
    page: DashboardPage,
  ): DashboardComponentModel {
    const defaultDataSourceId = this.dataSourcesSubject.value[0]?.id;
    const resolvedDataSourceId = template.defaultData?.dataSourceId ?? defaultDataSourceId;
    const resolvedCollectionId = this.findCollectionId(
      resolvedDataSourceId,
      template.defaultData?.collectionId,
      template.defaultData?.metric,
      template.defaultData?.dimension,
      template.defaultData?.comparisonMetric,
    );
    const gridColumn = page.components.length % 2;
    const gridRow = Math.floor(page.components.length / 2);

    return {
      id: createId('component'),
      templateId: template.id,
      title: template.name,
      type: template.type,
      position: {
        x: 32 + gridColumn * (template.defaultSize.width + 32),
        y: 32 + gridRow * (template.defaultSize.height + 24),
        width: template.defaultSize.width,
        height: template.defaultSize.height,
      },
      data: {
        dataSourceId: resolvedDataSourceId,
        collectionId: resolvedCollectionId,
        metric: template.defaultData?.metric ?? '',
        dimension: template.defaultData?.dimension ?? '',
        comparisonMetric: template.defaultData?.comparisonMetric ?? '',
        filters: template.defaultData?.filters ?? [],
      },
      style: {
        backgroundColor: '#ffffff',
        accentColor: '#2ec4b6',
        textColor: '#0d1b2a',
        showBorder: false,
        cornerRadius: 12,
      },
    };
  }

  private findCollectionId(
    dataSourceId: string | undefined,
    preferredCollectionId?: string,
    metric?: string,
    dimension?: string,
    comparisonMetric?: string,
  ): string | undefined {
    if (!dataSourceId) {
      return preferredCollectionId;
    }

    const source = this.dataSourcesSubject.value.find(item => item.id === dataSourceId);
    if (!source) {
      return preferredCollectionId;
    }

    const collections = source.collections ?? [];
    if (preferredCollectionId && collections.some(collection => collection.id === preferredCollectionId)) {
      return preferredCollectionId;
    }

    const compatible = collections.find(collection =>
      this.collectionSupportsBinding(collection, metric, dimension, comparisonMetric),
    );
    if (compatible) {
      return compatible.id;
    }

    if (source.defaultCollectionId && collections.some(item => item.id === source.defaultCollectionId)) {
      return source.defaultCollectionId;
    }

    return collections[0]?.id;
  }

  private collectionSupportsBinding(
    collection: DataCollection,
    metric?: string,
    dimension?: string,
    comparisonMetric?: string,
  ): boolean {
    const fieldIds = new Set(collection.fields.map(field => field.id));
    const hasMetric = !metric || fieldIds.has(metric);
    const hasDimension = !dimension || fieldIds.has(dimension);
    const hasComparison = !comparisonMetric || fieldIds.has(comparisonMetric);

    return hasMetric && hasDimension && hasComparison;
  }

  private touchProject(): void {
    this.projectSubject.next({
      ...this.projectSubject.value,
      lastUpdated: new Date().toISOString(),
    });
  }

  private buildInitialPages(): DashboardPage[] {
    const componentKpi: DashboardComponentModel = {
      id: createId('component'),
      templateId: 'kpi-principal',
      title: 'Receita Mensal',
      type: 'kpi',
      position: { x: 32, y: 32, width: 280, height: 160 },
      data: {
        dataSourceId: 'ds-financeiro',
        collectionId: 'financeiro_resultados_mensais',
        metric: 'receita_total',
        comparisonMetric: 'receita_total_anterior',
      },
      style: {
        backgroundColor: '#ffffff',
        accentColor: '#2ec4b6',
        textColor: '#0d1b2a',
        showBorder: false,
        cornerRadius: 12,
      },
    };

    const componentGrafico: DashboardComponentModel = {
      id: createId('component'),
      templateId: 'grafico-linhas',
      title: 'Evolução de Vendas',
      type: 'linha',
      position: { x: 344, y: 32, width: 560, height: 320 },
      data: {
        dataSourceId: 'ds-financeiro',
        collectionId: 'financeiro_resultados_mensais',
        metric: 'receita_total',
        dimension: 'mes',
      },
      style: {
        backgroundColor: '#ffffff',
        accentColor: '#2ec4b6',
        textColor: '#0d1b2a',
        showBorder: false,
        cornerRadius: 12,
      },
    };

    const componentTabela: DashboardComponentModel = {
      id: createId('component'),
      templateId: 'tabela-desempenho',
      title: 'Top Clientes',
      type: 'tabela',
      position: { x: 32, y: 216, width: 280, height: 320 },
      data: {
        dataSourceId: 'ds-crm',
        collectionId: 'crm_top_clientes',
        metric: 'valor_total',
        dimension: 'cliente',
      },
      style: {
        backgroundColor: '#ffffff',
        accentColor: '#2ec4b6',
        textColor: '#0d1b2a',
        showBorder: true,
        cornerRadius: 12,
      },
    };

    return [
      {
        id: createId('page'),
        name: 'Visão Geral',
        components: [componentKpi, componentGrafico, componentTabela],
      },
    ];
  }

  private buildInitialDataSources(): DataSource[] {
    return this.cloneDataSources(OPERATIONAL_DATA_SOURCES);
  }

  private cloneDataSources(sources: DataSource[]): DataSource[] {
    return sources.map(source => ({
      ...source,
      collections: (source.collections ?? []).map(collection => ({
        ...collection,
        fields: collection.fields.map(field => ({ ...field })),
        rows: collection.rows.map(row => ({ ...row })),
      })),
    }));
  }
}
