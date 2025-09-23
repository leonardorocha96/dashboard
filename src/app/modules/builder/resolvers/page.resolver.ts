import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { BuilderApiService } from '../../../shared/services/builder-api.service';
import { BuilderStateService } from '../../../shared/services/builder-state.service';
import { Page } from '../../../shared/models/page.model';

@Injectable({ providedIn: 'root' })
export class PageResolver implements Resolve<Page | null> {
  constructor(
    private readonly api: BuilderApiService,
    private readonly state: BuilderStateService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Page | null> {
    const pageId = route.paramMap.get('pageId');
    if (!pageId) {
      return of(null);
    }
    return this.state.loadWorkspace().pipe(
      switchMap(() => this.api.getPage(pageId)),
      tap((page) => {
        if (page) {
          this.state.setCurrentPage(pageId);
        }
      })
    );
  }
}
