import { Component, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import { DashboardComponentModel, DataSource } from '../../models/dashboard.models';

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
  private readonly destroy$ = new Subject<void>();
  private patching = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: [''],
      subtitle: [''],
      dataSourceId: [''],
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
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
