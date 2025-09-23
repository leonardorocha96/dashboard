import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';

@Component({
  selector: 'app-component-context-menu',
  templateUrl: './component-context-menu.component.html',
  styleUrls: ['./component-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentContextMenuComponent {
  @Input() component!: ComponentInstance;
  @Output() bringToFrontRequested = new EventEmitter<void>();
  @Output() sendToBackRequested = new EventEmitter<void>();
  @Output() duplicateRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() groupRequested = new EventEmitter<void>();
  @Output() ungroupRequested = new EventEmitter<void>();
  @Output() lockToggleRequested = new EventEmitter<void>();
  @Output() freezeToggleRequested = new EventEmitter<void>();

  opened = false;

  toggle(): void {
    this.opened = !this.opened;
  }

  close(): void {
    this.opened = false;
  }
}
