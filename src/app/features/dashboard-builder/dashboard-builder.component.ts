import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WidgetConfig, WidgetPaletteItem, WidgetType, DashboardWidget, WidgetSize } from './dashboard-builder.models';
import { LayoutService } from './services/layout.service';
import { DataService } from './services/data.service';
import { SortableAddEvent, SortableReorderEvent } from 'devextreme/ui/sortable';

@Component({
  selector: 'app-dashboard-builder',
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBuilderComponent implements OnInit {
  readonly dragGroup = 'dashboard-widgets';

  readonly paletteItems: WidgetPaletteItem[] = [
    { type: 'line', label: 'Linha', description: 'Tendência temporal com duas séries.', icon: '📈' },
    { type: 'bar', label: 'Colunas', description: 'Comparação entre categorias.', icon: '📊' },
    { type: 'pie', label: 'Pizza', description: 'Participação percentual.', icon: '🥧' },
    { type: 'doughnut', label: 'Rosca', description: 'Distribuição com centro vazio.', icon: '🍩' },
  ];

  readonly paletteOptions = this.dataService.getPaletteOptions();

  widgets: DashboardWidget[] = [];
  selectedWidgetId: string | null = null;

  constructor(
    private readonly layoutService: LayoutService,
    private readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.restoreLayout();
  }

  get activeWidget(): DashboardWidget | null {
    return this.widgets.find((widget) => widget.id === this.selectedWidgetId) ?? null;
  }

  handleAdd(event: SortableAddEvent): void {
    const paletteItem = event.fromData as WidgetPaletteItem | undefined;
    if (!paletteItem) {
      return;
    }

    this.insertWidget(paletteItem.type, event.toIndex ?? this.widgets.length);
    event.cancel = true;
  }

  handleReorder(event: SortableReorderEvent): void {
    if (event.fromIndex === event.toIndex) {
      return;
    }

    const updated = [...this.widgets];
    const [moved] = updated.splice(event.fromIndex, 1);
    updated.splice(event.toIndex, 0, moved);

    this.widgets = updated;
    this.persist();
    this.cdr.markForCheck();
  }

  addWidgetFromPalette(type: WidgetType): void {
    this.insertWidget(type, this.widgets.length);
  }

  selectWidget(widgetId: string): void {
    this.selectedWidgetId = widgetId;
    this.cdr.markForCheck();
  }

  removeWidget(widgetId: string): void {
    const updated = this.widgets.filter((widget) => widget.id !== widgetId);
    this.widgets = updated;
    if (this.selectedWidgetId === widgetId) {
      this.selectedWidgetId = null;
    }
    this.persist();
    this.cdr.markForCheck();
  }

  resizeWidget(widgetId: string, size: WidgetSize): void {
    this.updateWidget(widgetId, { size });
  }

  openConfig(widgetId: string): void {
    this.selectedWidgetId = widgetId;
    this.cdr.markForCheck();
  }

  closeConfig(): void {
    this.selectedWidgetId = null;
    this.cdr.markForCheck();
  }

  applyWidgetConfig(config: WidgetConfig): void {
    if (!this.selectedWidgetId) {
      return;
    }

    this.updateWidget(this.selectedWidgetId, { config });
  }

  refreshData(): void {
    if (!this.selectedWidgetId) {
      return;
    }

    const widget = this.widgets.find((item) => item.id === this.selectedWidgetId);
    if (!widget) {
      return;
    }

    const data = this.dataService.generateData(widget.type);
    this.updateWidget(widget.id, { data });
  }

  saveLayout(): void {
    this.persist();
  }

  resetLayout(): void {
    this.widgets = this.createDefaultLayout();
    this.selectedWidgetId = null;
    this.persist();
    this.cdr.markForCheck();
  }

  trackByWidgetId(_: number, widget: DashboardWidget): string {
    return widget.id;
  }

  private restoreLayout(): void {
    const stored = this.layoutService.load();
    if (stored.length) {
      this.widgets = stored;
      this.selectedWidgetId = stored[0]?.id ?? null;
    } else {
      this.widgets = this.createDefaultLayout();
      this.persist();
    }
    this.cdr.markForCheck();
  }

  private createDefaultLayout(): DashboardWidget[] {
    return ['line', 'bar'].map((type) => this.dataService.createWidget(type));
  }

  private insertWidget(type: WidgetType, index: number): void {
    const widget = this.dataService.createWidget(type);
    const updated = [...this.widgets];
    const targetIndex = Math.min(Math.max(index, 0), updated.length);
    updated.splice(targetIndex, 0, widget);
    this.widgets = updated;
    this.selectedWidgetId = widget.id;
    this.persist();
    this.cdr.markForCheck();
  }

  private updateWidget(widgetId: string, changes: Partial<DashboardWidget>): void {
    const updated = this.widgets.map((widget) => {
      if (widget.id !== widgetId) {
        return widget;
      }

      const nextConfig = changes.config ? { ...widget.config, ...changes.config } : widget.config;
      return { ...widget, ...changes, config: nextConfig };
    });
    this.widgets = updated;
    this.persist();
    this.cdr.markForCheck();
  }

  private persist(): void {
    this.layoutService.save(this.widgets);
  }
}
