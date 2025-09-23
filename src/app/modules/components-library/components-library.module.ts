import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DxDataGridModule } from 'devextreme-angular';
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
import { ComponentWrapperComponent } from './components/component-wrapper/component-wrapper.component';

@NgModule({
  declarations: [
    BoardKpiComponent,
    DataGridComponent,
    ChartComponent,
    LabelComponent,
    ImageComponent,
    InputTextComponent,
    InputNumberComponent,
    InputDateRangeComponent,
    InputCheckboxComponent,
    InputMultiSelectComponent,
    AdvancedSelectorComponent,
    ComponentWrapperComponent,
  ],
  imports: [SharedModule, NgApexchartsModule, DxDataGridModule],
  exports: [
    BoardKpiComponent,
    DataGridComponent,
    ChartComponent,
    LabelComponent,
    ImageComponent,
    InputTextComponent,
    InputNumberComponent,
    InputDateRangeComponent,
    InputCheckboxComponent,
    InputMultiSelectComponent,
    AdvancedSelectorComponent,
    ComponentWrapperComponent,
  ],
})
export class ComponentsLibraryModule {}
