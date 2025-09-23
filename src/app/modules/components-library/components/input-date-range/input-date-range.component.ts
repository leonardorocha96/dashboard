import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-input-date-range',
  templateUrl: './input-date-range.component.html',
  styleUrls: ['./input-date-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDateRangeComponent {
  form = this.fb.group({
    start: [''],
    end: [''],
  });

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext, private readonly fb: FormBuilder) {
    this.form.valueChanges.pipe(debounceTime(200)).subscribe((value) => {
      this.ctx.trigger('onSelectionChange', value);
    });
  }
}
