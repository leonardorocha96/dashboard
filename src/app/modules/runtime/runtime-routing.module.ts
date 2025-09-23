import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RuntimeShellComponent } from './components/runtime-shell/runtime-shell.component';
import { PageResolver } from '../builder/resolvers/page.resolver';

const routes: Routes = [
  {
    path: ':pageId',
    component: RuntimeShellComponent,
    resolve: { page: PageResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RuntimeRoutingModule {}
