import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { ComponentDefinition } from '../../../../shared/models/component-registry.model';
import { ComponentTrigger } from '../../../../shared/models/action-config.model';
import { ViewDataResponse } from '../../../../shared/models/view-config.model';
import { ComponentRegistryService } from '../../component-registry.service';
import { ViewService } from '../../../../shared/services/view.service';
import { FilterService } from '../../../../shared/services/filter.service';
import { ActionService } from '../../../../shared/services/action.service';
import { Injector as AngularInjector, InjectionToken } from '@angular/core';

export interface ComponentContext {
  component: ComponentInstance;
  data: ViewDataResponse;
  trigger: (trigger: ComponentTrigger, payload?: unknown) => void;
}

export const COMPONENT_CONTEXT = new InjectionToken<ComponentContext>('COMPONENT_CONTEXT');

@Component({
  selector: 'app-component-wrapper',
  template: `
    <ng-container *ngIf="definition">
      <ng-container
        *ngComponentOutlet="definition?.component as componentType; injector: componentInjector"
      ></ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentWrapperComponent implements OnChanges, OnDestroy {
  @Input() component!: ComponentInstance;

  definition: ComponentDefinition | null = null;
  componentInjector: AngularInjector = this.injector;

  private readonly data$ = new BehaviorSubject<ViewDataResponse>({ data: [] });
  private subscriptions = new Subscription();

  constructor(
    private readonly registry: ComponentRegistryService,
    private readonly viewService: ViewService,
    private readonly filterService: FilterService,
    private readonly actionService: ActionService,
    private readonly injector: AngularInjector
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component'] && this.component) {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
      this.definition = this.registry.getDefinition(this.component.componentType) ?? null;
      this.loadData();
      this.subscriptions.add(
        this.filterService.applyEvents$.subscribe(() => this.loadData())
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    if (!this.component?.view) {
      this.data$.next({ data: [] });
      this.updateInjector();
      return;
    }
    this.viewService
      .getData(this.component.id, this.component.view, this.component.filters ?? [])
      .subscribe((response) => {
        this.data$.next(response);
        this.updateInjector();
      });
  }

  private updateInjector(): void {
    this.componentInjector = AngularInjector.create({
      providers: [
        {
          provide: COMPONENT_CONTEXT,
          useValue: {
            component: this.component,
            data: this.data$.value,
            trigger: (trigger: ComponentTrigger, payload?: unknown) =>
              this.handleTrigger(trigger, payload),
          },
        },
      ],
      parent: this.injector,
    });
  }

  private handleTrigger(trigger: ComponentTrigger, payload?: unknown): void {
    const actions = this.component.actions?.filter((action) => action.trigger === trigger) ?? [];
    actions.forEach((action) =>
      this.actionService
        .execute(action, { componentId: this.component.id, trigger, data: payload })
        .subscribe()
    );
  }
}
