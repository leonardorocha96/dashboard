import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBinding, FilterDefinition, GlobalFilterState } from '../models/filter-config.model';

export interface FilterApplyEvent {
  filters: GlobalFilterState[];
  hash: string;
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly definitions$ = new BehaviorSubject<FilterDefinition[]>([]);
  private readonly states$ = new BehaviorSubject<GlobalFilterState[]>([]);
  private readonly apply$ = new Subject<FilterApplyEvent>();

  readonly globalFilters$ = this.states$.asObservable();
  readonly applyEvents$ = this.apply$.asObservable();

  registerDefinitions(definitions: FilterDefinition[]): void {
    this.definitions$.next(definitions);
    const current = this.states$.value;
    const nextStates = definitions.map((definition) => {
      const existing = current.find((state) => state.definition.id === definition.id);
      return existing ?? { definition, value: null };
    });
    this.states$.next(nextStates);
  }

  updateValue(filterId: string, value: unknown): void {
    const next = this.states$.value.map((state) =>
      state.definition.id === filterId ? { ...state, value } : state
    );
    this.states$.next(next);
  }

  getFilterBindings(bindings: FilterBinding[]): Record<string, unknown> {
    const entries = bindings.map((binding) => {
      const state = this.states$.value.find((item) => item.definition.id === binding.filterId);
      return [binding.field ?? binding.filterId, state?.value ?? null];
    });
    return Object.fromEntries(entries);
  }

  apply(waitForSelection: boolean = false): void {
    const states = this.states$.value;
    if (waitForSelection && states.some((state) => state.definition.waitForApply && !state.value)) {
      return;
    }
    const hash = this.computeHash(states);
    this.apply$.next({ filters: states, hash });
  }

  filtersHash$(): Observable<string> {
    return this.globalFilters$.pipe(map((states) => this.computeHash(states)));
  }

  private computeHash(states: GlobalFilterState[]): string {
    const payload = states.map((state) => ({
      id: state.definition.id,
      value: state.value,
    }));
    return btoa(JSON.stringify(payload));
  }
}
