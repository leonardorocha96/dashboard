import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent {
  control = new FormControl<number | null>(null);

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {
    this.control.valueChanges.pipe(debounceTime(150)).subscribe((value) => {
      this.ctx.trigger('onSelectionChange', value);
    });
  }
}
