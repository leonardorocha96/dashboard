import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardWidget, WidgetSize } from '../../dashboard-builder.models';

@Component({
  selector: 'app-widget-card',
  templateUrl: './widget-card.component.html',
  styleUrls: ['./widget-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetCardComponent {
  @Input() widget!: DashboardWidget;
  @Input() selected = false;

  @Output() select = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() resize = new EventEmitter<WidgetSize>();
  @Output() configure = new EventEmitter<void>();

  onResizeEnd(event: any): void {
    const width = Math.round(event.width ?? this.widget.size.width);
    const height = Math.round(event.height ?? this.widget.size.height);
    this.resize.emit({ width, height });
  }

  onSelect(): void {
    this.select.emit();
  }

  onRemoveClick(e: any): void {
    e?.event?.stopPropagation();
    this.remove.emit();
  }

  onConfigureClick(e: any): void {
    e?.event?.stopPropagation();
    this.configure.emit();
  }
}
