import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardBuilderComponent } from './features/dashboard-builder/dashboard-builder.component';

const routes: Routes = [
  { path: '', component: DashboardBuilderComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
