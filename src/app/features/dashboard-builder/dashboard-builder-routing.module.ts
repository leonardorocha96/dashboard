import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardBuilderComponent } from './dashboard-builder.component';

const routes: Routes = [
  { path: '', component: DashboardBuilderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardBuilderRoutingModule { }
