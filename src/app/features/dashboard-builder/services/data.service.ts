import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardWidget, WidgetDataPoint, WidgetType } from '../dashboard-builder.models';

export interface DataSet {
  id: string;
  name: string;
  description: string;
  file?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly palettes = [
    'Material', 'Soft Pastel', 'Harmony Light', 'Vintage', 
    'Bright', 'Dark Moon', 'Soft Blue', 'Green Mist'
  ];
  
  // Dados de vendas 2025 - Meses completos
  private readonly salesMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  // Categorias de produtos/regiões
  private readonly productCategories = [
    'Smartphones', 'Laptops', 'Tablets', 'Acessórios', 'Smart TVs'
  ];
  
  private readonly salesRegions = [
    'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Rio Grande do Sul'
  ];
  
  private readonly salesChannels = [
    'E-commerce', 'Loja Física', 'Marketplace', 'Vendas B2B', 'Mobile App'
  ];

  // Conjuntos de dados disponíveis
  private readonly dataSets: DataSet[] = [
    {
      id: 'vendas-2025',
      name: 'Vendas 2025',
      description: 'Dados de vendas completos para 2025'
    },
    {
      id: 'kpis-performance',
      name: 'KPIs de Performance',
      description: 'Indicadores de performance e metas'
    },
    {
      id: 'financeiro-2025',
      name: 'Dados Financeiros',
      description: 'Informações financeiras e orçamentos'
    },
    {
      id: 'gerado-dinamico',
      name: 'Dados Simulados',
      description: 'Dados gerados dinamicamente para testes'
    }
  ];

  private currentDataSet: string = 'gerado-dinamico';

  getDefaultPalette(): string {
    return this.palettes[0];
  }

  getPaletteOptions(): string[] {
    return [...this.palettes];
  }

  getDataSets(): DataSet[] {
    return [...this.dataSets];
  }

  getCurrentDataSet(): string {
    return this.currentDataSet;
  }

  setCurrentDataSet(dataSetId: string): void {
    this.currentDataSet = dataSetId;
  }

  async loadExternalData(dataSetId: string): Promise<any> {
    const dataSet = this.dataSets.find(ds => ds.id === dataSetId);
    
    if (!dataSet || dataSetId === 'gerado-dinamico') {
      return null;
    }

    try {
      // Simula carregamento de dados externos
      const response = await fetch(`/assets/data/${this.getDataFileName(dataSetId)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Erro ao carregar dados externos para ${dataSetId}:`, error);
    }
    
    return null;
  }

  private getDataFileName(dataSetId: string): string {
    switch (dataSetId) {
      case 'vendas-2025':
        return 'vendas-2025-completo.json';
      case 'kpis-performance':
        return 'kpis-performance-2025.json';
      case 'financeiro-2025':
        return 'dados-financeiros-2025.json';
      default:
        return '';
    }
  }

  generateData(type: WidgetType): WidgetDataPoint[] {
    if (this.currentDataSet === 'gerado-dinamico') {
      return this.generateDynamicData(type);
    }
    
    // Para outros conjuntos de dados, primeiro tentamos carregar dados externos
    // Se não conseguir, retorna dados dinâmicos
    return this.generateDynamicData(type);
  }

  async generateDataAsync(type: WidgetType): Promise<WidgetDataPoint[]> {
    if (this.currentDataSet === 'gerado-dinamico') {
      return this.generateDynamicData(type);
    }

    const externalData = await this.loadExternalData(this.currentDataSet);
    if (externalData) {
      return this.processExternalData(externalData, type);
    }

    return this.generateDynamicData(type);
  }

  private generateDynamicData(type: WidgetType): WidgetDataPoint[] {
    switch (type) {
      case 'line':
        return this.createSalesGrowthData();
      case 'bar':
        return this.createMonthlyComparisonData();
      case 'pie':
        return this.createRegionalSalesData();
      case 'doughnut':
        return this.createChannelDistributionData();
      default:
        return [];
    }
  }

