import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GlobalFilterBarComponent } from './components/global-filter-bar/global-filter-bar.component';

@NgModule({
  declarations: [GlobalFilterBarComponent],
  imports: [SharedModule],
  exports: [GlobalFilterBarComponent],
})
export class FiltersModule {}
