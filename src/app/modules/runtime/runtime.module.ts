import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ComponentsLibraryModule } from '../components-library/components-library.module';
import { FiltersModule } from '../filters/filters.module';
import { RuntimeRoutingModule } from './runtime-routing.module';
import { RuntimeShellComponent } from './components/runtime-shell/runtime-shell.component';

@NgModule({
  declarations: [RuntimeShellComponent],
  imports: [SharedModule, ComponentsLibraryModule, FiltersModule, RuntimeRoutingModule],
})
export class RuntimeModule {}
