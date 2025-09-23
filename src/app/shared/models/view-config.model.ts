export type ViewMode = 'analysis' | 'catalog' | 'sql';

export interface BaseViewConfig {
  id: string;
  componentId: string;
  mode: ViewMode;
  cacheTtl?: number;
}

export interface AnalysisViewConfig extends BaseViewConfig {
  mode: 'analysis';
  source: string;
  dimensions: string[];
  measures: string[];
  groupBy?: string[];
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count'>;
  order?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

export interface CatalogViewConfig extends BaseViewConfig {
  mode: 'catalog';
  table: string;
  primaryKey: string;
  searchableFields?: string[];
  pageSize?: number;
  allowCreate?: boolean;
  allowUpdate?: boolean;
  allowDelete?: boolean;
}

export interface SqlViewConfig extends BaseViewConfig {
  mode: 'sql';
  queryId: string;
  params?: Record<string, unknown>;
  allowExport?: boolean;
}

export type ViewConfig = AnalysisViewConfig | CatalogViewConfig | SqlViewConfig;

export interface ViewDataResponse<T = unknown> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  fields?: string[];
  meta?: Record<string, unknown>;
}
