import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardWidget, WidgetPaletteItem, WidgetType } from './models/widget.model';
import { DataService, WidgetDataSet } from './services/data.service';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-dashboard-builder',
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBuilderComponent implements OnInit {
  readonly dragGroup = 'dashboard-widgets';

  readonly paletteItems: WidgetPaletteItem[] = [
    {
      type: 'line',
      title: 'Linha',
      description: 'Visualize tendências temporais',
      icon: '📈',
    },
    {
      type: 'bar',
      title: 'Barras',
      description: 'Compare categorias lado a lado',
      icon: '📊',
    },
    {
      type: 'pie',
      title: 'Pizza',
      description: 'Distribuição percentual',
      icon: '🥧',
    },
    {
      type: 'doughnut',
      title: 'Rosca',
      description: 'Distribuição com espaço central',
      icon: '⭕️',
    },
  ];

  widgets: DashboardWidget[] = [];
  drawerOpen = false;
  selectedWidgetId: string | null = null;
  currentDataSets: WidgetDataSet[] = [];

  private readonly colorPalettes = this.dataService.getColorPalettes();
  private readonly seriesColors = this.dataService.getSeriesColors();
  private uid = 0;

  constructor(
    private readonly layoutService: LayoutService,
    private readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const savedLayout = this.layoutService.load();
    if (savedLayout.length) {
      this.widgets = savedLayout;
    } else {
      this.widgets = [this.createWidget('line'), this.createWidget('pie')];
      this.persistLayout();
    }
  }

  get selectedWidget(): DashboardWidget | null {
    return this.widgets.find((widget) => widget.id === this.selectedWidgetId) ?? null;
  }

  get availableColorPalettes(): string[][] {
    return this.colorPalettes;
  }

  get availableSeriesColors(): string[] {
    return this.seriesColors;
  }

  onPaletteAdd(item: WidgetPaletteItem): void {
    this.widgets = [...this.widgets, this.createWidget(item.type)];
    this.persistLayout();
    this.cdr.markForCheck();
  }

  onCanvasAdd(event: any): void {
    if (!event || event.fromComponent === event.component) {
      return;
    }

    const paletteItem = event.itemData as WidgetPaletteItem;
    const newWidget = this.createWidget(paletteItem.type);
    const widgets = [...this.widgets];
    widgets.splice(event.toIndex ?? widgets.length, 0, newWidget);
    this.widgets = widgets;
    this.persistLayout();
    this.cdr.markForCheck();
  }

  onCanvasReorder(event: any): void {
    if (!event || event.fromIndex === event.toIndex) {
      return;
    }

    const widgets = [...this.widgets];
    const [moved] = widgets.splice(event.fromIndex, 1);
    widgets.splice(event.toIndex, 0, moved);
    this.widgets = widgets;
    this.persistLayout();
    this.cdr.markForCheck();
  }

  onWidgetRemove(id: string): void {
    const widgets = this.widgets.filter((widget) => widget.id !== id);
    this.widgets = widgets;
    if (this.selectedWidgetId === id) {
      this.closeDrawer();
    }
    this.persistLayout();
    this.cdr.markForCheck();
  }

  onWidgetResize(event: any, widget: DashboardWidget): void {
    const width = Math.max(Math.round(event.width), 260);
    const height = Math.max(Math.round(event.height), 220);
    this.widgets = this.widgets.map((current) =>
      current.id === widget.id ? { ...current, width, height } : current,
    );
    this.persistLayout();
    this.cdr.markForCheck();
  }

  openConfig(widget: DashboardWidget): void {
    this.selectedWidgetId = widget.id;
    this.currentDataSets = this.dataService.getDataSets(widget.type);
    this.drawerOpen = true;
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedWidgetId = null;
    this.currentDataSets = [];
    this.cdr.markForCheck();
  }

  onConfigSubmit(update: Partial<DashboardWidget>): void {
    if (!this.selectedWidgetId) {
      return;
    }

    const widgets = this.widgets.map((widget) =>
      widget.id === this.selectedWidgetId ? { ...widget, ...update } : widget,
    );
    this.widgets = widgets;
    this.persistLayout();
    this.cdr.markForCheck();
  }

  onConfigCancel(): void {
    this.closeDrawer();
  }

  clearLayout(): void {
    this.layoutService.clear();
    this.widgets = [this.createWidget('line'), this.createWidget('bar')];
    this.closeDrawer();
    this.persistLayout();
    this.cdr.markForCheck();
  }

  widgetData(widget: DashboardWidget): WidgetDataSet {
    return this.dataService.getDataSet(widget.type, widget.dataKey);
  }

  trackByWidget(_: number, widget: DashboardWidget): string {
    return widget.id;
  }

  private persistLayout(): void {
    this.layoutService.save(this.widgets);
  }

  private createWidget(type: WidgetType): DashboardWidget {
    const data = this.dataService.getDefaultDataSet(type);
    return {
      id: `widget-${Date.now()}-${this.uid++}`,
      type,
      title: data.label,
      dataKey: data.key,
      width: 380,
      height: 320,
      settings: {
        showLegend: true,
        palette: this.colorPalettes[0] ?? ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
        seriesColor: this.seriesColors[0] ?? '#3B82F6',
      },
    };
  }
}
