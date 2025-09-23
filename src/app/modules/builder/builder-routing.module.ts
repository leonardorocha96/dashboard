import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuilderShellComponent } from './components/builder-shell/builder-shell.component';
import { PageGuard } from './guards/page.guard';
import { PageResolver } from './resolvers/page.resolver';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'pages/default-page', pathMatch: 'full' },
      {
        path: 'pages/:pageId',
        component: BuilderShellComponent,
        canActivate: [PageGuard],
        resolve: { page: PageResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuilderRoutingModule {}
