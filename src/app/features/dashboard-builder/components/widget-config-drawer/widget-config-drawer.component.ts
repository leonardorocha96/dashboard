import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DashboardWidget } from '../../models/widget.model';
import { WidgetDataSet } from '../../services/data.service';

interface WidgetFormModel {
  title: FormControl<string>;
  dataKey: FormControl<string>;
  showLegend: FormControl<boolean>;
  paletteIndex: FormControl<number>;
  seriesColor: FormControl<string>;
}

@Component({
  selector: 'app-widget-config-drawer',
  templateUrl: './widget-config-drawer.component.html',
  styleUrls: ['./widget-config-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetConfigDrawerComponent implements OnChanges {
  @Input() widget: DashboardWidget | null = null;
  @Input() dataSets: WidgetDataSet[] = [];
  @Input() colorPalettes: string[][] = [];
  @Input() seriesColors: string[] = [];
  @Input() open = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Partial<DashboardWidget>>();

  readonly form: FormGroup<WidgetFormModel>;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group<WidgetFormModel>({
      title: this.fb.nonNullable.control('', { validators: [Validators.required] }),
      dataKey: this.fb.nonNullable.control(''),
      showLegend: this.fb.nonNullable.control(true),
      paletteIndex: this.fb.nonNullable.control(0),
      seriesColor: this.fb.nonNullable.control(''),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget'] && this.widget) {
      const paletteIndex = this.findPaletteIndex(this.widget.settings.palette);
      this.form.reset({
        title: this.widget.title,
        dataKey: this.widget.dataKey,
        showLegend: this.widget.settings.showLegend,
        paletteIndex,
        seriesColor: this.widget.settings.seriesColor,
      });
    }
  }

  get isCircular(): boolean {
    return this.widget?.type === 'pie' || this.widget?.type === 'doughnut';
  }

  get paletteOptions(): string[][] {
    return this.colorPalettes.length ? this.colorPalettes : [[]];
  }

  onSelectPalette(index: number): void {
    this.form.controls.paletteIndex.setValue(index);
  }

  onSelectColor(color: string): void {
    this.form.controls.seriesColor.setValue(color);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (!this.widget || this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const palette = this.paletteOptions[value.paletteIndex] ?? this.widget.settings.palette;

    this.submit.emit({
      title: value.title,
      dataKey: value.dataKey,
      settings: {
        ...this.widget.settings,
        showLegend: value.showLegend,
        palette,
        seriesColor: value.seriesColor || this.widget.settings.seriesColor,
      },
    });
  }

  trackPalette(_: number, palette: string[]): string {
    return palette.join('-');
  }

  private findPaletteIndex(palette: string[]): number {
    return Math.max(
      this.paletteOptions.findIndex((candidate) => candidate?.join('|') === palette?.join('|')),
      0,
    );
  }
}
