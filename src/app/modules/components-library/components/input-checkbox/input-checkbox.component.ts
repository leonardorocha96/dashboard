import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-input-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCheckboxComponent {
  control = new FormControl(false);

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}

  onChange(): void {
    this.ctx.trigger('onSelectionChange', this.control.value);
  }
}
