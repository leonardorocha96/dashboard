import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ComponentTemplate,
  DashboardComponentModel,
  DashboardPage,
  DashboardProject,
  DataSource,
  DeviceMode,
  LayoutDimensions,
  SideNavItem,
} from './models/dashboard.models';
import { BuilderStateService } from './services/builder-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly project$: Observable<DashboardProject> = this.state.project$;
  readonly pages$: Observable<DashboardPage[]> = this.state.pages$;
  readonly activePage$ = this.state.activePage$;
  readonly activePageId$ = this.state.activePageId$;
  readonly selectedComponent$ = this.state.selectedComponent$;
  readonly dataSources$: Observable<DataSource[]> = this.state.dataSources$;

  readonly sideNavItems: SideNavItem[] = [
    { id: 'library', icon: 'view_module', label: 'Componentes' },
    { id: 'data', icon: 'database', label: 'Fontes de Dados' },
    { id: 'models', icon: 'timeline', label: 'Modelos' },
    { id: 'settings', icon: 'settings', label: 'Configurações' },
  ];

  activePanelId = 'library';
  activeSideItemId = 'library';
  viewMode: DeviceMode = 'desktop';
  showDataSourcesDrawer = false;
  showPreview = false;

  readonly componentLibrary: ComponentTemplate[] = COMPONENT_LIBRARY;

  constructor(private readonly state: BuilderStateService) {}

  onAddComponent(template: ComponentTemplate): void {
    this.state.addComponentFromTemplate(template);
    this.activePanelId = 'library';
    this.activeSideItemId = 'library';
  }

  onComponentSelected(component: DashboardComponentModel | null): void {
    this.state.selectComponent(component?.id ?? null);
  }

  onComponentMoved(event: { componentId: string; position: LayoutDimensions }): void {
    this.state.moveComponent(event.componentId, event.position);
  }

  onComponentUpdated(event: { componentId: string; changes: any }): void {
    this.state.updateComponent(event.componentId, event.changes);
  }

  onNavItemSelected(itemId: string): void {
    this.activeSideItemId = itemId;
    if (itemId === 'data') {
      this.showDataSourcesDrawer = true;
      return;
    }

    this.activePanelId = itemId;
  }

  onCloseDataSources(): void {
    this.showDataSourcesDrawer = false;
    this.activeSideItemId = this.activePanelId;
  }

  onDataSourceCreated(dataSource: DataSource): void {
    this.state.upsertDataSource(dataSource);
  }

  onDataSourceRemoved(dataSourceId: string): void {
    this.state.removeDataSource(dataSourceId);
  }

  onPageSelected(pageId: string): void {
    this.state.setActivePage(pageId);
  }

  onAddPage(): void {
    this.state.addPage();
  }

  onDuplicatePage(pageId: string): void {
    this.state.duplicatePage(pageId);
  }

  onRenamePage(event: { pageId: string; name: string }): void {
    this.state.renamePage(event.pageId, event.name);
  }

  onDeviceModeChange(mode: DeviceMode): void {
    this.viewMode = mode;
  }

  onToggleDataSources(): void {
    this.showDataSourcesDrawer = !this.showDataSourcesDrawer;
    this.activeSideItemId = this.showDataSourcesDrawer ? 'data' : this.activePanelId;
  }

  onPublish(): void {
    this.state.updateProjectStatus('publicado');
  }

  onSaveDraft(): void {
    this.state.updateProjectStatus('rascunho');
  }

  onPreview(): void {
    this.showPreview = true;
  }

  onClosePreview(): void {
    this.showPreview = false;
  }

  onPreviewSelectPage(pageId: string): void {
    this.state.setActivePage(pageId);
  }
}

