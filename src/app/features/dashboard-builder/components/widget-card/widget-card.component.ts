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
  @Output() dragStart = new EventEmitter<MouseEvent>();

  private isResizing = false;
  private resizeDirection = '';
  private startSize = { width: 0, height: 0 };
  private startPos = { x: 0, y: 0 };

  get isResizingWidget(): boolean {
    return this.isResizing;
  }

  onDragStart(event: MouseEvent): void {
    if (!this.isResizing) {
      this.dragStart.emit(event);
    }
  }

  onResizeStart(event: MouseEvent, direction: string): void {
    event.stopPropagation();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.startSize = { ...this.widget.size };
    this.startPos = { x: event.clientX, y: event.clientY };

    // Salvar posição inicial para cálculos corretos
    const initialPosition = {
      x: this.widget.position?.x || 0,
      y: this.widget.position?.y || 0
    };

    // Adicionar classe CSS para feedback visual
    const element = event.target as HTMLElement;
    const widgetCard = element.closest('.widget-card') as HTMLElement;
    if (widgetCard) {
      widgetCard.classList.add('widget-card--resizing');
    }

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - this.startPos.x;
      const deltaY = e.clientY - this.startPos.y;
      
      let newWidth = this.startSize.width;
      let newHeight = this.startSize.height;
      let newX = initialPosition.x;
      let newY = initialPosition.y;

      // Limites mínimos e máximos
      const minWidth = 280;
      const minHeight = 220;
      const maxWidth = 1200;
      const maxHeight = 800;

      // Lógica para cada direção
      switch (direction) {
        case 'n': // Norte (top)
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height - deltaY));
          // Ajustar posição Y baseado na diferença de altura
          newY = initialPosition.y + (this.startSize.height - newHeight);
          break;
          
        case 's': // Sul (bottom)
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height + deltaY));
          break;
          
        case 'w': // Oeste (left)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width - deltaX));
          // Ajustar posição X baseado na diferença de largura
          newX = initialPosition.x + (this.startSize.width - newWidth);
          break;
          
        case 'e': // Leste (right)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width + deltaX));
          break;
          
        case 'nw': // Noroeste (top-left)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width - deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height - deltaY));
          // Ajustar ambas as posições
          newX = initialPosition.x + (this.startSize.width - newWidth);
          newY = initialPosition.y + (this.startSize.height - newHeight);
          break;
          
        case 'ne': // Nordeste (top-right)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width + deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height - deltaY));
          // Ajustar apenas posição Y
          newY = initialPosition.y + (this.startSize.height - newHeight);
          break;
          
        case 'sw': // Sudoeste (bottom-left)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width - deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height + deltaY));
          // Ajustar apenas posição X
          newX = initialPosition.x + (this.startSize.width - newWidth);
          break;
          
        case 'se': // Sudeste (bottom-right)
          newWidth = Math.min(maxWidth, Math.max(minWidth, this.startSize.width + deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, this.startSize.height + deltaY));
          break;
      }

      // Emit resize com nova posição sempre quando ela mudou
      const hasPositionChanged = newX !== initialPosition.x || newY !== initialPosition.y;
      
      this.resize.emit({ 
        width: newWidth, 
        height: newHeight,
        ...(hasPositionChanged ? { position: { x: newX, y: newY } } : {})
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      this.isResizing = false;
      
      // Remover classe CSS de resize
      const widgetCard = document.querySelector('.widget-card--resizing') as HTMLElement;
      if (widgetCard) {
        widgetCard.classList.remove('widget-card--resizing');
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Restaurar cursor padrão
      document.body.style.cursor = '';
    };

    // Definir cursor apropriado para cada direção
    const getCursor = (dir: string): string => {
      const cursors: { [key: string]: string } = {
        'n': 'ns-resize',
        's': 'ns-resize',
        'w': 'ew-resize',
        'e': 'ew-resize',
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize'
      };
      return cursors[dir] || 'default';
    };

    // Aplicar cursor
    document.body.style.cursor = getCursor(direction);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

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

  getTooltipFormat(): string {
    switch (this.widget.config.tooltipFormat) {
      case 'currency':
        return 'currency';
      case 'percentage':
        return 'percent';
      case 'number':
      default:
        return 'decimal';
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'line': 'Linha',
      'bar': 'Barras',
      'pie': 'Pizza',
      'doughnut': 'Rosca'
    };
    return labels[type] || type;
  }
}
