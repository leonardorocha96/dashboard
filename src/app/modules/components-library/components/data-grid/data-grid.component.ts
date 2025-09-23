import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridComponent {
  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}

  get columns(): DxDataGridTypes.Column[] {
    return (this.ctx.data.fields ?? Object.keys(this.ctx.data.data?.[0] ?? {})).map((field) => ({
      dataField: field,
      caption: field,
    }));
  }

  handleRowDblClick(event: DxDataGridTypes.RowDblClickEvent): void {
    this.ctx.trigger('onRowDoubleClick', event.data);
  }

  handleSelectionChanged(event: DxDataGridTypes.SelectionChangedEvent): void {
    this.ctx.trigger('onSelectionChange', event.selectedRowsData);
  }
}