const COMPONENT_LIBRARY: ComponentTemplate[] = [
  {
    id: 'kpi-principal',
    name: 'Cartão KPI',
    description: 'Indicador principal com variação vs. período anterior.',
    type: 'kpi',
    category: 'indicadores',
    icon: 'speed',
    defaultSize: { width: 280, height: 160 },
    defaultData: {
      dataSourceId: 'ds-financeiro',
      collectionId: 'financeiro_resultados_mensais',
      metric: 'receita_total',
      comparisonMetric: 'receita_total_anterior',
    },
  },
  {
    id: 'kpi-comparativo',
    name: 'KPI Comparativo',
    description: 'Cartão com duas métricas lado a lado para comparar indicadores.',
    type: 'comparativo',
    category: 'indicadores',
    icon: 'monitoring',
    defaultSize: { width: 320, height: 180 },
    defaultData: {
      dataSourceId: 'ds-crm',
      collectionId: 'crm_vendas_por_vendedor',
      metric: 'ticket_medio',
      comparisonMetric: 'ticket_medio_anterior',
    },
  },
  {
    id: 'grafico-linhas',
    name: 'Linha Temporal',
    description: 'Gráfico de linhas para evolução de métricas ao longo do tempo.',
    type: 'linha',
    category: 'graficos',
    icon: 'show_chart',
    defaultSize: { width: 560, height: 320 },
    defaultData: {
      dataSourceId: 'ds-financeiro',
      collectionId: 'financeiro_resultados_mensais',
      metric: 'receita_total',
      dimension: 'mes',
    },
  },
  {
    id: 'grafico-barras',
    name: 'Barras Agrupadas',
    description: 'Comparação entre categorias utilizando barras verticais.',
    type: 'barra',
    category: 'graficos',
    icon: 'stacked_bar_chart',
    defaultSize: { width: 520, height: 320 },
    defaultData: {
      dataSourceId: 'ds-crm',
      collectionId: 'crm_receita_categoria',
      metric: 'quantidade_vendida',
      dimension: 'categoria',
    },
  },
  {
    id: 'grafico-pizza',
    name: 'Pizza / Donut',
    description: 'Distribuição percentual por dimensão.',
    type: 'pizza',
    category: 'graficos',
    icon: 'donut_small',
    defaultSize: { width: 360, height: 300 },
    defaultData: {
      dataSourceId: 'ds-crm',
      collectionId: 'crm_receita_regiao',
      metric: 'receita_total',
      dimension: 'regiao',
    },
  },
  {
    id: 'tabela-simples',
    name: 'Tabela Resumo',
    description: 'Tabela com métricas chave por dimensão.',
    type: 'tabela',
    category: 'tabelas',
    icon: 'table_rows',
    defaultSize: { width: 520, height: 320 },
    defaultData: {
      dataSourceId: 'ds-crm',
      collectionId: 'crm_top_clientes',
      metric: 'receita_total',
      dimension: 'cliente',
    },
  },
  {
    id: 'tabela-dinamica',
    name: 'Tabela Dinâmica',
    description: 'Pivot table com agrupamentos personalizáveis.',
    type: 'tabela-dinamica',
    category: 'tabelas',
    icon: 'pivot_table_chart',
    defaultSize: { width: 560, height: 360 },
    defaultData: {
      dataSourceId: 'ds-crm',
      collectionId: 'crm_vendas_por_vendedor',
      metric: 'valor_total',
      dimension: 'vendedor',
    },
  },
  {
    id: 'filtro-data',
    name: 'Filtro de Datas',
    description: 'Filtro de intervalo de datas com presets.',
    type: 'filtro-data',
    category: 'filtros',
    icon: 'event',
    defaultSize: { width: 280, height: 120 },
  },
  {
    id: 'filtro-lista',
    name: 'Filtro Multi-select',
    description: 'Seleção de múltiplos valores com busca.',
    type: 'filtro-lista',
    category: 'filtros',
    icon: 'filter_list',
    defaultSize: { width: 280, height: 140 },
  },
  {
    id: 'texto-livre',
    name: 'Texto Rico',
    description: 'Caixa de texto para títulos, descrições e instruções.',
    type: 'texto',
    category: 'texto',
    icon: 'title',
    defaultSize: { width: 360, height: 120 },
  },
  {
    id: 'imagem-ilustrativa',
    name: 'Imagem',
    description: 'Bloco de imagem responsiva.',
    type: 'imagem',
    category: 'texto',
    icon: 'image',
    defaultSize: { width: 360, height: 220 },
  },
  {
    id: 'iframe-externo',
    name: 'Conteúdo Externo',
    description: 'Embed de aplicações externas ou páginas web.',
    type: 'iframe',
    category: 'avancado',
    icon: 'iframe',
    defaultSize: { width: 520, height: 360 },
  },
];
