export type WidgetType = 'line' | 'bar' | 'pie' | 'doughnut';

export interface WidgetSize {
  width: number;
  height: number;
  position?: {
    x: number;
    y: number;
  };
}

export interface WidgetConfig {
  title: string;
  palette: string;
  showLegend: boolean;
  // Configurações de aparência
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  // Configurações de grid/eixos
  showGrid?: boolean;
  gridColor?: string;
  showXAxisLabels?: boolean;
  showYAxisLabels?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  // Configurações de tooltips
  showTooltips?: boolean;
  tooltipFormat?: string;
  // Configurações específicas para gráficos de linha
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineWidth?: number;
  showMarkers?: boolean;
  markerSize?: number;
  // Configurações específicas para gráficos de barra
  barSpacing?: number;
  barCornerRadius?: number;
  // Configurações específicas para gráficos de pizza
  innerRadius?: number;
  startAngle?: number;
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside';
  // Configurações de animação
  enableAnimation?: boolean;
  animationDuration?: number;
  // Configurações de dados
  showSecondaryData?: boolean;
  secondaryDataName?: string;
  dataSetId?: string;
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
  position?: { x: number; y: number }; // Adicionando suporte a posição
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
