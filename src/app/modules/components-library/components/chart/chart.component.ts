import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexFill,
  ApexTooltip,
} from 'ng-apexcharts';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  fill: ApexFill;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit {
  chartOptions!: Partial<ChartOptions>;

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}

  ngOnInit(): void {
    const data = this.ctx.data.data ?? [];
    const fields = this.ctx.data.fields ?? Object.keys(data[0] ?? {});
    const dimensions = fields.slice(0, 1);
    const measures = fields.slice(1);

    const categories = data.map((item) => String(item[dimensions[0]] ?? 'Categoria'));
    const series = measures.map((measure) => ({
      name: measure,
      data: data.map((item) => Number(item[measure] ?? 0)),
    }));

    this.chartOptions = {
      chart: {
        type: (this.ctx.component.metadata?.chartType as ApexChart['type']) ?? 'line',
        height: '100%'
      },
      series,
      xaxis: { categories },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      legend: { position: 'bottom' },
      fill: { opacity: 0.85 },
      tooltip: { shared: true, intersect: false },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: { position: 'top' },
          },
        },
      ],
    };
  }

  onPointClick(index: number): void {
    const payload = this.ctx.data.data?.[index];
    this.ctx.trigger('onClick', payload);
  }
}
