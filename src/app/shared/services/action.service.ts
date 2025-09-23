import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ActionBinding, ActionExecutionContext } from '../models/action-config.model';
import { FilterService } from './filter.service';
import { ModalService } from './modal.service';
import { ExportService } from './export.service';
import { ViewService } from './view.service';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';

@Injectable({ providedIn: 'root' })
export class ActionService {
  private readonly rateLimiter = new Map<string, number[]>();

  constructor(
    private readonly filterService: FilterService,
    private readonly modalService: ModalService,
    private readonly exportService: ExportService,
    private readonly viewService: ViewService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly http: HttpClient
  ) {}

  execute(action: ActionBinding, context: ActionExecutionContext): Observable<void> {
    if (!this.canExecute(action)) {
      return throwError(() => new Error('Ação bloqueada por rate-limit.'));
    }

    let stream$: Observable<void>;
    switch (action.type) {
      case 'filterOtherComponents':
        stream$ = this.applyFilterAction(action);
        break;
      case 'openDetailsModal':
        stream$ = this.openDetailsModal(action);
        break;
      case 'dbAction':
        stream$ = this.executeDbAction(action, context);
        break;
      case 'apiCall':
        stream$ = this.executeApiCall(action, context);
        break;
      case 'createOrUpdate':
        stream$ = this.createOrUpdate(action, context);
        break;
      case 'sendEmail':
        stream$ = this.sendEmail(action, context);
        break;
      default:
        stream$ = of(void 0);
    }

    return stream$.pipe(
      tap(() => this.afterExecution(action))
    );
  }

  private applyFilterAction(action: ActionBinding): Observable<void> {
    const filters = action.payload?.['filters'] as { filterId: string; value: unknown }[] | undefined;
    if (!filters) {
      return of(void 0);
    }
    filters.forEach((binding) => this.filterService.updateValue(binding.filterId, binding.value));
    this.filterService.apply(true);
    action.target.componentIds?.forEach((componentId) => this.viewService.invalidate(componentId));
    return of(void 0);
  }

  private openDetailsModal(action: ActionBinding): Observable<void> {
    if (!action.target.viewId) {
      return throwError(() => new Error('View alvo não informado.'));
    }
    this.modalService.openView(action.label, {
      id: action.target.viewId,
      componentId: action.target.viewId,
      mode: 'analysis',
      source: 'details',
      dimensions: ['Campo'],
      measures: ['Valor'],
    });
    return of(void 0);
  }

  private executeDbAction(action: ActionBinding, context: ActionExecutionContext): Observable<void> {
    return this.http
      .post<void>('/api/db/action', {
        target: action.target,
        payload: action.payload,
        context,
      })
      .pipe(
        tap(() => action.target.componentIds?.forEach((id) => this.viewService.invalidate(id))),
        map(() => void 0)
      );
  }

  private executeApiCall(action: ActionBinding, context: ActionExecutionContext): Observable<void> {
    const method = (action.target.method ?? 'POST').toUpperCase();
    return this.http
      .request<void>(method, action.target.endpoint ?? '/api/action', {
        body: { payload: action.payload, context },
      })
      .pipe(
        tap(() => {
          const payload = (action.payload ?? {}) as Record<string, unknown>;
          const dataset = Array.isArray(payload['dataset'])
            ? (payload['dataset'] as unknown[])
            : undefined;
          const filename = typeof payload['filename'] === 'string' ? (payload['filename'] as string) : 'export';
          if (dataset?.length) {
            this.exportService.exportXlsx(dataset, filename);
          }
        }),
        map(() => void 0)
      );
  }

  private createOrUpdate(action: ActionBinding, context: ActionExecutionContext): Observable<void> {
    this.modalService.openForm(action.label, { action, context });
    return of(void 0);
  }

  private sendEmail(action: ActionBinding, context: ActionExecutionContext): Observable<void> {
    return this.emailService
      .sendEmail({
        to: (action.payload?.['to'] as string[]) ?? ['ops@example.com'],
        subject: action.payload?.['subject'] as string,
        templateId: action.payload?.['templateId'] as string,
        variables: { context },
      })
      .pipe(map(() => void 0));
  }

  private canExecute(action: ActionBinding): boolean {
    if (!action.rateLimitPerMinute) {
      return true;
    }
    const now = Date.now();
    const windowStart = now - 60_000;
    const executions = this.rateLimiter.get(action.id) ?? [];
    const recent = executions.filter((timestamp) => timestamp > windowStart);
    if (recent.length >= action.rateLimitPerMinute) {
      return false;
    }
    recent.push(now);
    this.rateLimiter.set(action.id, recent);
    return true;
  }

  private afterExecution(action: ActionBinding): void {
    if (action.audit) {
      this.auditService.log({
        type: 'action',
        entityId: action.id,
        user: 'current-user',
        timestamp: new Date().toISOString(),
        details: { action },
      });
    }
  }
}
