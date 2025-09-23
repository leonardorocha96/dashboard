export type FilterComponentType =
  | 'text'
  | 'number'
  | 'dateRange'
  | 'checkbox'
  | 'multiSelect'
  | 'selector';

export interface FilterDefinition {
  id: string;
  name: string;
  label: string;
  component: FilterComponentType;
  dimension: string;
  options?: unknown[];
  primaryColor?: string;
  secondaryColor?: string;
  waitForApply?: boolean;
}

export interface FilterBinding {
  filterId: string;
  operator?: string;
  field?: string;
}

export interface GlobalFilterState {
  definition: FilterDefinition;
  value: unknown;
}
