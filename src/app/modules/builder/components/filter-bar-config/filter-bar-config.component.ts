import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FilterDefinition } from '../../../../shared/models/filter-config.model';
import { Page } from '../../../../shared/models/page.model';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';
import { FilterService } from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-filter-bar-config',
  templateUrl: './filter-bar-config.component.html',
  styleUrls: ['./filter-bar-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarConfigComponent implements OnInit {
  @Input() page!: Page;

  filtersForm = this.fb.group({
    filters: this.fb.array<FormGroup<unknown>>([]),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly state: BuilderStateService,
    private readonly filterService: FilterService
  ) {}

  ngOnInit(): void {
    const defaults: FilterDefinition[] = [
      {
        id: 'dataInicial',
        name: 'dataInicial',
        label: 'Data Inicial',
        component: 'dateRange',
        dimension: 'date_from',
        primaryColor: '#0ea5e9',
      },
      {
        id: 'dataFinal',
        name: 'dataFinal',
        label: 'Data Final',
        component: 'dateRange',
        dimension: 'date_to',
        primaryColor: '#0ea5e9',
      },
      {
        id: 'vendedor',
        name: 'vendedor',
        label: 'Vendedor',
        component: 'multiSelect',
        dimension: 'sales_rep',
        primaryColor: '#10b981',
      },
    ];
    const initial = this.page.layout.filterBar?.definitions?.length
      ? this.page.layout.filterBar?.definitions ?? []
      : defaults;

    initial.forEach((definition) => this.addFilter(definition));
    this.filterService.registerDefinitions(initial);
    this.state.setGlobalFilters(initial.map((definition) => ({ definition, value: null })));
  }

  get filters(): FormArray {
    return this.filtersForm.get('filters') as FormArray;
  }

  addFilter(definition?: FilterDefinition): void {
    this.filters.push(
      this.fb.group({
        id: [definition?.id ?? crypto.randomUUID()],
        label: [definition?.label ?? 'Novo filtro'],
        dimension: [definition?.dimension ?? ''],
        component: [definition?.component ?? 'text'],
        primaryColor: [definition?.primaryColor ?? '#6366f1'],
        secondaryColor: [definition?.secondaryColor ?? '#a855f7'],
        waitForApply: [definition?.waitForApply ?? false],
      })
    );
  }

  save(): void {
    const definitions = this.filters.controls.map((group) => ({
      id: group.value['id'],
      name: group.value['id'],
      label: group.value['label'],
      dimension: group.value['dimension'],
      component: group.value['component'],
      primaryColor: group.value['primaryColor'],
      secondaryColor: group.value['secondaryColor'],
      waitForApply: group.value['waitForApply'],
    } as FilterDefinition));
    this.filterService.registerDefinitions(definitions);
    this.state.setGlobalFilters(definitions.map((definition) => ({ definition, value: null })));
    this.page.layout.filterBar = {
      ...(this.page.layout.filterBar ?? {}),
      definitions,
    };
    this.state.updateFilterBar(this.page.layout.filterBar);
  }
}
