import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent {
  control = new FormControl('');

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {
    this.control.valueChanges.pipe(debounceTime(200)).subscribe((value) => {
      this.ctx.trigger('onSelectionChange', value);
    });
  }
}
