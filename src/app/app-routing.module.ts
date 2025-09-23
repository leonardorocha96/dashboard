import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'builder/pages/default-page', pathMatch: 'full' },
  {
    path: 'builder',
    loadChildren: () => import('./modules/builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'runtime',
    loadChildren: () => import('./modules/runtime/runtime.module').then((m) => m.RuntimeModule),
  },
  { path: '**', redirectTo: 'builder/pages/default-page' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
