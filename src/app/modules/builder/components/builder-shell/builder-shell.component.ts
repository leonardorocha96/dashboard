import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';
import { BuilderApiService } from '../../../../shared/services/builder-api.service';
import { AiComposeService } from '../../../../shared/services/ai-compose.service';
import { Page } from '../../../../shared/models/page.model';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { TemplateDefinition } from '../../../../shared/models/layout.model';

interface BuilderViewModel {
  page: Page | null;
  components: ComponentInstance[];
  selection: string[];
}

@Component({
  selector: 'app-builder-shell',
  templateUrl: './builder-shell.component.html',
  styleUrls: ['./builder-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderShellComponent {
  vm$: Observable<BuilderViewModel> = combineLatest([
    this.state.pageLayout$,
    this.state.componentRegistry$,
    this.state.selectionChanges$,
  ]).pipe(
    map(([page, components, selection]) => ({ page, components, selection }))
  );

  showTemplates = false;

  templates$: Observable<TemplateDefinition[]> = this.api.listTemplates();

  constructor(
    private readonly state: BuilderStateService,
    private readonly api: BuilderApiService,
    private readonly aiCompose: AiComposeService
  ) {}

  save(): void {
    this.state.saveCurrentPage().subscribe();
  }

  openTemplates(): void {
    this.showTemplates = true;
  }

  closeTemplates(): void {
    this.showTemplates = false;
  }

  applyTemplate(template: TemplateDefinition): void {
    const page = this.state.getCurrentPageSnapshot();
    if (!page) {
      return;
    }
    page.layout = structuredClone(template.page);
    this.state.setCurrentPage(page.id);
    this.state.saveCurrentPage().subscribe();
    this.closeTemplates();
  }

  composeWithAi(command: string): void {
    this.aiCompose.mock(command).subscribe((page) => {
      this.api.savePage(page).subscribe(() => {
        this.state.loadWorkspace().subscribe(() => this.state.setCurrentPage(page.id));
      });
    });
  }
}
