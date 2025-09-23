import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ViewConfigPanelComponent } from './components/view-config-panel/view-config-panel.component';

@NgModule({
  declarations: [ViewConfigPanelComponent],
  imports: [SharedModule],
  exports: [ViewConfigPanelComponent],
})
export class ViewsModule {}
