import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { ComponentDefinition } from '../../../../shared/models/component-registry.model';
import { Page } from '../../../../shared/models/page.model';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';

interface ResizeState {
  component: ComponentInstance;
  direction: 'right' | 'bottom' | 'corner';
  startX: number;
  startY: number;
  initialColSpan: number;
  initialRowSpan: number;
}

@Component({
  selector: 'app-builder-canvas',
  templateUrl: './builder-canvas.component.html',
  styleUrls: ['./builder-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderCanvasComponent implements OnChanges, AfterViewInit {
  @Input() page: Page | null = null;
  @Input() components: ComponentInstance[] = [];
  @Input() selection: string[] = [];
  @ViewChild('grid', { static: false }) grid?: ElementRef<HTMLDivElement>;

  gridStyle: Record<string, string> = {};
  private resizeState?: ResizeState;

  constructor(private readonly state: BuilderStateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) {
      this.updateGridStyle();
    }
  }

  ngAfterViewInit(): void {
    this.updateGridStyle();
  }

  handleDrop(event: CdkDragDrop<ComponentDefinition | ComponentInstance>): void {
    if (!this.grid?.nativeElement || !this.page) {
      return;
    }
    const pointer = (event.dropPoint as { x: number; y: number }) || (event.event as MouseEvent);
    if (!pointer) {
      return;
    }
    const rect = this.grid.nativeElement.getBoundingClientRect();
    const columns = this.getColumnCount();
    const columnWidth = rect.width / columns;
    const rowHeight = this.page.layout.grid.minRowHeight ?? 60;
    const clientX = (pointer as any).x ?? (pointer as MouseEvent).clientX;
    const clientY = (pointer as any).y ?? (pointer as MouseEvent).clientY;
    const colStart = Math.max(1, Math.round((clientX - rect.left) / columnWidth));
    const rowStart = Math.max(1, Math.round((clientY - rect.top) / rowHeight));

    const data = event.item.data;
    if (this.isDefinition(data)) {
      const instance: ComponentInstance = {
        id: crypto.randomUUID(),
        componentType: data.type,
        title: data.title,
        position: {
          colStart,
          rowStart,
          colSpan: data.defaultSize.colSpan,
          rowSpan: data.defaultSize.rowSpan,
        },
        style: { zIndex: 1 },
        metadata: {},
        panels: data.panels,
      };
      this.state.upsertComponent(instance);
      this.state.selectComponent(instance.id);
      event.item.reset();
    } else {
      this.state.updateComponentPosition(data.id, { colStart, rowStart });
      event.item.reset();
    }
  }

  isSelected(component: ComponentInstance): boolean {
    return this.selection.includes(component.id);
  }

  select(component: ComponentInstance, event: MouseEvent): void {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      const next = this.isSelected(component)
        ? this.selection.filter((id) => id !== component.id)
        : [...this.selection, component.id];
      this.state.setSelection(next);
    } else {
      this.state.selectComponent(component.id);
    }
  }

  clearSelection(): void {
    this.state.setSelection([]);
  }

  bringToFront(component: ComponentInstance): void {
    this.state.bringToFront(component.id);
  }

  sendToBack(component: ComponentInstance): void {
    this.state.sendToBack(component.id);
  }

  duplicate(component: ComponentInstance): void {
    this.state.duplicateComponent(component.id);
  }

  delete(component: ComponentInstance): void {
    this.state.deleteComponent(component.id);
  }

  groupSelection(): void {
    if (this.selection.length > 1) {
      this.state.groupComponents(this.selection);
    }
  }

  ungroupSelection(): void {
    this.state.ungroupComponents(this.selection);
  }

  toggleLock(component: ComponentInstance): void {
    this.state.lockComponent(component.id, !component.locked);
  }

  toggleFreeze(component: ComponentInstance): void {
    this.state.freezeComponent(component.id, !component.style?.frozen);
  }

  startResize(component: ComponentInstance, direction: ResizeState['direction'], event: PointerEvent): void {
    event.stopPropagation();
    this.resizeState = {
      component,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      initialColSpan: component.position.colSpan,
      initialRowSpan: component.position.rowSpan,
    };
    window.addEventListener('pointermove', this.onResizeMove);
    window.addEventListener('pointerup', this.onResizeUp);
  }

  private onResizeMove = (event: PointerEvent) => {
    if (!this.resizeState || !this.page) {
      return;
    }
    const { component, direction, startX, startY, initialColSpan, initialRowSpan } = this.resizeState;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const columns = this.getColumnCount();
    const columnWidth = (this.grid?.nativeElement.getBoundingClientRect().width ?? 0) / columns;
    const rowHeight = this.page.layout.grid.minRowHeight ?? 60;

    let newColSpan = initialColSpan;
    let newRowSpan = initialRowSpan;
    if (direction === 'right' || direction === 'corner') {
      newColSpan = Math.max(1, Math.round(initialColSpan + deltaX / columnWidth));
    }
    if (direction === 'bottom' || direction === 'corner') {
      newRowSpan = Math.max(1, Math.round(initialRowSpan + deltaY / rowHeight));
    }
    this.state.updateComponentPosition(component.id, { colSpan: newColSpan, rowSpan: newRowSpan });
  };

  private onResizeUp = () => {
    window.removeEventListener('pointermove', this.onResizeMove);
    window.removeEventListener('pointerup', this.onResizeUp);
    this.resizeState = undefined;
  };

  private isDefinition(data: ComponentDefinition | ComponentInstance): data is ComponentDefinition {
    return (data as ComponentDefinition).type !== undefined && !(data as ComponentInstance).position;
  }

  private getColumnCount(): number {
    if (!this.page) {
      return 12;
    }
    const template = this.page.layout.grid.gridTemplateColumns ?? 'repeat(12, 1fr)';
    const match = template.match(/repeat\((\d+)/);
    return match ? parseInt(match[1], 10) : 12;
  }

  private updateGridStyle(): void {
    if (!this.page) {
      return;
    }
    this.gridStyle = {
      display: 'grid',
      gridTemplateColumns: this.page.layout.grid.gridTemplateColumns ?? 'repeat(12, 1fr)',
      gridTemplateRows: this.page.layout.grid.gridTemplateRows ?? 'repeat(12, minmax(60px, auto))',
      gap: this.page.layout.grid.gap ?? '1rem',
      background: this.page.layout.grid.backgroundColor ?? 'transparent',
    };
  }
}
