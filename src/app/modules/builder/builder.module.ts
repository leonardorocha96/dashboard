import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ComponentsLibraryModule } from '../components-library/components-library.module';
import { FiltersModule } from '../filters/filters.module';
import { ViewsModule } from '../views/views.module';
import { BuilderRoutingModule } from './builder-routing.module';
import { BuilderShellComponent } from './components/builder-shell/builder-shell.component';
import { BuilderToolbarComponent } from './components/builder-toolbar/builder-toolbar.component';
import { ComponentPaletteComponent } from './components/component-palette/component-palette.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { ComponentContextMenuComponent } from './components/component-context-menu/component-context-menu.component';
import { BuilderSidebarComponent } from './components/builder-sidebar/builder-sidebar.component';
import { FilterBarConfigComponent } from './components/filter-bar-config/filter-bar-config.component';
import { TemplatesWizardComponent } from './components/templates-wizard/templates-wizard.component';

@NgModule({
  declarations: [
    BuilderShellComponent,
    BuilderToolbarComponent,
    ComponentPaletteComponent,
    BuilderCanvasComponent,
    ComponentContextMenuComponent,
    BuilderSidebarComponent,
    FilterBarConfigComponent,
    TemplatesWizardComponent,
  ],
  imports: [SharedModule, ComponentsLibraryModule, FiltersModule, ViewsModule, BuilderRoutingModule],
})
export class BuilderModule {}
