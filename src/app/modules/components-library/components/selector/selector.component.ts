import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-advanced-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSelectorComponent {
  control = new FormControl('');
  options$: Observable<string[]> = of([]);

  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {
    this.options$ = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      switchMap((term) => this.fetch(term ?? ''))
    );
    this.control.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.ctx.trigger('onSelectionChange', value);
    });
  }

  private fetch(term: string): Observable<string[]> {
    const baseOptions = (this.ctx.component.metadata?.options as string[]) ?? [
      'Vendedor 1',
      'Vendedor 2',
      'Vendedor 3',
    ];
    return of(
      baseOptions.filter((option) => option.toLowerCase().includes(term.toLowerCase()))
    );
  }
}
