import { Component, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import {
  DashboardComponentModel,
  DataCollection,
  DataCollectionField,
  DataSource,
} from '../../models/dashboard.models';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.scss'],
})
export class InspectorComponent implements OnChanges, OnDestroy {
  @Input() component: DashboardComponentModel | null = null;
  @Input() dataSources: DataSource[] | null = [];

  @Output() updateComponent = new EventEmitter<{ componentId: string; changes: any }>();

  form: FormGroup;
  collectionOptions: DataCollection[] = [];
  metricOptions: DataCollectionField[] = [];
  dimensionOptions: DataCollectionField[] = [];
  private readonly destroy$ = new Subject<void>();
  private patching = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: [''],
      subtitle: [''],
      dataSourceId: [''],
      collectionId: [''],
      metric: [''],
      dimension: [''],
      comparisonMetric: [''],
      backgroundColor: ['#ffffff'],
      accentColor: ['#2ec4b6'],
      textColor: ['#0d1b2a'],
      showBorder: [false],
      cornerRadius: [12],
    });

    this.form.valueChanges.pipe(debounceTime(150), takeUntil(this.destroy$)).subscribe(value => {
      if (!this.component || this.patching) {
        return;
      }

      this.updateComponent.emit({
        componentId: this.component.id,
        changes: {
          title: value.title,
          subtitle: value.subtitle,
          data: {
            dataSourceId: value.dataSourceId,
            collectionId: value.collectionId,
            metric: value.metric,
            dimension: value.dimension,
            comparisonMetric: value.comparisonMetric,
          },
          style: {
            backgroundColor: value.backgroundColor,
            accentColor: value.accentColor,
            textColor: value.textColor,
            showBorder: value.showBorder,
            cornerRadius: value.cornerRadius,
          },
        },
      });
    });

    this.form
      .get('dataSourceId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        if (this.patching) {
          return;
        }
        this.onDataSourceChanged(id);
      });

    this.form
      .get('collectionId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.patching) {
          return;
        }
        this.updateFieldOptions();
        this.ensureFieldSelection('metric', this.metricOptions);
        this.ensureFieldSelection('dimension', this.dimensionOptions);
        this.ensureFieldSelection('comparisonMetric', this.metricOptions, true);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component']) {
      this.patching = true;
      const current = changes['component'].currentValue as DashboardComponentModel | null;
      if (current) {
        this.form.enable({ emitEvent: false });
        this.form.patchValue(
          {
            title: current.title,
            subtitle: current.subtitle ?? '',
            dataSourceId: current.data.dataSourceId ?? '',
            collectionId: current.data.collectionId ?? '',
            metric: current.data.metric ?? '',
            dimension: current.data.dimension ?? '',
            comparisonMetric: current.data.comparisonMetric ?? '',
            backgroundColor: current.style.backgroundColor,
            accentColor: current.style.accentColor,
            textColor: current.style.textColor,
            showBorder: current.style.showBorder,
            cornerRadius: current.style.cornerRadius,
          },
          { emitEvent: false },
        );
      } else {
        this.form.reset({}, { emitEvent: false });
        this.form.disable({ emitEvent: false });
      }
      this.patching = false;

      this.refreshDataOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onDataSourceChanged(dataSourceId: string): void {
    const dataSource = this.findDataSource(dataSourceId);
    this.collectionOptions = dataSource?.collections ?? [];
    const fallback = dataSource?.defaultCollectionId ?? this.collectionOptions[0]?.id ?? '';

    this.patching = true;
    this.form.patchValue(
      {
        collectionId: fallback,
        metric: '',
        dimension: '',
        comparisonMetric: '',
      },
      { emitEvent: false },
    );
    this.patching = false;

    this.updateFieldOptions();
    this.ensureFieldSelection('metric', this.metricOptions);
    this.ensureFieldSelection('dimension', this.dimensionOptions);
    this.ensureFieldSelection('comparisonMetric', this.metricOptions, true);
  }

  private refreshDataOptions(): void {
    const dataSourceId = this.form.get('dataSourceId')?.value as string;
    const collectionId = this.form.get('collectionId')?.value as string;
    const dataSource = this.findDataSource(dataSourceId);

    this.collectionOptions = dataSource?.collections ?? [];

    if (dataSource) {
      const validCollection =
        this.collectionOptions.find(item => item.id === collectionId) ??
        (dataSource.defaultCollectionId
          ? this.collectionOptions.find(item => item.id === dataSource.defaultCollectionId)
          : this.collectionOptions[0]);

      if (validCollection && collectionId !== validCollection.id) {
        this.patching = true;
        this.form.patchValue({ collectionId: validCollection.id }, { emitEvent: false });
        this.patching = false;
      }
    } else {
      this.collectionOptions = [];
      if (collectionId) {
        this.patching = true;
        this.form.patchValue({ collectionId: '' }, { emitEvent: false });
        this.patching = false;
      }
    }

    this.updateFieldOptions();
    this.ensureFieldSelection('metric', this.metricOptions);
    this.ensureFieldSelection('dimension', this.dimensionOptions);
    this.ensureFieldSelection('comparisonMetric', this.metricOptions, true);
  }

  private updateFieldOptions(): void {
    const dataSourceId = this.form.get('dataSourceId')?.value as string;
    const collectionId = this.form.get('collectionId')?.value as string;
    const dataSource = this.findDataSource(dataSourceId);
    const collection = dataSource?.collections?.find(item => item.id === collectionId);

    this.metricOptions = collection
      ? collection.fields.filter(field => ['number', 'currency', 'percentage'].includes(field.type))
      : [];
    this.dimensionOptions = collection
      ? collection.fields.filter(field => field.type === 'string' || field.type === 'date')
      : [];
  }

  private ensureFieldSelection(
    controlName: 'metric' | 'dimension' | 'comparisonMetric',
    options: DataCollectionField[],
    allowEmpty = false,
  ): void {
    const control = this.form.get(controlName);
    if (!control) {
      return;
    }

    const value = control.value;
    if (!value) {
      return;
    }

    if (!options.some(option => option.id === value)) {
      this.patching = true;
      const fallback = allowEmpty ? '' : options[0]?.id ?? '';
      control.setValue(fallback, { emitEvent: false });
      this.patching = false;
    }
  }

  private findDataSource(id?: string): DataSource | undefined {
    if (!id) {
      return undefined;
    }

    return (this.dataSources ?? []).find(source => source.id === id);
  }
}
