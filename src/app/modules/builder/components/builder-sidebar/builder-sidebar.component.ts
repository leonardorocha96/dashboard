import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { Page } from '../../../../shared/models/page.model';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';

@Component({
  selector: 'app-builder-sidebar',
  templateUrl: './builder-sidebar.component.html',
  styleUrls: ['./builder-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderSidebarComponent implements OnChanges {
  @Input() page: Page | null = null;
  @Input() components: ComponentInstance[] = [];
  @Input() selection: string[] = [];

  tab: 'componentes' | 'configuracoes' | 'database' | 'tela' = 'componentes';

  componentForm = this.fb.group({
    backgroundColor: [''],
    borderRadius: ['16px'],
    zIndex: [1],
  });

  pageForm = this.fb.group({
    backgroundColor: [''],
    filterBarColor: [''],
    showApplyButton: [true],
    waitForSelection: [false],
  });

  constructor(private readonly fb: FormBuilder, private readonly state: BuilderStateService) {
    this.componentForm.valueChanges.subscribe((value) => {
      const component = this.selectedComponent;
      if (!component) {
        return;
      }
      this.state.updateComponentStyle(component.id, {
        backgroundColor: value.backgroundColor ?? undefined,
        borderRadius: value.borderRadius ?? undefined,
        zIndex: value.zIndex ?? undefined,
      });
    });

    this.pageForm.valueChanges.subscribe((value) => {
      if (!this.page) {
        return;
      }
      this.page.layout.grid.backgroundColor = value.backgroundColor ?? undefined;
      this.page.layout.filterBar = {
        ...(this.page.layout.filterBar ?? {}),
        backgroundColor: value.filterBarColor ?? undefined,
        showApplyButton: value.showApplyButton ?? true,
        requireSelectionBeforeRender: value.waitForSelection ?? false,
      };
      this.state.updateFilterBar(this.page.layout.filterBar);
    });
  }

  connections = [
    { id: 'conn-postgres', name: 'Postgres Vendas', type: 'postgres' },
    { id: 'conn-rest', name: 'API CRM', type: 'rest' }
  ];

  ngOnChanges(): void {
    const selected = this.selectedComponent;
    if (selected) {
      this.componentForm.patchValue(
        {
          backgroundColor: selected.style?.backgroundColor ?? '',
          borderRadius: selected.style?.borderRadius ?? '16px',
          zIndex: selected.style?.zIndex ?? 1,
        },
        { emitEvent: false }
      );
    }

    if (this.page) {
      this.pageForm.patchValue(
        {
          backgroundColor: this.page.layout.grid.backgroundColor ?? '',
          filterBarColor: this.page.layout.filterBar?.backgroundColor ?? '',
          showApplyButton: this.page.layout.filterBar?.showApplyButton ?? true,
          waitForSelection: this.page.layout.filterBar?.requireSelectionBeforeRender ?? false,
        },
        { emitEvent: false }
      );
    }
  }

  get selectedComponent(): ComponentInstance | undefined {
    const id = this.selection[0];
    return this.components.find((component) => component.id === id);
  }

  selectComponent(component: ComponentInstance): void {
    this.state.selectComponent(component.id);
  }
}
