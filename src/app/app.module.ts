import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxEchartsModule } from 'ngx-echarts';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { ComponentLibraryComponent } from './components/component-library/component-library.component';
import { PageTabsComponent } from './components/page-tabs/page-tabs.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { InspectorComponent } from './components/inspector/inspector.component';
import { DataSourceDrawerComponent } from './components/data-source-drawer/data-source-drawer.component';
import { EditorToolbarComponent } from './components/editor-toolbar/editor-toolbar.component';
import { PreviewOverlayComponent } from './components/preview-overlay/preview-overlay.component';
import { VisualizationCardComponent } from './components/visualization-card/visualization-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SideNavComponent,
    ComponentLibraryComponent,
    PageTabsComponent,
    CanvasComponent,
    InspectorComponent,
    DataSourceDrawerComponent,
    EditorToolbarComponent,
    PreviewOverlayComponent,
    VisualizationCardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
