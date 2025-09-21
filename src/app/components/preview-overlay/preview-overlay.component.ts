import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DashboardComponentModel,
  DashboardPage,
  DashboardProject,
  DataSource,
  DeviceMode,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-preview-overlay',
  templateUrl: './preview-overlay.component.html',
  styleUrls: ['./preview-overlay.component.scss'],
})
export class PreviewOverlayComponent {
  @Input() project: DashboardProject | null = null;
  @Input() pages: DashboardPage[] = [];
  @Input() dataSources: DataSource[] | null = [];
  @Input() activePageId = '';
  @Input() viewMode: DeviceMode = 'desktop';

  @Output() close = new EventEmitter<void>();
  @Output() selectPage = new EventEmitter<string>();
  @Output() changeDevice = new EventEmitter<DeviceMode>();

  readonly deviceModes: { id: DeviceMode; label: string; icon: string }[] = [
    { id: 'desktop', label: 'Desktop', icon: 'desktop_windows' },
    { id: 'tablet', label: 'Tablet', icon: 'tablet' },
    { id: 'mobile', label: 'Mobile', icon: 'phone_iphone' },
  ];

  get activePage(): DashboardPage | null {
    return this.pages.find(page => page.id === this.activePageId) ?? this.pages[0] ?? null;
  }

  get statusLabel(): string {
    if (!this.project) {
      return 'Rascunho';
    }

    return this.project.status === 'publicado' ? 'Publicado' : 'Rascunho';
  }

  get statusClass(): string {
    return this.project?.status === 'publicado' ? 'status-pill--published' : 'status-pill--draft';
  }

  onClose(): void {
    this.close.emit();
  }

  onSelectPage(pageId: string): void {
    this.selectPage.emit(pageId);
  }

  onChangeDevice(mode: DeviceMode): void {
    this.changeDevice.emit(mode);
  }

  getComponentStyle(component: DashboardComponentModel): Record<string, string> {
    return {
      width: `${component.position.width}px`,
      height: `${component.position.height}px`,
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      background: component.style.backgroundColor,
      color: component.style.textColor,
      borderRadius: `${component.style.cornerRadius}px`,
      border: component.style.showBorder ? `1px solid ${component.style.accentColor}` : 'none',
      boxShadow: component.style.showBorder ? 'none' : 'var(--shadow-card)',
    };
  }

  resolveDataSourceName(id?: string): string | null {
    if (!id) {
      return null;
    }

    const match = (this.dataSources ?? []).find(source => source.id === id);
    return match?.name ?? id;
  }
}
