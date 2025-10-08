export type WidgetType = 'line' | 'bar' | 'pie' | 'doughnut';

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  title: string;
  palette: string;
  showLegend: boolean;
}

export interface WidgetDataPoint {
  category: string;
  value: number;
  secondaryValue?: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  config: WidgetConfig;
  data: WidgetDataPoint[];
}

export interface WidgetPaletteItem {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
}

export interface PaletteOption {
  label: string;
  value: string;
}
