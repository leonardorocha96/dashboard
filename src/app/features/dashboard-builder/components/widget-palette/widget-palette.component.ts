import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetPaletteItem, WidgetType } from '../../dashboard-builder.models';

@Component({
  selector: 'app-widget-palette',
  templateUrl: './widget-palette.component.html',
  styleUrls: ['./widget-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPaletteComponent {
  @Input() items: WidgetPaletteItem[] = [];
  @Input() dragGroup = '';
  @Output() addWidget = new EventEmitter<WidgetType>();

  onAddClick(type: WidgetType): void {
    this.addWidget.emit(type);
  }
}
