import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardWidget } from '../../models/widget.model';
import { WidgetDataSet } from '../../services/data.service';

@Component({
  selector: 'app-widget-card',
  templateUrl: './widget-card.component.html',
  styleUrls: ['./widget-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetCardComponent {
  @Input({ required: true }) widget!: DashboardWidget;
  @Input({ required: true }) dataSet!: WidgetDataSet;

  @Output() remove = new EventEmitter<string>();
  @Output() configure = new EventEmitter<void>();

  get isCircular(): boolean {
    return this.widget.type === 'pie' || this.widget.type === 'doughnut';
  }

  get pieType(): 'pie' | 'doughnut' {
    return this.widget.type === 'doughnut' ? 'doughnut' : 'pie';
  }

  onRemove(): void {
    this.remove.emit(this.widget.id);
  }

  onConfigure(): void {
    this.configure.emit();
  }
}
