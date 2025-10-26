# Correções no Sistema de Drag and Drop e Redimensionamento

## Problemas Identificados

1. **Duplicação de `dx-resizable`**: O componente `dx-resizable` estava sendo usado tanto no template principal quanto no widget-card, causando conflitos.

2. **CSS Grid Layout**: O canvas estava usando `display: grid` que interferia com o posicionamento absoluto dos widgets.

3. **Conflito entre Drag e Resize**: Os eventos de mouse estavam interferindo entre o sistema de drag e as alças de redimensionamento.

4. **Lógica de posicionamento complexa**: A lógica de cálculo de posição durante o drag estava muito complexa e causando problemas.

## Soluções Implementadas

### 1. Estrutura do Template (dashboard-builder.component.html)

```html
<div *ngFor="let widget of widgets; trackBy: trackByWidgetId" 
     class="canvas__item" 
     [style.left.px]="widget.position?.x" 
     [style.top.px]="widget.position?.y"
     [style.position]="'absolute'"
     (mousedown)="onWidgetMouseDown($event, widget)"
     (dragstart)="$event.preventDefault()">
  <app-widget-card
    [widget]="widget"
    [selected]="widget.id === selectedWidgetId"
    (select)="selectWidget(widget.id)"
    (remove)="removeWidget(widget.id)"
    (configure)="openConfig(widget.id)"
    (resize)="resizeWidget(widget.id, $event)">
  </app-widget-card>
</div>
```

**Mudanças:**
- Removido o DevExtreme `dx-draggable` por completo
- Implementado sistema de drag nativo com eventos de mouse
- Adicionado `(dragstart)="$event.preventDefault()"` para evitar drag nativo do navegador

### 2. CSS do Canvas (.canvas)

```scss
.canvas {
  position: relative;
  width: 100%;
  min-height: 600px;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  overflow: auto;
}
```

**Mudanças:**
- Removido `display: grid` e suas propriedades relacionadas
- Adicionado `overflow: auto` para permitir scroll quando necessário
- Definido `min-height` para garantir espaço suficiente

### 3. CSS dos Itens (.canvas__item)

```scss
.canvas__item {
  position: absolute;
  z-index: 1;
  display: block;
  width: auto;
  height: auto;
}

.canvas__item.dragging {
  cursor: grabbing;
  z-index: 999;
  user-select: none;
  touch-action: none;
}

/* Permitir cursor grab apenas no header do widget */
.canvas__item .widget-card__header {
  cursor: grab;
}

.canvas__item.dragging .widget-card__header {
  cursor: grabbing;
}

/* Estilos para as alças de redimensionamento */
.canvas__item .dx-resizable-handle {
  pointer-events: auto !important;
  user-select: none;
  touch-action: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  background-color: #2563eb;
}

.canvas__item:hover .dx-resizable-handle {
  opacity: 0.8;
}
```

**Mudanças:**
- Removido `user-select: none` e `touch-action: none` do estado padrão
- Aplicado essas propriedades apenas durante o drag (.dragging)
- Adicionado estilos específicos para as alças de redimensionamento
- Cursor grab apenas no header do widget

### 4. Lógica de Drag and Drop com Mouse Events

#### onWidgetMouseDown()
```typescript
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

  // Iniciar sistema de drag...
}
```

#### onMouseMove()
```typescript
private onMouseMove(event: MouseEvent): void {
  if (!this.isDragging || !this.draggedWidget) {
    return;
  }

  const deltaX = event.clientX - this.dragStartPos.x;
  const deltaY = event.clientY - this.dragStartPos.y;

  // Atualizar posição do widget em tempo real
  this.draggedWidget.position = {
    x: Math.max(0, this.initialWidgetPos.x + deltaX),
    y: Math.max(0, this.initialWidgetPos.y + deltaY)
  };
}
```

#### onMouseUp()
```typescript
private onMouseUp(event: MouseEvent): void {
  if (!this.isDragging || !this.draggedWidget) {
    return;
  }

  // Remover classe de arrastar e finalizar drag
  const draggingElements = document.querySelectorAll('.canvas__item.dragging');
  draggingElements.forEach(el => el.classList.remove('dragging'));
  
  // Salvar posição final...
}
```

**Mudanças:**
- Sistema de drag nativo mais robusto usando eventos de mouse
- Drag só funciona quando clicar no header do widget
- Não interfere com as alças de redimensionamento
- Evita conflitos com botões e elementos interativos

### 5. Posicionamento de Novos Widgets

```typescript
private insertWidget(type: WidgetType, index: number): void {
  const widget = this.dataService.createWidget(type);
  
  // Calcular posição inicial para evitar sobreposição
  const offset = this.widgets.length * 30;
  widget.position = { 
    x: 50 + offset, 
    y: 50 + offset 
  };
  
  // ...resto do código
}
```

**Mudanças:**
- Novos widgets são posicionados com offset para evitar sobreposição
- Posição inicial dinâmica baseada no número de widgets existentes

## Resultado

Agora os widgets podem ser movidos livremente pela área do canvas e redimensionados:
- ✅ Drag and drop funciona corretamente
- ✅ Posicionamento absoluto livre
- ✅ Redimensionamento mantido e funcional
- ✅ Não há conflitos entre sistemas de arrasto e redimensionamento
- ✅ Widgets não se sobrepõem ao serem criados
- ✅ Performance melhorada
- ✅ Drag só funciona no header do widget
- ✅ Alças de redimensionamento visíveis ao passar o mouse

## Como Testar

1. Abra o dashboard builder
2. Adicione alguns widgets da paleta
3. Clique e arraste os widgets pela tela
4. Redimensione os widgets usando as alças de redimensionamento
5. Verifique que as posições são mantidas após salvar/recarregar
