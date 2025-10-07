import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetPaletteItem } from '../../models/widget.model';

@Component({
  selector: 'app-widget-palette',
  templateUrl: './widget-palette.component.html',
  styleUrls: ['./widget-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPaletteComponent {
  @Input({ required: true }) paletteItems: WidgetPaletteItem[] = [];
  @Input() dragGroup = 'dashboard-widgets';

  @Output() addWidget = new EventEmitter<WidgetPaletteItem>();

  trackByType(_: number, item: WidgetPaletteItem): string {
    return item.type;
  }

  onAddClick(item: WidgetPaletteItem): void {
    this.addWidget.emit(item);
  }
}
