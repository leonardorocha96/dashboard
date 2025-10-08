import { Injectable } from '@angular/core';
import { DashboardWidget, WidgetDataPoint, WidgetType } from '../dashboard-builder.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly palettes = ['Material', 'Soft Pastel', 'Harmony Light', 'Vintage'];
  private readonly lineCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  private readonly pieCategories = ['North', 'South', 'East', 'West'];

  getDefaultPalette(): string {
    return this.palettes[0];
  }

  getPaletteOptions(): string[] {
    return [...this.palettes];
  }

  generateData(type: WidgetType): WidgetDataPoint[] {
    switch (type) {
      case 'line':
      case 'bar':
        return this.createLinearData();
      case 'pie':
      case 'doughnut':
        return this.createPieData();
      default:
        return [];
    }
  }

  createWidget(type: WidgetType): DashboardWidget {
    return {
      id: this.createId(),
      type,
      size: { width: 380, height: 320 },
      config: {
        title: this.getDefaultTitle(type),
        palette: this.getDefaultPalette(),
        showLegend: true,
      },
      data: this.generateData(type),
    };
  }

  private createLinearData(): WidgetDataPoint[] {
    return this.lineCategories.map((month) => ({
      category: month,
      value: this.randomBetween(35, 120),
      secondaryValue: this.randomBetween(25, 100),
    }));
  }

  private createPieData(): WidgetDataPoint[] {
    return this.pieCategories.map((region) => ({
      category: region,
      value: this.randomBetween(10, 50),
    }));
  }

  private getDefaultTitle(type: WidgetType): string {
    switch (type) {
      case 'line':
        return 'Tendência de vendas';
      case 'bar':
        return 'Comparativo mensal';
      case 'pie':
        return 'Participação por região';
      case 'doughnut':
        return 'Distribuição de canais';
      default:
        return 'Widget';
    }
  }

  private randomBetween(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  private createId(): string {
    return `widget-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
  }
}
