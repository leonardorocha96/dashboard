import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DashboardPage } from '../../models/dashboard.models';

@Component({
  selector: 'app-page-tabs',
  templateUrl: './page-tabs.component.html',
  styleUrls: ['./page-tabs.component.scss'],
})
export class PageTabsComponent {
  @Input() pages: DashboardPage[] = [];
  @Input() activePageId = '';

  @Output() selectPage = new EventEmitter<string>();
  @Output() addPage = new EventEmitter<void>();
  @Output() duplicatePage = new EventEmitter<string>();
  @Output() renamePage = new EventEmitter<{ pageId: string; name: string }>();

  onSelect(page: DashboardPage): void {
    this.selectPage.emit(page.id);
  }

  onDuplicate(page: DashboardPage, event: MouseEvent): void {
    event.stopPropagation();
    this.duplicatePage.emit(page.id);
  }

  onRename(page: DashboardPage, event: MouseEvent): void {
    event.stopPropagation();
    const name = prompt('Renomear página', page.name);
    if (name && name.trim().length > 0) {
      this.renamePage.emit({ pageId: page.id, name: name.trim() });
    }
  }
}
