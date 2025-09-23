import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterService } from '../../../../shared/services/filter.service';
import { GlobalFilterState } from '../../../../shared/models/filter-config.model';

@Component({
  selector: 'app-global-filter-bar',
  templateUrl: './global-filter-bar.component.html',
  styleUrls: ['./global-filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalFilterBarComponent {
  filters$: Observable<GlobalFilterState[]> = this.filterService.globalFilters$;

  constructor(private readonly filterService: FilterService) {}

  update(filter: GlobalFilterState, value: unknown): void {
    this.filterService.updateValue(filter.definition.id, value);
  }

  apply(): void {
    this.filterService.apply(true);
  }
}
