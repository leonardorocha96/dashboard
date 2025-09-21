import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DashboardComponentModel,
  DashboardPage,
  DeviceMode,
  LayoutDimensions,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  @Input() page: DashboardPage | null = null;
  @Input() viewMode: DeviceMode = 'desktop';
  @Input() selectedComponent: DashboardComponentModel | null = null;

  @Output() selectComponent = new EventEmitter<DashboardComponentModel | null>();
  @Output() componentMoved = new EventEmitter<{ componentId: string; position: LayoutDimensions }>();

  get canvasClass(): string {
    return `canvas--${this.viewMode}`;
  }

  onCanvasClick(): void {
    this.selectComponent.emit(null);
  }

  onSelectComponent(component: DashboardComponentModel, event: MouseEvent): void {
    event.stopPropagation();
    this.selectComponent.emit(component);
  }

  onDragEnded(component: DashboardComponentModel, event: CdkDragEnd): void {
    const position = event.source.getFreeDragPosition();
    const nextPosition: LayoutDimensions = {
      x: Math.max(0, Math.round(position.x)),
      y: Math.max(0, Math.round(position.y)),
      width: component.position.width,
      height: component.position.height,
    };

    this.componentMoved.emit({ componentId: component.id, position: nextPosition });
  }

  getComponentStyle(component: DashboardComponentModel): Record<string, string> {
    return {
      width: `${component.position.width}px`,
      height: `${component.position.height}px`,
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      background: component.style.backgroundColor,
      color: component.style.textColor,
      borderRadius: `${component.style.cornerRadius}px`,
      border: component.style.showBorder ? '1px solid var(--color-border)' : 'none',
      boxShadow: component.style.showBorder ? 'none' : 'var(--shadow-card)',
    };
  }
}
