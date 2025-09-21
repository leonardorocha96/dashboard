export type DashboardComponentType =
  | 'kpi'
  | 'comparativo'
  | 'barra'
  | 'linha'
  | 'pizza'
  | 'area'
  | 'tabela'
  | 'tabela-dinamica'
  | 'mapa'
  | 'filtro-data'
  | 'filtro-lista'
  | 'texto'
  | 'imagem'
  | 'iframe';

export interface LayoutDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardComponentDataBinding {
  dataSourceId?: string;
  metric?: string;
  dimension?: string;
  comparisonMetric?: string;
  filters?: string[];
}

export interface DashboardComponentStyle {
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  showBorder: boolean;
  cornerRadius: number;
}

export interface DashboardComponentModel {
  id: string;
  templateId: string;
  title: string;
  subtitle?: string;
  type: DashboardComponentType;
  position: LayoutDimensions;
  data: DashboardComponentDataBinding;
  style: DashboardComponentStyle;
}

export interface DashboardPage {
  id: string;
  name: string;
  components: DashboardComponentModel[];
}

export interface DashboardProject {
  id: string;
  name: string;
  folder: string;
  status: 'rascunho' | 'publicado';
  description?: string;
  lastUpdated: string;
}

export type ComponentCategory =
  | 'indicadores'
  | 'graficos'
  | 'tabelas'
  | 'filtros'
  | 'texto'
  | 'avancado';

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  type: DashboardComponentType;
  category: ComponentCategory;
  icon: string;
  defaultSize: {
    width: number;
    height: number;
  };
  defaultData?: Partial<DashboardComponentDataBinding>;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'sql' | 'rest' | 'csv' | 'sankhya' | 'sheet';
  status: 'conectado' | 'erro' | 'desconectado';
  refresh: 'tempo-real' | 'sob-demanda' | 'agendado';
  lastUpdate: string;
  owner: string;
  description?: string;
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface SideNavItem {
  id: string;
  icon: string;
  label: string;
}
