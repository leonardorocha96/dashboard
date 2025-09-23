import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}
}
