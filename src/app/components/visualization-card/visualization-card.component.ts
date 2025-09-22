import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

import {
  DashboardComponentModel,
  DataCollection,
  DataCollectionField,
  DataCollectionRecord,
  DataSource,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-visualization-card',
  templateUrl: './visualization-card.component.html',
  styleUrls: ['./visualization-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationCardComponent implements OnChanges {
  @Input() component!: DashboardComponentModel;
  @Input() dataSource: DataSource | null = null;
  @Input() collection: DataCollection | null = null;
  @Input() mode: 'builder' | 'preview' = 'builder';

  chartOptions: EChartsOption | null = null;
  sparklineOptions: EChartsOption | null = null;
  tableColumns: TableColumn[] = [];
  tableRows: TableRow[] = [];
  kpiView: KpiView | null = null;
  comparativoView: ComparativoView | null = null;
  hasData = false;
  emptyMessage = 'Selecione uma fonte de dados com métricas disponíveis.';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component'] || changes['collection'] || changes['dataSource']) {
      this.buildVisualization();
    }
  }

  private buildVisualization(): void {
    this.chartOptions = null;
    this.sparklineOptions = null;
    this.tableColumns = [];
    this.tableRows = [];
    this.kpiView = null;
    this.comparativoView = null;
    this.hasData = false;
    this.emptyMessage = 'Selecione uma fonte de dados com métricas disponíveis.';

    if (!this.component) {
      this.emptyMessage = 'Componente não configurado.';
      return;
    }

    if (!this.collection || (this.collection.rows?.length ?? 0) === 0) {
      this.emptyMessage = 'Fonte de dados sem registros no momento.';
      return;
    }

    switch (this.component.type) {
      case 'kpi':
        this.buildKpiView();
        break;
      case 'comparativo':
        this.buildComparativoView();
        break;
      case 'linha':
        this.buildLineChart();
        break;
      case 'area':
        this.buildLineChart(true);
        break;
      case 'barra':
        this.buildBarChart();
        break;
      case 'pizza':
        this.buildPieChart();
        break;
      case 'tabela':
      case 'tabela-dinamica':
        this.buildTable();
        break;
      default:
        this.emptyMessage = 'Visualização disponível apenas na publicação para este tipo de componente.';
    }
  }

  private buildKpiView(): void {
    const metricField = this.getField(this.component.data.metric);
    if (!metricField) {
      this.emptyMessage = 'Configure a métrica principal do KPI.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Dados insuficientes para o KPI.';
      return;
    }

    const dimensionField = this.getField(this.component.data.dimension) ?? this.getField(this.collection?.timeFieldId);
    const comparisonField = this.getField(this.component.data.comparisonMetric);
    const latestRow = rows[rows.length - 1];
    const previousRow = rows.length > 1 ? rows[rows.length - 2] : null;

    const metricValueRaw = latestRow[metricField.id];
    const metricValue = this.formatValue(metricField, metricValueRaw);

    let comparisonLabel: string | undefined;
    let comparisonValueFormatted: string | undefined;
    let comparisonValueNumeric: number | null = null;

    if (comparisonField) {
      const comparisonRaw = latestRow[comparisonField.id];
      comparisonValueFormatted = this.formatValue(comparisonField, comparisonRaw);
      comparisonValueNumeric = this.coerceNumber(comparisonRaw);
      comparisonLabel = comparisonField.label;
    } else if (previousRow) {
      const previousMetricRaw = previousRow[metricField.id];
      comparisonValueFormatted = this.formatValue(metricField, previousMetricRaw);
      comparisonValueNumeric = this.coerceNumber(previousMetricRaw);
      const dimensionLabel = dimensionField
        ? this.formatDimension(previousRow[dimensionField.id], dimensionField)
        : 'Período anterior';
      comparisonLabel = `Anterior (${dimensionLabel})`;
    }

    const metricNumeric = this.coerceNumber(metricValueRaw);
    const variation = comparisonValueNumeric !== null ? metricNumeric - comparisonValueNumeric : null;
    const variationPercent =
      comparisonValueNumeric !== null && comparisonValueNumeric !== 0
        ? variation! / comparisonValueNumeric
        : null;

    const categories = rows.map(row =>
      dimensionField ? this.formatDimension(row[dimensionField.id], dimensionField) : `${rows.indexOf(row) + 1}`,
    );
    const trendValues = rows.map(row => this.coerceNumber(row[metricField.id]));

    const accent = this.component.style.accentColor ?? '#2ec4b6';

    this.sparklineOptions = {
      animation: false,
      grid: { left: 0, right: 0, top: 10, bottom: 0 },
      xAxis: { type: 'category', data: categories, show: false },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: trendValues,
          lineStyle: { color: accent, width: 3 },
          areaStyle: { color: this.toRgba(accent, 0.22) },
        },
      ],
      tooltip: { show: false },
    };

    this.kpiView = {
      metricLabel: metricField.label,
      metricValue,
      comparisonLabel,
      comparisonValue: comparisonValueFormatted,
      variationValue: variation !== null ? this.formatValue(metricField, variation) : undefined,
      variationPercent: variationPercent !== null ? this.formatPercentage(variationPercent) : undefined,
      positive: variation === null ? true : variation >= 0,
    };

    this.hasData = true;
  }

  private buildComparativoView(): void {
    const primaryField = this.getField(this.component.data.metric);
    const secondaryField = this.getField(this.component.data.comparisonMetric);

    if (!primaryField || !secondaryField) {
      this.emptyMessage = 'Selecione duas métricas para comparação.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Dados insuficientes para comparação.';
      return;
    }

    const latestRow = rows[rows.length - 1];
    const primaryValueRaw = latestRow[primaryField.id];
    const secondaryValueRaw = latestRow[secondaryField.id];

    const primaryNumber = this.coerceNumber(primaryValueRaw);
    const secondaryNumber = this.coerceNumber(secondaryValueRaw);
    const delta = primaryNumber - secondaryNumber;
    const ratio = secondaryNumber !== 0 ? primaryNumber / secondaryNumber - 1 : 0;

    this.comparativoView = {
      primaryLabel: primaryField.label,
      primaryValue: this.formatValue(primaryField, primaryValueRaw),
      secondaryLabel: secondaryField.label,
      secondaryValue: this.formatValue(secondaryField, secondaryValueRaw),
      deltaValue: this.formatValue(primaryField, delta),
      ratio: this.formatPercentage(ratio),
      positive: delta >= 0,
    };

    this.hasData = true;
  }

  private buildLineChart(asArea = false): void {
    const metricField = this.getField(this.component.data.metric);
    const dimensionField = this.getField(this.component.data.dimension) ?? this.getField(this.collection?.timeFieldId);

    if (!metricField || !dimensionField) {
      this.emptyMessage = 'Configure métrica e dimensão para o gráfico.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Não há dados suficientes para o gráfico.';
      return;
    }

    const categories = rows.map(row => this.formatDimension(row[dimensionField.id], dimensionField));
    const data = rows.map(row => this.coerceNumber(row[metricField.id]));
    const accent = this.component.style.accentColor ?? '#2ec4b6';

    this.chartOptions = {
      animationDuration: 300,
      grid: { left: 16, right: 16, top: 32, bottom: 16, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0d1b2a',
        textStyle: { color: '#fff' },
        borderWidth: 0,
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: false,
        axisLine: { lineStyle: { color: this.toRgba('#0d1b2a', 0.2) } },
        axisLabel: { color: this.toRgba('#0d1b2a', 0.65) },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: this.toRgba('#0d1b2a', 0.65) },
        splitLine: { lineStyle: { color: this.toRgba('#0d1b2a', 0.1) } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data,
          showSymbol: false,
          lineStyle: { width: 3, color: accent },
          areaStyle: asArea ? { color: this.toRgba(accent, 0.18) } : undefined,
        },
      ],
    };

    this.hasData = true;
  }

  private buildBarChart(): void {
    const metricField = this.getField(this.component.data.metric);
    const dimensionField = this.getField(this.component.data.dimension);

    if (!metricField || !dimensionField) {
      this.emptyMessage = 'Configure métrica e dimensão para o gráfico de barras.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Não há dados suficientes para o gráfico.';
      return;
    }

    const categories = rows.map(row => this.formatDimension(row[dimensionField.id], dimensionField));
    const data = rows.map(row => this.coerceNumber(row[metricField.id]));
    const accent = this.component.style.accentColor ?? '#2ec4b6';

    this.chartOptions = {
      animationDuration: 300,
      grid: { left: 16, right: 8, top: 24, bottom: 40, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0d1b2a',
        textStyle: { color: '#fff' },
        borderWidth: 0,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: this.toRgba('#0d1b2a', 0.2) } },
        axisLabel: { color: this.toRgba('#0d1b2a', 0.65), rotate: categories.length > 6 ? 30 : 0 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: this.toRgba('#0d1b2a', 0.65) },
        splitLine: { lineStyle: { color: this.toRgba('#0d1b2a', 0.1) } },
      },
      series: [
        {
          type: 'bar',
          data,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: this.toRgba(accent, 0.35) },
              ],
            },
          },
        },
      ],
    };

    this.hasData = true;
  }

  private buildPieChart(): void {
    const metricField = this.getField(this.component.data.metric);
    const dimensionField = this.getField(this.component.data.dimension);

    if (!metricField || !dimensionField) {
      this.emptyMessage = 'Configure métrica e dimensão para o gráfico de pizza.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Não há dados suficientes para o gráfico.';
      return;
    }

    const data = rows.map(row => ({
      name: this.formatDimension(row[dimensionField.id], dimensionField),
      value: this.coerceNumber(row[metricField.id]),
    }));

    const accent = this.component.style.accentColor ?? '#2ec4b6';

    this.chartOptions = {
      animationDuration: 300,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0d1b2a',
        textStyle: { color: '#fff' },
        borderWidth: 0,
      },
      legend: {
        bottom: 0,
        textStyle: { color: this.toRgba('#0d1b2a', 0.65), fontSize: 11 },
        icon: 'circle',
      },
      series: [
        {
          type: 'pie',
          radius: ['38%', '68%'],
          center: ['50%', '45%'],
          data,
          roseType: 'radius',
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          color: data.map((_, index) => this.scaleColor(accent, index, data.length)),
          label: {
            color: this.toRgba('#0d1b2a', 0.75),
            formatter: '{b}: {d}%',
          },
        },
      ],
    };

    this.hasData = true;
  }

  private buildTable(): void {
    const dimensionField = this.getField(this.component.data.dimension);
    const metricField = this.getField(this.component.data.metric);

    if (!dimensionField || !metricField) {
      this.emptyMessage = 'Defina dimensão e métrica para preencher a tabela.';
      return;
    }

    const rows = this.collection?.rows ?? [];
    if (!rows.length) {
      this.emptyMessage = 'Sem registros para exibir na tabela.';
      return;
    }

    const comparisonField = this.getField(this.component.data.comparisonMetric);

    this.tableColumns = [
      { key: 'dimension', label: dimensionField.label, align: 'left' },
      { key: 'metric', label: metricField.label, align: 'right' },
    ];

    if (comparisonField) {
      this.tableColumns.push({ key: 'comparison', label: comparisonField.label, align: 'right' });
    }

    const maxValue = Math.max(...rows.map(row => this.coerceNumber(row[metricField.id])));
    const limit = this.mode === 'builder' ? 5 : 8;

    this.tableRows = rows.slice(0, limit).map(row => {
      const metricNumber = this.coerceNumber(row[metricField.id]);
      const base: TableRow = {
        dimension: this.formatDimension(row[dimensionField.id], dimensionField),
        metric: this.formatValue(metricField, row[metricField.id]),
        progress: maxValue > 0 ? metricNumber / maxValue : 0,
      };

      if (comparisonField) {
        base.comparison = this.formatValue(comparisonField, row[comparisonField.id]);
      }

      return base;
    });

    this.hasData = true;
  }

  private getField(fieldId?: string | null): DataCollectionField | undefined {
    if (!fieldId || !this.collection) {
      return undefined;
    }

    return this.collection.fields.find(field => field.id === fieldId);
  }

  private formatValue(field: DataCollectionField, raw: DataCollectionRecord[keyof DataCollectionRecord]): string {
    if (raw === null || raw === undefined) {
      return '—';
    }

    switch (field.type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: field.format ?? 'BRL' }).format(
          Number(raw),
        );
      case 'number':
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Number(raw));
      case 'percentage':
        return this.formatPercentage(Number(raw));
      case 'date':
        return this.formatDate(raw);
      default:
        return String(raw);
    }
  }

  private formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }

  private formatDimension(value: DataCollectionRecord[keyof DataCollectionRecord], field: DataCollectionField): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (field.type === 'date') {
      return this.formatDate(value);
    }

    return String(value);
  }

  private formatDate(value: DataCollectionRecord[keyof DataCollectionRecord]): string {
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : (value as Date);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date);
  }

  private coerceNumber(value: DataCollectionRecord[keyof DataCollectionRecord]): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toRgba(color: string, alpha = 1): string {
    const hex = color.replace('#', '');
    const normalized = hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex;
    const bigint = Number.parseInt(normalized, 16);

    if (Number.isNaN(bigint)) {
      return color;
    }

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private scaleColor(color: string, index: number, total: number): string {
    const alpha = 0.35 + (0.45 * index) / Math.max(total - 1, 1);
    return this.toRgba(color, alpha);
  }
}

interface TableColumn {
  key: 'dimension' | 'metric' | 'comparison';
  label: string;
  align: 'left' | 'right';
}

interface TableRow {
  dimension: string;
  metric: string;
  comparison?: string;
  progress: number;
}

interface KpiView {
  metricLabel: string;
  metricValue: string;
  comparisonLabel?: string;
  comparisonValue?: string;
  variationValue?: string;
  variationPercent?: string;
  positive: boolean;
}

interface ComparativoView {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  deltaValue: string;
  ratio: string;
  positive: boolean;
}
