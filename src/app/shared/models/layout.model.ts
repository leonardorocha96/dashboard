import { ComponentInstance } from './component-instance.model';
import { FilterDefinition } from './filter-config.model';

export interface GridCellPosition {
  rowStart: number;
  colStart: number;
  rowSpan: number;
  colSpan: number;
}

export interface CanvasStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  gap?: string;
  minRowHeight?: number;
}

export interface PageLayout {
  id: string;
  name: string;
  grid: CanvasStyle;
  components: ComponentInstance[];
  filterBar?: FilterBarLayout;
}

export interface FilterBarLayout {
  fixed?: boolean;
  backgroundColor?: string;
  showApplyButton?: boolean;
  requireSelectionBeforeRender?: boolean;
  definitions?: FilterDefinition[];
}

export interface PageSettings {
  theme: string;
  resolutionClass: string;
  previewScale: number;
}

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  thumbnail: string;
  page: PageLayout;
}
