import { Injectable } from '@angular/core';
import { DashboardWidget } from '../dashboard-builder.models';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly storageKey = 'devextreme-dashboard-layout';

  load(): DashboardWidget[] {
    if (!this.isBrowser()) {
      return [];
    }

    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return [];
      }

      const layout = JSON.parse(serialized) as DashboardWidget[];
      return Array.isArray(layout) ? layout : [];
    } catch (error) {
      console.warn('Unable to parse stored layout', error);
      return [];
    }
  }

  save(layout: DashboardWidget[]): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      const serialized = JSON.stringify(layout);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      console.warn('Unable to persist layout', error);
    }
  }

  clear(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
