import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataSource } from '../../models/dashboard.models';
import { createId } from '../../utils/id';

@Component({
  selector: 'app-data-source-drawer',
  templateUrl: './data-source-drawer.component.html',
  styleUrls: ['./data-source-drawer.component.scss'],
})
export class DataSourceDrawerComponent {
  @Input() dataSources: DataSource[] | null = [];

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<DataSource>();
  @Output() remove = new EventEmitter<string>();

  readonly form: FormGroup;
  readonly types = [
    { id: 'sankhya', label: 'Sankhya ERP' },
    { id: 'sql', label: 'Banco SQL' },
    { id: 'rest', label: 'API REST' },
    { id: 'csv', label: 'Arquivo CSV' },
    { id: 'sheet', label: 'Google Sheets' },
  ];

  readonly refreshOptions = [
    { id: 'tempo-real', label: 'Tempo real' },
    { id: 'agendado', label: 'Agendado' },
    { id: 'sob-demanda', label: 'Sob demanda' },
  ];

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['sankhya', Validators.required],
      refresh: ['agendado', Validators.required],
      owner: ['', Validators.required],
      description: [''],
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const dataSource: DataSource = {
      id: createId('ds'),
      name: value.name,
      type: value.type,
      refresh: value.refresh,
      owner: value.owner,
      description: value.description,
      status: 'conectado',
      lastUpdate: new Date().toISOString(),
    };

    this.create.emit(dataSource);
    this.form.reset({ type: 'sankhya', refresh: 'agendado' });
  }

  onRemove(id: string): void {
    this.remove.emit(id);
  }
}
