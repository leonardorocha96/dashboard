import { GridCellPosition } from './layout.model';
import { ViewConfig } from './view-config.model';
import { ActionBinding } from './action-config.model';
import { ComponentPanelDefinition } from './component-registry.model';
import { FilterBinding } from './filter-config.model';

export type ComponentType =
  | 'board'
  | 'data-grid'
  | 'chart'
  | 'label'
  | 'image'
  | 'input-text'
  | 'input-number'
  | 'input-date-range'
  | 'input-checkbox'
  | 'input-multi-select'
  | 'selector';

export interface ComponentStyle {
  zIndex?: number;
  minHeight?: number;
  minWidth?: number;
  backgroundColor?: string;
  borderRadius?: string;
  opacity?: number;
  frozen?: boolean;
}

export interface ComponentInstance {
  id: string;
  componentType: ComponentType;
  title: string;
  position: GridCellPosition;
  style: ComponentStyle;
  view?: ViewConfig;
  filters?: FilterBinding[];
  actions?: ActionBinding[];
  groupId?: string;
  locked?: boolean;
  metadata?: Record<string, unknown>;
  panels?: ComponentPanelDefinition[];
}
