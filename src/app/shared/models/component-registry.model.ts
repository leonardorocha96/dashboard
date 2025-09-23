import { ComponentType } from './component-instance.model';

export interface ComponentPanelDefinition {
  id: string;
  label: string;
  icon: string;
  formSchema: ComponentPanelField[];
}

export interface ComponentPanelField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'toggle' | 'json';
  options?: { label: string; value: unknown }[];
  hint?: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  icon: string;
  title: string;
  description: string;
  defaultSize: { colSpan: number; rowSpan: number };
  component: unknown;
  panels: ComponentPanelDefinition[];
  defaultConfig?: Record<string, unknown>;
}
