import { Injectable } from '@angular/core';
import { ComponentDefinition } from '../../shared/models/component-registry.model';
import { ComponentType } from '../../shared/models/component-instance.model';
import { BoardKpiComponent } from './components/board-kpi/board-kpi.component';
import { DataGridComponent } from './components/data-grid/data-grid.component';
import { ChartComponent } from './components/chart/chart.component';
import { LabelComponent } from './components/label/label.component';
import { ImageComponent } from './components/image/image.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { InputNumberComponent } from './components/input-number/input-number.component';
import { InputDateRangeComponent } from './components/input-date-range/input-date-range.component';
import { InputCheckboxComponent } from './components/input-checkbox/input-checkbox.component';
import { InputMultiSelectComponent } from './components/input-multi-select/input-multi-select.component';
import { AdvancedSelectorComponent } from './components/selector/selector.component';

@Injectable({ providedIn: 'root' })
export class ComponentRegistryService {
  private readonly definitions: ComponentDefinition[] = [
    {
      type: 'board',
      icon: 'insights',
      title: 'KPI',
      description: 'Card de indicador com meta e variação.',
      defaultSize: { colSpan: 3, rowSpan: 2 },
      component: BoardKpiComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'data-grid',
      icon: 'table_chart',
      title: 'Tabela',
      description: 'DevExtreme DataGrid com colunas dinâmicas.',
      defaultSize: { colSpan: 6, rowSpan: 6 },
      component: DataGridComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'chart',
      icon: 'query_stats',
      title: 'Gráfico',
      description: 'Gráficos ApexCharts multi-série.',
      defaultSize: { colSpan: 6, rowSpan: 5 },
      component: ChartComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'label',
      icon: 'title',
      title: 'Label',
      description: 'Texto estático com suporte a tema.',
      defaultSize: { colSpan: 2, rowSpan: 1 },
      component: LabelComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'image',
      icon: 'image',
      title: 'Imagem',
      description: 'Imagem responsiva.',
      defaultSize: { colSpan: 3, rowSpan: 3 },
      component: ImageComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'input-text',
      icon: 'text_fields',
      title: 'Campo Texto',
      description: 'Input para filtros ou formulários.',
      defaultSize: { colSpan: 2, rowSpan: 1 },
      component: InputTextComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'input-number',
      icon: 'pin',
      title: 'Campo Numérico',
      description: 'Input numérico.',
      defaultSize: { colSpan: 2, rowSpan: 1 },
      component: InputNumberComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'input-date-range',
      icon: 'calendar_month',
      title: 'Intervalo de Datas',
      description: 'Seletor de intervalo de datas.',
      defaultSize: { colSpan: 3, rowSpan: 1 },
      component: InputDateRangeComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'input-checkbox',
      icon: 'check_box',
      title: 'Checkbox',
      description: 'Seleção booleana.',
      defaultSize: { colSpan: 2, rowSpan: 1 },
      component: InputCheckboxComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'input-multi-select',
      icon: 'list',
      title: 'Multi Seleção',
      description: 'Seletor multi valor.',
      defaultSize: { colSpan: 3, rowSpan: 2 },
      component: InputMultiSelectComponent,
      panels: this.createDefaultPanels(),
    },
    {
      type: 'selector',
      icon: 'search',
      title: 'Seletor Avançado',
      description: 'Busca remota com debounce.',
      defaultSize: { colSpan: 3, rowSpan: 2 },
      component: AdvancedSelectorComponent,
      panels: this.createDefaultPanels(),
    },
  ];

  getDefinitions(): ComponentDefinition[] {
    return [...this.definitions];
  }

  getDefinition(type: ComponentType): ComponentDefinition | undefined {
    return this.definitions.find((definition) => definition.type === type);
  }

  private createDefaultPanels() {
    return [
      {
        id: 'view',
        label: 'VIEW',
        icon: 'visibility',
        formSchema: [
          { id: 'viewMode', label: 'Modo', type: 'select', options: [
            { label: 'Análise', value: 'analysis' },
            { label: 'Cadastro', value: 'catalog' },
            { label: 'SQL', value: 'sql' },
          ] },
          { id: 'source', label: 'Fonte', type: 'text' },
        ],
      },
      {
        id: 'appearance',
        label: 'Personalizar',
        icon: 'palette',
        formSchema: [
          { id: 'backgroundColor', label: 'Cor de fundo', type: 'color' },
          { id: 'borderRadius', label: 'Borda', type: 'text' },
        ],
      },
      {
        id: 'interactions',
        label: 'Interações',
        icon: 'bolt',
        formSchema: [
          { id: 'onClick', label: 'onClick', type: 'json', hint: 'Defina lista de ações.' },
        ],
      },
    ];
  }
}
