import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxSortableModule } from 'devextreme-angular/ui/sortable';

import { DashboardBuilderRoutingModule } from './dashboard-builder-routing.module';
import { DashboardBuilderComponent } from './dashboard-builder.component';
import { WidgetPaletteComponent } from './components/widget-palette/widget-palette.component';
import { WidgetCardComponent } from './components/widget-card/widget-card.component';
import { WidgetConfigDrawerComponent } from './components/widget-config-drawer/widget-config-drawer.component';

@NgModule({
  declarations: [
    DashboardBuilderComponent,
    WidgetPaletteComponent,
    WidgetCardComponent,
    WidgetConfigDrawerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardBuilderRoutingModule,
    DxButtonModule,
    DxChartModule,
    DxPieChartModule,
    DxSortableModule
  ],
  exports: [
    DashboardBuilderComponent
  ]
})
export class DashboardBuilderModule { }