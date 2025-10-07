import { Injectable } from '@angular/core';
import { DashboardWidget } from '../models/widget.model';

const STORAGE_KEY = 'dashboard-builder-layout';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  load(): DashboardWidget[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as DashboardWidget[];
    } catch {
      return [];
    }
  }

  save(widgets: DashboardWidget[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }
}
