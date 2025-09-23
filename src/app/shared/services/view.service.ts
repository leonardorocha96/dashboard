import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { BuilderApiService } from './builder-api.service';
import { FilterService } from './filter.service';
import { FilterBinding } from '../models/filter-config.model';
import { ViewConfig, ViewDataResponse } from '../models/view-config.model';

interface CacheEntry {
  response: ViewDataResponse;
  timestamp: number;
  hash: string;
}

@Injectable({ providedIn: 'root' })
export class ViewService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlFallback = 30_000;

  constructor(
    private readonly http: HttpClient,
    private readonly builderApi: BuilderApiService,
    private readonly filterService: FilterService
  ) {
    this.filterService.applyEvents$.subscribe((event) => {
      this.invalidateByHash(event.hash);
    });
  }

  getData(
    componentId: string,
    view: ViewConfig,
    bindings: FilterBinding[] = []
  ): Observable<ViewDataResponse> {
    const filters = this.filterService.getFilterBindings(bindings);
    const hash = this.computeHash(componentId, view, filters);
    const entry = this.cache.get(hash);

    if (entry && Date.now() - entry.timestamp < (view.cacheTtl ?? this.ttlFallback)) {
      return of(entry.response);
    }

    let request$: Observable<ViewDataResponse>;
    switch (view.mode) {
      case 'analysis':
        request$ = this.resolveAnalysisView(view, filters);
        break;
      case 'catalog':
        request$ = this.resolveCatalogView(view, filters);
        break;
      case 'sql':
        if (!this.builderApi.isQueryWhitelisted(view.queryId)) {
          return throwError(() => new Error(`Query ${view.queryId} não permitida.`));
        }
        request$ = this.resolveSqlView(view, filters);
        break;
      default:
        request$ = throwError(() => new Error('Modo de view não suportado'));
    }

    return request$.pipe(
      map((response) => {
        this.cache.set(hash, { response, timestamp: Date.now(), hash });
        return response;
      })
    );
  }

  invalidate(componentId: string): void {
    [...this.cache.entries()].forEach(([key]) => {
      if (key.includes(componentId)) {
        this.cache.delete(key);
      }
    });
  }

  invalidateByHash(hash: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hash === hash) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private computeHash(componentId: string, view: ViewConfig, filters: Record<string, unknown>): string {
    return btoa(
      JSON.stringify({
        componentId,
        viewId: view.id,
        mode: view.mode,
        filters,
      })
    );
  }

  private resolveAnalysisView(
    view: ViewConfig & { mode: 'analysis' },
    filters: Record<string, unknown>
  ): Observable<ViewDataResponse> {
    const categories = view.dimensions.length ? view.dimensions : ['Categoria'];
    const measures = view.measures.length ? view.measures : ['Valor'];
    const startDate =
      filters['dataInicial'] !== undefined
        ? this.coerceDate(filters['dataInicial'])
        : this.addMonths(new Date(), -5);
    const rows = Array.from({ length: 6 }).map((_, index) => {
      const base: Record<string, unknown> = {};
      categories.forEach((dimension) => {
        base[dimension] = dimension.toLowerCase().includes('data')
          ? this.formatDate(this.addMonths(startDate, index))
          : `${dimension} ${index + 1}`;
      });
      measures.forEach((measure) => {
        base[measure] = Math.round(Math.random() * 1000 + index * 100);
      });
      return base;
    });
    return of({ data: rows, fields: [...categories, ...measures] }).pipe(delay(220));
  }

  private resolveCatalogView(
    view: ViewConfig & { mode: 'catalog' },
    filters: Record<string, unknown>
  ): Observable<ViewDataResponse> {
    const pageSize = view.pageSize ?? 10;
    const data = Array.from({ length: pageSize }).map((_, index) => ({
      id: `${view.table}-${index + 1}`,
      ...filters,
      ...((view.searchableFields ?? []).reduce(
        (acc, field) => ({
          ...acc,
          [field]: `${field}-${index + 1}`,
        }),
        {} as Record<string, string>
      )),
    }));
    return of({ data, total: 50, page: 1, pageSize }).pipe(delay(180));
  }

  private resolveSqlView(
    view: ViewConfig & { mode: 'sql' },
    filters: Record<string, unknown>
  ): Observable<ViewDataResponse> {
    const payload = {
      queryId: view.queryId,
      params: { ...filters, ...(view.params ?? {}) },
    };
    return this.http.post<ViewDataResponse>('/api/sql/run', payload).pipe(
      delay(120),
      map((response) => response ?? { data: [] })
    );
  }

  private coerceDate(value: unknown): Date {
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (typeof value === 'number') {
      const fromNumber = new Date(value);
      if (!Number.isNaN(fromNumber.getTime())) {
        return fromNumber;
      }
    }
    if (typeof value === 'string') {
      const fromString = new Date(value);
      if (!Number.isNaN(fromString.getTime())) {
        return fromString;
      }
    }
    return new Date();
  }

  private addMonths(base: Date, months: number): Date {
    const result = new Date(base.getTime());
    const expectedMonth = result.getMonth() + months;
    result.setMonth(expectedMonth);
    return result;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
