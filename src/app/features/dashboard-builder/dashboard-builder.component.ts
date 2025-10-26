import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ApplicationRef, OnDestroy } from '@angular/core';
import { WidgetConfig, WidgetPaletteItem, WidgetType, DashboardWidget, WidgetSize } from './dashboard-builder.models';
import { LayoutService } from './services/layout.service';
import { DataService } from './services/data.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Definindo tipos personalizados para os eventos do DevExtreme
interface SortableAddEvent {
  fromData: any;
  toIndex: number;
  cancel: boolean;
}

interface SortableReorderEvent {
  fromIndex: number;
  toIndex: number;
}

@Component({
  selector: 'app-dashboard-builder',
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBuilderComponent implements OnInit, OnDestroy {
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

  // Variáveis para controle do drag
  private isDragging = false;
  private dragStartPos = { x: 0, y: 0 };
  private draggedWidget: DashboardWidget | null = null;
  private initialWidgetPos = { x: 0, y: 0 };

  // Subject para debounce de salvamento automático
  private autoSave$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private readonly layoutService: LayoutService,
    private readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
    private readonly appRef: ApplicationRef
  ) {
    // Adicionar listeners globais para mouse events
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Configurar salvamento automático com debounce
    this.autoSave$.pipe(
      debounceTime(500) // 500ms de debounce
    ).subscribe(() => {
      this.layoutService.save(this.widgets);
      console.log('Layout salvo automaticamente');
    });
  }

  ngOnInit(): void {
    this.restoreLayout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  get activeWidget(): DashboardWidget | null {
    return this.widgets.find((widget) => widget.id === this.selectedWidgetId) ?? null;
  }

  handleAdd(event: SortableAddEvent): void {
    console.log('onAdd event triggered:', event);
    const paletteItem = event.fromData as WidgetPaletteItem | undefined;
    if (!paletteItem) {
      return;
    }

    this.insertWidget(paletteItem.type, event.toIndex ?? this.widgets.length);
    event.cancel = true;
  }

  handleReorder(event: SortableReorderEvent): void {
    console.log('onReorder event triggered:', event);
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

  handleDragStart(event: any): void {
    console.log('Drag start event:', event);
    const draggedWidget = event.itemData;
    if (draggedWidget) {
      console.log(`Drag started for widget ${draggedWidget.id}`);
      // Armazenar a posição inicial para referência
      if (!draggedWidget.position) {
        draggedWidget.position = { x: 0, y: 0 };
      }
    } else {
      console.error('Dragged widget not found at drag start');
    }
  }

  handleDragMove(event: any): void {
    // O evento onDragMove não é necessário para posicionamento livre
    // O DevExtreme já cuida do posicionamento durante o drag
  }

  handleDragEnd(event: any): void {
    console.log('Drag end event:', event);
    const draggedWidget = event.itemData;
    
    if (draggedWidget) {
      const element = event.element;
      if (!element) {
        console.error('Element not found');
        return;
      }

      // Obter a posição atual do elemento após o drag
      const transform = element.style.transform;
      console.log('Transform:', transform);
      
      if (transform) {
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        
        if (match) {
          const newX = parseInt(match[1], 10);
          const newY = parseInt(match[2], 10);
          
          // Atualizar a posição do widget
          draggedWidget.position = {
            x: Math.max(0, (draggedWidget.position?.x || 0) + newX),
            y: Math.max(0, (draggedWidget.position?.y || 0) + newY)
          };
        }
      } else {
        // Fallback: usar as coordenadas do mouse
        const canvas = element.closest('.canvas');
        if (canvas) {
          const canvasRect = canvas.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          draggedWidget.position = {
            x: Math.max(0, elementRect.left - canvasRect.left),
            y: Math.max(0, elementRect.top - canvasRect.top)
          };
        }
      }

      console.log(`Widget ${draggedWidget.id} moved to:`, draggedWidget.position);

      // Resetar o transform para usar apenas left/top
      element.style.transform = '';
      
      // Atualizar o widget na lista
      const widgetIndex = this.widgets.findIndex(w => w.id === draggedWidget.id);
      if (widgetIndex !== -1) {
        this.widgets[widgetIndex] = { ...draggedWidget };
      }
      
      this.persist();
      this.cdr.detectChanges();
    } else {
      console.error('Dragged widget not found');
    }
  }

  // Implementação de drag nativo com mouse events
  onWidgetMouseDown(event: MouseEvent, widget: DashboardWidget): void {
    // Só permitir drag se clicar no header do widget
    const target = event.target as HTMLElement;
    const isHeader = target.closest('.widget-card__header');
    const isResizeHandle = target.closest('.dx-resizable-handle');
    const isButton = target.closest('dx-button') || target.closest('.widget-card__actions');
    
    // Não iniciar drag se for uma alça de redimensionamento ou botão
    if (isResizeHandle || isButton) {
      return;
    }
    
    // Só iniciar drag se clicar no header
    if (!isHeader) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.draggedWidget = widget;
    this.dragStartPos = { x: event.clientX, y: event.clientY };
    this.initialWidgetPos = { 
      x: widget.position?.x || 0, 
      y: widget.position?.y || 0 
    };

    // Adicionar classe de arrastar
    const widgetElement = target.closest('.canvas__item') as HTMLElement;
    if (widgetElement) {
      widgetElement.classList.add('dragging');
    }

    console.log('Starting drag for widget:', widget.id);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedWidget) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - this.dragStartPos.x;
    const deltaY = event.clientY - this.dragStartPos.y;

    // Atualizar posição do widget
    this.draggedWidget.position = {
      x: Math.max(0, this.initialWidgetPos.x + deltaX),
      y: Math.max(0, this.initialWidgetPos.y + deltaY)
    };

    this.cdr.detectChanges();
  }

  private onMouseUp(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedWidget) {
      return;
    }

    console.log('Drag ended for widget:', this.draggedWidget.id, 'at position:', this.draggedWidget.position);

    // Remover classe de arrastar de todos os elementos
    const draggingElements = document.querySelectorAll('.canvas__item.dragging');
    draggingElements.forEach(el => el.classList.remove('dragging'));

    this.isDragging = false;
    
    // Atualizar o widget na lista
    const widgetIndex = this.widgets.findIndex(w => w.id === this.draggedWidget!.id);
    if (widgetIndex !== -1) {
      this.widgets[widgetIndex] = { ...this.draggedWidget };
    }

    this.draggedWidget = null;
    this.persist();
    this.cdr.detectChanges();
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
    // Atualizar o widget com novo tamanho e posição (se fornecida)
    const updated = this.widgets.map((widget) => {
      if (widget.id !== widgetId) {
        return widget;
      }
      
      const updatedWidget = { 
        ...widget, 
        size: { width: size.width, height: size.height }
      };
      
      // Se a posição foi fornecida, atualizá-la também
      if (size.position) {
        updatedWidget.position = size.position;
      }
      
      return updatedWidget;
    });
    
    this.widgets = updated;
    this.cdr.markForCheck();
    
    // Trigger auto-save com debounce
    this.autoSave$.next();
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

  async changeDataSet(dataSetId: string): Promise<void> {
    if (!this.selectedWidgetId) {
      return;
    }

    const widget = this.widgets.find((item) => item.id === this.selectedWidgetId);
    if (!widget) {
      return;
    }

    try {
      // Gerar novos dados baseados no conjunto selecionado
      const data = await this.dataService.generateDataAsync(widget.type);
      this.updateWidget(widget.id, { data });
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Erro ao carregar novo conjunto de dados:', error);
      // Fallback para dados padrão
      const data = this.dataService.generateData(widget.type);
      this.updateWidget(widget.id, { data });
    }
  }

  saveLayout(): void {
    this.persist();
  }

  resetLayout(): void {
    this.widgets = []; // Limpar todos os widgets
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
      this.widgets = stored.filter(widget => widget.position); // Carregar apenas widgets válidos
      this.selectedWidgetId = null; // Nenhum widget selecionado inicialmente
    } else {
      this.widgets = []; // Não carregar widgets padrão
    }
    this.cdr.markForCheck();
  }

  private insertWidget(type: WidgetType, index: number): void {
    const widget = this.dataService.createWidget(type);
    
    // Calcular posição inicial para evitar sobreposição
    const offset = this.widgets.length * 30; // Deslocamento para cada novo widget
    widget.position = { 
      x: 50 + offset, 
      y: 50 + offset 
    };

    // Atualizar a lista de widgets e garantir que a referência seja alterada
    const updatedWidgets = [...this.widgets];
    updatedWidgets.splice(index, 0, widget);
    this.widgets = updatedWidgets;

    this.selectedWidgetId = widget.id;
    this.persist();
    this.cdr.detectChanges(); // Forçar atualização da interface
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
    this.cdr.markForCheck();
    
    // Trigger auto-save com debounce
    this.autoSave$.next();
  }

  private persist(): void {
    this.layoutService.save(this.widgets);
  }
}

// Configurações avançadas implementadas - versão 2.0
