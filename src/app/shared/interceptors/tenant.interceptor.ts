import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const tenant = localStorage.getItem('builder-tenant') ?? 'default-tenant';
    const cloned = req.clone({
      setHeaders: {
        'X-Tenant-ID': tenant,
      },
    });
    return next.handle(cloned);
  }
}
