import { Injectable } from '@angular/core';

export interface AuditLogEntry {
  type: 'page' | 'action';
  entityId: string;
  user: string;
  timestamp: string;
  details: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly logs: AuditLogEntry[] = [];

  log(entry: AuditLogEntry): void {
    this.logs.push(entry);
    console.info('[Audit]', entry.type, entry.entityId, entry.details);
  }

  list(): AuditLogEntry[] {
    return [...this.logs];
  }
}
