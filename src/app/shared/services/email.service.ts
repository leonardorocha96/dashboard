import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface EmailPayload {
  to: string[];
  subject: string;
  templateId: string;
  variables?: Record<string, unknown>;
  attachments?: { name: string; content: string }[];
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  sendEmail(payload: EmailPayload): Observable<void> {
    console.info('Mock email enviado', payload);
    return of(void 0).pipe(delay(200));
  }
}
