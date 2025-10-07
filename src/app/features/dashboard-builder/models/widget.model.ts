export type WidgetType = 'line' | 'bar' | 'pie' | 'doughnut';

export interface WidgetPaletteItem {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
}

export interface WidgetSettings {
  showLegend: boolean;
  palette: string[];
  seriesColor: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  dataKey: string;
  width: number;
  height: number;
  settings: WidgetSettings;
}
