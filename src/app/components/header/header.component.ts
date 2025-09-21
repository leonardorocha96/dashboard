import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DashboardProject } from '../../models/dashboard.models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() project: DashboardProject | null = null;

  @Output() toggleDataSources = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<void>();
  @Output() preview = new EventEmitter<void>();

  get statusLabel(): string {
    if (!this.project) {
      return 'Rascunho';
    }

    return this.project.status === 'publicado' ? 'Publicado' : 'Rascunho';
  }

  get statusClass(): string {
    return this.project?.status === 'publicado' ? 'status-pill--published' : 'status-pill--draft';
  }

  onToggleDataSources(): void {
    this.toggleDataSources.emit();
  }
}