  private processExternalData(data: any, type: WidgetType): WidgetDataPoint[] {
    // Processa dados externos baseado no tipo de gráfico e estrutura dos dados
    if (!data || !Array.isArray(data)) {
      return this.generateDynamicData(type);
    }

    // Adapta dados externos para o formato necessário
    return data.slice(0, 12).map((item: any, index: number) => ({
      category: item.category || item.name || item.periodo || `Item ${index + 1}`,
      value: item.value || item.vendas || item.receita || this.randomBetween(500000, 2000000),
      secondaryValue: item.secondaryValue || item.meta || item.objetivo || undefined
    }));
  }

  createWidget(type: WidgetType): DashboardWidget {
    return {
      id: this.createId(),
      type,
      size: { width: 420, height: 360 },
      config: {
        title: this.getDefaultTitle(type),
        palette: this.getDefaultPalette(),
        showLegend: true,
        // Configurações padrão expandidas
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        showGrid: true,
        gridColor: '#f3f4f6',
        showXAxisLabels: true,
        showYAxisLabels: true,
        xAxisTitle: this.getDefaultXAxisTitle(type),
        yAxisTitle: this.getDefaultYAxisTitle(type),
        showTooltips: true,
        tooltipFormat: 'currency',
        lineStyle: 'solid',
        lineWidth: 3,
        showMarkers: true,
        markerSize: 6,
        barSpacing: 0.3,
        barCornerRadius: 4,
        innerRadius: type === 'doughnut' ? 0.4 : 0,
        startAngle: 0,
        showLabels: true,
        labelPosition: 'outside',
        enableAnimation: true,
        animationDuration: 1000,
        showSecondaryData: type === 'line' || type === 'bar',
        secondaryDataName: 'Meta',
        dataSetId: this.currentDataSet
      },
      data: this.generateData(type),
    };
  }

  // Dados de vendas com crescimento realista para 2025
  private createSalesGrowthData(): WidgetDataPoint[] {
    const baseValues = [850000, 920000, 1050000, 980000, 1150000, 1200000, 
                       1100000, 1350000, 1280000, 1450000, 1380000, 1600000];
    const metaValues = [800000, 900000, 1000000, 1000000, 1100000, 1200000,
                       1200000, 1300000, 1300000, 1400000, 1400000, 1500000];
    
    return this.salesMonths.map((month, index) => ({
      category: month,
      value: baseValues[index] + this.randomVariation(50000),
      secondaryValue: metaValues[index] + this.randomVariation(30000),
    }));
  }

  // Comparação mensal de produtos
  private createMonthlyComparisonData(): WidgetDataPoint[] {
    const currentMonth = this.salesMonths[new Date().getMonth()];
    const lastMonths = this.salesMonths.slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1);
    
    return lastMonths.map((month, index) => ({
      category: month,
      value: this.randomBetween(800000, 1500000),
      secondaryValue: this.randomBetween(700000, 1400000),
    }));
  }

  // Vendas por região
  private createRegionalSalesData(): WidgetDataPoint[] {
    const regionSales = [3200000, 2800000, 2100000, 1800000, 1600000];
    
    return this.salesRegions.map((region, index) => ({
      category: region,
      value: regionSales[index] + this.randomVariation(200000),
    }));
  }

  // Distribuição de canais de venda
  private createChannelDistributionData(): WidgetDataPoint[] {
    const channelSales = [4200000, 3800000, 2900000, 2100000, 1800000];
    
    return this.salesChannels.map((channel, index) => ({
      category: channel,
      value: channelSales[index] + this.randomVariation(300000),
    }));
  }

  private getDefaultTitle(type: WidgetType): string {
    switch (type) {
      case 'line':
        return 'Crescimento de Vendas 2025';
      case 'bar':
        return 'Comparativo Mensal de Produtos';
      case 'pie':
        return 'Vendas por Região';
      case 'doughnut':
        return 'Distribuição de Canais';
      default:
        return 'Widget de Vendas';
    }
  }

  private getDefaultXAxisTitle(type: WidgetType): string {
    switch (type) {
      case 'line':
      case 'bar':
        return 'Período';
      default:
        return '';
    }
  }

  private getDefaultYAxisTitle(type: WidgetType): string {
    switch (type) {
      case 'line':
      case 'bar':
        return 'Vendas (R$)';
      default:
        return '';
    }
  }

  private randomVariation(maxVariation: number): number {
    return Math.round((Math.random() - 0.5) * maxVariation);
  }

  private randomBetween(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  private createId(): string {
    return `widget-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
  }
}
