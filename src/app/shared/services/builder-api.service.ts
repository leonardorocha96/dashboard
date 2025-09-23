import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Page } from '../models/page.model';
import { PageLayout, TemplateDefinition } from '../models/layout.model';

interface PersistQueueItem {
  page: Page;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class BuilderApiService {
  private readonly storageKey = 'analytics-studio-pages';
  private readonly queue: PersistQueueItem[] = [];
  private readonly templateKey = 'analytics-studio-templates';
  private whitelist: Set<string> = new Set(['sales-dashboard', 'finance-dashboard', 'mobile-sales']);

  constructor(private readonly http: HttpClient) {
    this.ensureSeedData();
    timer(0, 1500).subscribe(() => this.flushQueue());
  }

  listPages(): Observable<Page[]> {
    return of(this.loadPages()).pipe(delay(150));
  }

  getPage(pageId: string): Observable<Page | null> {
    return this.listPages().pipe(
      map((pages) => pages.find((page) => page.id === pageId) ?? null)
    );
  }

  savePage(page: Page): Observable<Page> {
    const pages = this.loadPages();
    const index = pages.findIndex((item) => item.id === page.id);
    if (index > -1) {
      pages[index] = structuredClone(page);
    } else {
      pages.push(structuredClone(page));
    }
    this.persistPages(pages);
    return of(page).pipe(delay(200));
  }

  deletePage(pageId: string): Observable<void> {
    const pages = this.loadPages().filter((page) => page.id !== pageId);
    this.persistPages(pages);
    return of(void 0).pipe(delay(150));
  }

  listTemplates(): Observable<TemplateDefinition[]> {
    const templates = this.loadTemplates();
    return of(templates).pipe(delay(120));
  }

  saveTemplate(template: TemplateDefinition): Observable<void> {
    const templates = this.loadTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index > -1) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    this.persistTemplates(templates);
    return of(void 0);
  }

  queuePersist(page: Page): void {
    this.queue.push({ page: structuredClone(page), timestamp: Date.now() });
  }

  loadLayoutForRuntime(pageId: string): Observable<PageLayout | null> {
    return this.getPage(pageId).pipe(map((page) => page?.layout ?? null));
  }

  registerSqlWhitelist(entries: string[]): void {
    entries.forEach((entry) => this.whitelist.add(entry));
  }

  isQueryWhitelisted(queryId: string): boolean {
    return this.whitelist.has(queryId);
  }

  private flushQueue(): void {
    if (!this.queue.length) {
      return;
    }
    const latest = this.queue[this.queue.length - 1];
    this.queue.length = 0;
    const pages = this.loadPages();
    const index = pages.findIndex((page) => page.id === latest.page.id);
    if (index > -1) {
      pages[index] = latest.page;
    } else {
      pages.push(latest.page);
    }
    this.persistPages(pages);
  }

  private ensureSeedData(): void {
    if (this.loadPages().length) {
      return;
    }
    const now = new Date().toISOString();
    const basePage: Page = {
      id: 'default-page',
      name: 'Página Inicial',
      description: 'Layout em branco para iniciar.',
      layout: {
        id: 'default-layout',
        name: 'Layout 12x12',
        grid: {
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(12, minmax(60px, auto))',
          gap: '1.25rem',
          backgroundColor: 'var(--canvas-background)',
        },
        components: [],
        filterBar: {
          backgroundColor: 'var(--surface-1)',
          fixed: true,
          showApplyButton: true,
          requireSelectionBeforeRender: false,
          definitions: [
            {
              id: 'dataInicial',
              name: 'dataInicial',
              label: 'Data Inicial',
              component: 'dateRange',
              dimension: 'date_from',
            },
            {
              id: 'dataFinal',
              name: 'dataFinal',
              label: 'Data Final',
              component: 'dateRange',
              dimension: 'date_to',
            },
            {
              id: 'vendedor',
              name: 'vendedor',
              label: 'Vendedor',
              component: 'multiSelect',
              dimension: 'sales_rep',
            },
          ],
        },
      },
      settings: {
        theme: 'default',
        resolutionClass: 'desktop',
        previewScale: 1,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
    };

    this.persistPages([basePage]);
    this.persistTemplates(this.seedTemplates(basePage.layout));
  }

  private seedTemplates(defaultLayout: PageLayout): TemplateDefinition[] {
    const sales = structuredClone(defaultLayout);
    sales.id = 'sales-layout';
    sales.name = 'Template Vendas';
    sales.components = [];

    const finance = structuredClone(defaultLayout);
    finance.id = 'finance-layout';
    finance.name = 'Template Financeiro';

    const mobile = structuredClone(defaultLayout);
    mobile.id = 'mobile-layout';
    mobile.name = 'Template Mobile';
    mobile.grid.gridTemplateColumns = 'repeat(4, 1fr)';

    return [
      {
        id: 'template-sales',
        label: 'Vendas',
        description: 'Resumo de metas e resultados de vendas.',
        thumbnail: 'assets/examples/template-sales.svg',
        page: sales,
      },
      {
        id: 'template-finance',
        label: 'Financeiro',
        description: 'Indicadores financeiros, despesas e receitas.',
        thumbnail: 'assets/examples/template-finance.svg',
        page: finance,
      },
      {
        id: 'template-mobile',
        label: 'Mobile',
        description: 'Layout enxuto para dispositivos móveis.',
        thumbnail: 'assets/examples/template-mobile.svg',
        page: mobile,
      },
    ];
  }

  private loadPages(): Page[] {
    if (typeof localStorage === 'undefined') {
      return (globalThis as any).__memoryPages ?? [];
    }
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Page[]) : [];
  }

  private persistPages(pages: Page[]): void {
    if (typeof localStorage === 'undefined') {
      (globalThis as any).__memoryPages = pages;
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(pages));
  }

  private loadTemplates(): TemplateDefinition[] {
    if (typeof localStorage === 'undefined') {
      return (globalThis as any).__templates ?? [];
    }
    const raw = localStorage.getItem(this.templateKey);
    return raw ? (JSON.parse(raw) as TemplateDefinition[]) : [];
  }

  private persistTemplates(templates: TemplateDefinition[]): void {
    if (typeof localStorage === 'undefined') {
      (globalThis as any).__templates = templates;
      return;
    }
    localStorage.setItem(this.templateKey, JSON.stringify(templates));
  }
}
