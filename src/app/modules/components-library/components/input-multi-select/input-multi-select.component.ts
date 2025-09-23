import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-input-multi-select',
  templateUrl: './input-multi-select.component.html',
  styleUrls: ['./input-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMultiSelectComponent {
  control = new FormControl<string[]>([]);

  options = (this.ctx.component.metadata?.options as string[]) ?? ['Opção A', 'Opção B', 'Opção C'];

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {
    this.control.valueChanges.pipe(debounceTime(200)).subscribe((value) => {
      this.ctx.trigger('onSelectionChange', value ?? []);
    });
  }
}
