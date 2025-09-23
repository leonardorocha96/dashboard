import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { ViewConfig } from '../../../../shared/models/view-config.model';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';

@Component({
  selector: 'app-view-config-panel',
  templateUrl: './view-config-panel.component.html',
  styleUrls: ['./view-config-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewConfigPanelComponent implements OnChanges {
  @Input() component: ComponentInstance | null = null;

  form = this.fb.group({
    mode: ['analysis'],
    source: [''],
    dimensions: [''],
    measures: [''],
    queryId: [''],
  });

  constructor(private readonly fb: FormBuilder, private readonly state: BuilderStateService) {
    this.form.valueChanges.subscribe((value) => {
      if (!this.component) {
        return;
      }
      const config: ViewConfig =
        value.mode === 'analysis'
          ? {
              id: this.component.view?.id ?? crypto.randomUUID(),
              componentId: this.component.id,
              mode: 'analysis',
              source: value.source ?? 'default',
              dimensions: (value.dimensions ?? '').split(',').map((item) => item.trim()).filter(Boolean),
              measures: (value.measures ?? '').split(',').map((item) => item.trim()).filter(Boolean),
            }
          : value.mode === 'catalog'
          ? {
              id: this.component.view?.id ?? crypto.randomUUID(),
              componentId: this.component.id,
              mode: 'catalog',
              table: value.source ?? 'table',
              primaryKey: 'id',
              searchableFields: (value.dimensions ?? '').split(',').map((item) => item.trim()).filter(Boolean),
            }
          : {
              id: this.component.view?.id ?? crypto.randomUUID(),
              componentId: this.component.id,
              mode: 'sql',
              queryId: value.queryId ?? 'sales-dashboard',
              params: {},
            };
      this.state.attachViewConfig(this.component.id, config);
    });
  }

  ngOnChanges(): void {
    if (!this.component?.view) {
      return;
    }
    const view = this.component.view;
    this.form.patchValue(
      {
        mode: view.mode,
        source: 'source' in view ? view.source : view.mode === 'catalog' ? view.table : '',
        dimensions:
          view.mode === 'analysis'
            ? view.dimensions.join(', ')
            : view.mode === 'catalog'
            ? (view.searchableFields ?? []).join(', ')
            : '',
        measures: view.mode === 'analysis' ? view.measures.join(', ') : '',
        queryId: view.mode === 'sql' ? view.queryId : '',
      },
      { emitEvent: false }
    );
  }
}
