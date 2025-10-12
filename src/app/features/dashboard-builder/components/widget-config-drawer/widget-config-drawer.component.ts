import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DashboardWidget, WidgetConfig } from '../../dashboard-builder.models';
import { DataService, DataSet } from '../../services/data.service';

@Component({
  selector: 'app-widget-config-drawer',
  templateUrl: './widget-config-drawer.component.html',
  styleUrls: ['./widget-config-drawer.component.scss']
})
export class WidgetConfigDrawerComponent implements OnChanges, OnDestroy {
  @Input() widget: DashboardWidget | null = null;
  @Input() palettes: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<WidgetConfig>();
  @Output() randomizeData = new EventEmitter<void>();
  @Output() changeDataSet = new EventEmitter<string>();

  dataSets: DataSet[] = [];
  private destroy$ = new Subject<void>();
  private configChange$ = new Subject<WidgetConfig>();

  form: WidgetConfig = {
    title: '',
    palette: '',
    showLegend: true,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    showTooltips: true,
    tooltipFormat: 'default',
    enableAnimation: true,
    animationDuration: 1000,
    showGrid: true,
    showXAxisLabels: true,
    showYAxisLabels: true,
    lineWidth: 2,
    lineStyle: 'solid',
    markerSize: 6,
    showMarkers: true,
    barSpacing: 0.1,
    barCornerRadius: 0,
    innerRadius: 0,
    startAngle: 0,
    showLabels: true,
    labelPosition: 'outside',
    dataSetId: 'vendas-2025'
  };

  constructor(private dataService: DataService) {
    this.dataSets = this.dataService.getDataSets();
    
    this.configChange$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(config => {
      this.update.emit({ ...config });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget'] && this.widget) {
      this.form = { ...this.widget.config };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConfigChange(): void {
    this.configChange$.next(this.form);
  }

  onDataSetChange(dataSetId: string): void {
    this.form.dataSetId = dataSetId;
    this.onConfigChange();
    this.changeDataSet.emit(dataSetId);
  }

  onRandomizeData(): void {
    this.randomizeData.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.update.emit(this.form);
  }

  trackPalette(index: number, palette: string): string {
    return palette;
  }

  getDataSetDescription(): string {
    if (!this.form.dataSetId) return '';
    const dataSet = this.dataSets.find(ds => ds.id === this.form.dataSetId);
    return dataSet?.description || '';
  }

  // Helper methods
  getPaletteDisplayName(palette: string): string {
    const paletteNames: Record<string, string> = {
      'Material': 'Material Design',
      'Office': 'Office',
      'Pastel': 'Cores Pastel',
      'Bright': 'Cores Vibrantes',
      'Harmony Light': 'Harmonia Clara',
      'Ocean': 'Oceano',
      'Default Light': 'Padrão Claro'
    };
    return paletteNames[palette] || palette;
  }

  getTooltipFormatDisplayName(format: string): string {
    const formats: Record<string, string> = {
      'default': 'Padrão',
      'currency': 'Moeda (R$)',
      'percentage': 'Porcentagem (%)',
      'decimal': 'Decimal',
      'thousands': 'Milhares (K)'
    };
    return formats[format] || format;
  }

  getLineStyleDisplayName(style: string): string {
    const styles: Record<string, string> = {
      'solid': 'Sólida',
      'dashed': 'Tracejada',
      'dotted': 'Pontilhada'
    };
    return styles[style] || style;
  }

  getPieLabelPositionDisplayName(position: string): string {
    const positions: Record<string, string> = {
      'inside': 'Dentro',
      'outside': 'Fora',
      'none': 'Oculto'
    };
    return positions[position] || position;
  }

  getDataSetDisplayName(dataSetId: string): string {
    const dataSet = this.dataSets.find(ds => ds.id === dataSetId);
    return dataSet ? dataSet.name : dataSetId;
  }

  isChartType(): boolean {
    return this.widget?.type === 'line' || this.widget?.type === 'bar';
  }

  isLineChart(): boolean {
    return this.widget?.type === 'line';
  }

  isBarChart(): boolean {
    return this.widget?.type === 'bar';
  }

  isPieChart(): boolean {
    return this.widget?.type === 'pie' || this.widget?.type === 'doughnut';
  }

  // Novos métodos helper para template
  isLineOrBarChart(): boolean {
    return this.widget?.type === 'line' || this.widget?.type === 'bar';
  }

  isDoughnutChart(): boolean {
    return this.widget?.type === 'doughnut';
  }

  isPieOrDoughnutChart(): boolean {
    return this.widget?.type === 'pie' || this.widget?.type === 'doughnut';
  }
}