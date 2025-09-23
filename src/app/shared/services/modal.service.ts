import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ViewConfig } from '../models/view-config.model';

export interface ModalDescriptor {
  id: string;
  title: string;
  component?: unknown;
  viewConfig?: ViewConfig;
  payload?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modal$ = new BehaviorSubject<ModalDescriptor | null>(null);

  readonly modalChanges$ = this.modal$.asObservable();

  open(descriptor: ModalDescriptor): void {
    this.modal$.next(descriptor);
  }

  close(): void {
    this.modal$.next(null);
  }

  openView(title: string, viewConfig: ViewConfig, payload?: unknown): void {
    this.open({ id: crypto.randomUUID(), title, viewConfig, payload });
  }

  openForm(title: string, payload: unknown): void {
    this.open({ id: crypto.randomUUID(), title, payload });
  }
}
