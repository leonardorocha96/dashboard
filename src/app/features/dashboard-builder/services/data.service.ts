import { Injectable } from '@angular/core';
import { WidgetType } from '../models/widget.model';

export interface WidgetDataSet {
  key: string;
  label: string;
  argumentField: string;
  valueField: string;
  data: Array<Record<string, number | string>>;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly dataSets: Record<WidgetType, WidgetDataSet[]> = {
    line: [
      {
        key: 'monthly-revenue',
        label: 'Receita mensal',
        argumentField: 'month',
        valueField: 'value',
        data: [
          { month: 'Jan', value: 42000 },
          { month: 'Fev', value: 46800 },
          { month: 'Mar', value: 51200 },
          { month: 'Abr', value: 49800 },
          { month: 'Mai', value: 54500 },
          { month: 'Jun', value: 59000 },
          { month: 'Jul', value: 61500 },
          { month: 'Ago', value: 64000 },
          { month: 'Set', value: 66500 },
          { month: 'Out', value: 68800 },
          { month: 'Nov', value: 71000 },
          { month: 'Dez', value: 75600 },
        ],
      },
      {
        key: 'qualified-leads',
        label: 'Leads qualificados',
        argumentField: 'month',
        valueField: 'value',
        data: [
          { month: 'Jan', value: 280 },
          { month: 'Fev', value: 320 },
          { month: 'Mar', value: 340 },
          { month: 'Abr', value: 300 },
          { month: 'Mai', value: 360 },
          { month: 'Jun', value: 400 },
          { month: 'Jul', value: 420 },
          { month: 'Ago', value: 450 },
          { month: 'Set', value: 470 },
          { month: 'Out', value: 495 },
          { month: 'Nov', value: 520 },
          { month: 'Dez', value: 560 },
        ],
      },
    ],
    bar: [
      {
        key: 'channel-performance',
        label: 'Performance por canal',
        argumentField: 'channel',
        valueField: 'value',
        data: [
          { channel: 'Orgânico', value: 52 },
          { channel: 'Pago', value: 38 },
          { channel: 'Email', value: 28 },
          { channel: 'Indicação', value: 19 },
          { channel: 'Eventos', value: 15 },
        ],
      },
      {
        key: 'team-velocity',
        label: 'Velocidade das squads',
        argumentField: 'team',
        valueField: 'value',
        data: [
          { team: 'Alpha', value: 38 },
          { team: 'Beta', value: 45 },
          { team: 'Gamma', value: 41 },
          { team: 'Delta', value: 47 },
        ],
      },
    ],
    pie: [
      {
        key: 'market-share',
        label: 'Participação de mercado',
        argumentField: 'segment',
        valueField: 'value',
        data: [
          { segment: 'Enterprise', value: 38 },
          { segment: 'Mid market', value: 32 },
          { segment: 'SMB', value: 18 },
          { segment: 'Startups', value: 12 },
        ],
      },
      {
        key: 'support-topics',
        label: 'Distribuição de chamados',
        argumentField: 'topic',
        valueField: 'value',
        data: [
          { topic: 'Onboarding', value: 24 },
          { topic: 'Financeiro', value: 18 },
          { topic: 'Suporte técnico', value: 31 },
          { topic: 'Renovações', value: 13 },
          { topic: 'Outros', value: 14 },
        ],
      },
    ],
    doughnut: [
      {
        key: 'revenue-split',
        label: 'Receita por produto',
        argumentField: 'product',
        valueField: 'value',
        data: [
          { product: 'Core', value: 44 },
          { product: 'Premium', value: 26 },
          { product: 'Serviços', value: 18 },
          { product: 'Marketplace', value: 12 },
        ],
      },
      {
        key: 'cost-distribution',
        label: 'Distribuição de custos',
        argumentField: 'category',
        valueField: 'value',
        data: [
          { category: 'Pessoas', value: 45 },
          { category: 'Infraestrutura', value: 24 },
          { category: 'Marketing', value: 18 },
          { category: 'Operações', value: 13 },
        ],
      },
    ],
  };

  private readonly colorPalettes: string[][] = [
    ['#1F77B4', '#AEC7E8', '#FF7F0E', '#FFBB78'],
    ['#2CA02C', '#98DF8A', '#D62728', '#FF9896'],
    ['#9467BD', '#C5B0D5', '#8C564B', '#C49C94'],
    ['#17BECF', '#9EDAE5', '#BCBD22', '#DBDB8D'],
  ];

  private readonly seriesColors = ['#3B82F6', '#F97316', '#0EA5E9', '#10B981', '#6366F1'];

  getDefaultDataSet(type: WidgetType): WidgetDataSet {
    const [first] = this.dataSets[type];
    return first;
  }

  getDataSet(type: WidgetType, key: string): WidgetDataSet {
    const match = this.dataSets[type].find((set) => set.key === key);
    return match ?? this.getDefaultDataSet(type);
  }

  getDataSets(type: WidgetType): WidgetDataSet[] {
    return this.dataSets[type];
  }

  getColorPalettes(): string[][] {
    return this.colorPalettes;
  }

  getSeriesColors(): string[] {
    return this.seriesColors;
  }
}
