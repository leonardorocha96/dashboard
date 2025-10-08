import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DashboardWidget, WidgetConfig } from '../../dashboard-builder.models';

interface WidgetConfigForm {
  title: string;
  palette: string;
  showLegend: boolean;
}

@Component({
  selector: 'app-widget-config-drawer',
  templateUrl: './widget-config-drawer.component.html',
  styleUrls: ['./widget-config-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetConfigDrawerComponent implements OnChanges {
  @Input() widget: DashboardWidget | null = null;
  @Input() palettes: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<WidgetConfig>();
  @Output() randomizeData = new EventEmitter<void>();

  form: WidgetConfigForm = {
    title: '',
    palette: '',
    showLegend: true,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget']) {
      this.patchForm();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (!this.widget) {
      return;
    }

    this.update.emit({ ...this.form });
  }

  onRandomize(): void {
    this.randomizeData.emit();
  }

  trackPalette(_: number, palette: string): string {
    return palette;
  }

  private patchForm(): void {
    if (!this.widget) {
      this.form = { title: '', palette: this.palettes[0] ?? '', showLegend: true };
      return;
    }

    this.form = {
      title: this.widget.config.title,
      palette: this.widget.config.palette,
      showLegend: this.widget.config.showLegend,
    };
  }
}
