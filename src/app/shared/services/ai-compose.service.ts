import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/page.model';
import { BuilderApiService } from './builder-api.service';

export interface ComposeRequest {
  command: string;
}

export interface ComposeResponse {
  page: Page;
}

@Injectable({ providedIn: 'root' })
export class AiComposeService {
  constructor(private readonly http: HttpClient, private readonly api: BuilderApiService) {}

  compose(request: ComposeRequest): Observable<Page> {
    return this.http.post<ComposeResponse>('/ai/compose', request).pipe(
      map((response) => response.page)
    );
  }

  mock(command: string): Observable<Page> {
    return this.api.getPage('default-page').pipe(
      map((page) => {
        if (!page) {
          throw new Error('Página base não encontrada');
        }
        const clone = structuredClone(page);
        clone.id = `draft-${crypto.randomUUID()}`;
        clone.name = `AI: ${command}`;
        clone.layout.components = [
          {
            id: crypto.randomUUID(),
            componentType: 'chart',
            title: 'Vendas x Meta',
            position: { rowStart: 1, colStart: 1, rowSpan: 4, colSpan: 6 },
            style: { zIndex: 1 },
            view: {
              id: crypto.randomUUID(),
              componentId: 'chart-ai',
              mode: 'analysis',
              source: 'sales',
              dimensions: ['Mês'],
              measures: ['Vendas', 'Meta'],
              groupBy: ['Vendedor'],
              limit: 12,
            },
          },
        ];
        return clone;
      })
    );
  }
}
