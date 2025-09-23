export type ActionType =
  | 'filterOtherComponents'
  | 'openDetailsModal'
  | 'dbAction'
  | 'apiCall'
  | 'createOrUpdate'
  | 'sendEmail';

export interface ActionTarget {
  componentIds?: string[];
  viewId?: string;
  endpoint?: string;
  method?: string;
}

export interface ActionBinding {
  id: string;
  type: ActionType;
  label: string;
  trigger: ComponentTrigger;
  target: ActionTarget;
  payload?: Record<string, unknown>;
  rateLimitPerMinute?: number;
  audit?: boolean;
}

export type ComponentTrigger =
  | 'onClick'
  | 'onRowDoubleClick'
  | 'onSelectionChange'
  | 'onFilterApply';

export interface ActionExecutionContext {
  componentId: string;
  trigger: ComponentTrigger;
  data?: unknown;
  selection?: unknown;
  filters?: Record<string, unknown>;
}
