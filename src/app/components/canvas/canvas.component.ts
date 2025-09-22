import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  DashboardComponentModel,
  DashboardPage,
  DataCollection,
  DataSource,
  DeviceMode,
  LayoutDimensions,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  @Input() page: DashboardPage | null = null;
  @Input() viewMode: DeviceMode = 'desktop';
  @Input() selectedComponent: DashboardComponentModel | null = null;
  @Input() dataSources: DataSource[] | null = [];

  @Output() selectComponent = new EventEmitter<DashboardComponentModel | null>();
  @Output() componentMoved = new EventEmitter<{ componentId: string; position: LayoutDimensions }>();

  get canvasClass(): string {
    return `canvas--${this.viewMode}`;
  }

  onCanvasClick(): void {
    this.selectComponent.emit(null);
  }

  onSelectComponent(component: DashboardComponentModel, event: MouseEvent): void {
    event.stopPropagation();
    this.selectComponent.emit(component);
  }

  onDragEnded(component: DashboardComponentModel, event: CdkDragEnd): void {
    const position = event.source.getFreeDragPosition();
    const nextPosition: LayoutDimensions = {
      x: Math.max(0, Math.round(position.x)),
      y: Math.max(0, Math.round(position.y)),
      width: component.position.width,
      height: component.position.height,
    };

    this.componentMoved.emit({ componentId: component.id, position: nextPosition });
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
      border: component.style.showBorder ? '1px solid var(--color-border)' : 'none',
      boxShadow: component.style.showBorder ? 'none' : 'var(--shadow-card)',
    };
  }

  resolveBinding(component: DashboardComponentModel): ComponentBindingContext {
    const dataSource = this.resolveDataSource(component.data.dataSourceId);
    const collection = this.resolveCollection(component, dataSource);
    return { dataSource, collection };
  }

  getDataSourceLabel(binding: ComponentBindingContext): string | null {
    return binding.dataSource?.name ?? null;
  }

  getCollectionLabel(binding: ComponentBindingContext): string | null {
    return binding.collection?.name ?? null;
  }

  getFieldLabel(binding: ComponentBindingContext, fieldId?: string): string | null {
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

interface ComponentBindingContext {
  dataSource: DataSource | null;
  collection: DataCollection | null;
}
