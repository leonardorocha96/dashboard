import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuilderApiService } from '../../../shared/services/builder-api.service';

@Injectable({ providedIn: 'root' })
export class PageGuard implements CanActivate {
  constructor(private readonly api: BuilderApiService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const pageId = route.paramMap.get('pageId');
    if (!pageId) {
      this.router.navigate(['/builder']);
      return of(false);
    }
    return this.api.getPage(pageId).pipe(
      map((page) => {
        if (!page) {
          this.router.navigate(['/builder']);
          return false;
        }
        return true;
      })
    );
  }
}
