import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Page } from '../../../../shared/models/page.model';
import { BuilderStateService } from '../../../../shared/services/builder-state.service';

@Component({
  selector: 'app-builder-toolbar',
  templateUrl: './builder-toolbar.component.html',
  styleUrls: ['./builder-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderToolbarComponent {
  @Input() page: Page | null = null;
  @Output() saveRequested = new EventEmitter<void>();
  @Output() openTemplatesRequested = new EventEmitter<void>();
  @Output() aiComposeRequested = new EventEmitter<string>();

  resolutionControl = new FormControl('desktop');
  aiPromptControl = new FormControl('');

  readonly resolutions = [
    { id: 'desktop', label: 'Desktop (1440px)' },
    { id: 'tablet', label: 'Tablet (1024px)' },
    { id: 'mobile', label: 'Mobile (414px)' },
  ];

  constructor(private readonly state: BuilderStateService) {
    this.resolutionControl.valueChanges.subscribe((value) => {
      const page = this.state.getCurrentPageSnapshot();
      if (!page || !value) {
        return;
      }
      page.settings.resolutionClass = value;
      this.state.setCurrentPage(page.id);
    });
  }

  emitSave(): void {
    this.saveRequested.emit();
  }

  openTemplates(): void {
    this.openTemplatesRequested.emit();
  }

  compose(): void {
    const command = this.aiPromptControl.value;
    if (!command) {
      return;
    }
    this.aiComposeRequested.emit(command);
    this.aiPromptControl.reset();
  }
}
