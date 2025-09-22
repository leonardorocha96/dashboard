import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DashboardComponentModel,
  DashboardPage,
  DashboardProject,
  DataCollection,
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

  resolveBinding(component: DashboardComponentModel): PreviewBindingContext {
    const dataSource = this.resolveDataSource(component.data.dataSourceId);
    const collection = this.resolveCollection(component, dataSource);
    return { dataSource, collection };
  }

  getCollectionLabel(binding: PreviewBindingContext): string | null {
    return binding.collection?.name ?? null;
  }

  getFieldLabel(binding: PreviewBindingContext, fieldId?: string): string | null {
    if (!fieldId) {
      return null;
    }

    const field =
      binding.collection?.fields.find(item => item.id === fieldId) ??
      binding.dataSource?.collections?.flatMap(item => item.fields).find(item => item.id === fieldId);

    return field?.label ?? fieldId;
  }

  private resolveDataSource(id?: string): DataSource | null {
    if (!id) {
      return null;
    }

    return (this.dataSources ?? []).find(source => source.id === id) ?? null;
  }

  private resolveCollection(
    component: DashboardComponentModel,
    dataSource: DataSource | null,
  ): DataCollection | null {
    if (!dataSource) {
      return null;
    }

    const collections = dataSource.collections ?? [];
    if (component.data.collectionId) {
      const explicit = collections.find(collection => collection.id === component.data.collectionId);
      if (explicit) {
        return explicit;
      }
    }

    const compatible = collections.find(collection =>
      this.collectionSupportsBinding(
        collection,
        component.data.metric,
        component.data.dimension,
        component.data.comparisonMetric,
      ),
    );

    if (compatible) {
      return compatible;
    }

    if (dataSource.defaultCollectionId) {
      const fallback = collections.find(collection => collection.id === dataSource.defaultCollectionId);
      if (fallback) {
        return fallback;
      }
    }

    return collections[0] ?? null;
  }

  private collectionSupportsBinding(
    collection: DataCollection,
    metric?: string,
    dimension?: string,
    comparisonMetric?: string,
  ): boolean {
    const fieldIds = new Set(collection.fields.map(field => field.id));
    const hasMetric = !metric || fieldIds.has(metric);
    const hasDimension = !dimension || fieldIds.has(dimension);
    const hasComparison = !comparisonMetric || fieldIds.has(comparisonMetric);

    return hasMetric && hasDimension && hasComparison;
  }
}

interface PreviewBindingContext {
  dataSource: DataSource | null;
  collection: DataCollection | null;
}
