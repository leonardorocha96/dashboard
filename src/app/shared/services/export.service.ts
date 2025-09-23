import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportXlsx(data: unknown[], filename: string): void {
    const sanitized = this.sanitize(data);
    const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: 'application/json' });
    this.download(blob, `${filename}.xlsx.json`);
  }

  exportCsv(data: unknown[], filename: string): void {
    const sanitized = this.sanitize(data);
    const content = sanitized
      .map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(';')
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    this.download(blob, `${filename}.csv`);
  }

  exportPdf(data: unknown[], filename: string): void {
    const sanitized = this.sanitize(data);
    const content = JSON.stringify(sanitized, null, 2);
    const blob = new Blob([content], { type: 'application/pdf' });
    this.download(blob, `${filename}.pdf`);
  }

  private download(blob: Blob, filename: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private sanitize(data: unknown[]): Record<string, unknown>[] {
    return data.map((item) => {
      const sanitized: Record<string, unknown> = {};
      Object.entries(item as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        } else if (value instanceof Date) {
          sanitized[key] = value.toISOString();
        } else if (value && typeof value === 'object') {
          sanitized[key] = JSON.parse(JSON.stringify(value));
        } else {
          sanitized[key] = null;
        }
      });
      return sanitized;
    });
  }
}
