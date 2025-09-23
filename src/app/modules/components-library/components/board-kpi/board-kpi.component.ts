import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-board-kpi',
  templateUrl: './board-kpi.component.html',
  styleUrls: ['./board-kpi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardKpiComponent {
  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}

  get primaryValue(): number {
    const record = (this.ctx.data.data?.[0] as Record<string, number>) ?? {};
    return record['Valor'] ?? record['value'] ?? 0;
  }

  get variation(): number {
    const record = (this.ctx.data.data?.[0] as Record<string, number>) ?? {};
    return record['Variação'] ?? record['variation'] ?? 0;
  }

  get target(): number {
    const record = (this.ctx.data.data?.[0] as Record<string, number>) ?? {};
    return record['Meta'] ?? record['target'] ?? 0;
  }

  triggerDetails(): void {
    this.ctx.trigger('onClick', this.ctx.data.data?.[0]);
  }
}
