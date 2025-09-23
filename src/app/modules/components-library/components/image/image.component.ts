import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { COMPONENT_CONTEXT, ComponentContext } from '../component-wrapper/component-wrapper.component';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  constructor(@Inject(COMPONENT_CONTEXT) public readonly ctx: ComponentContext) {}

  get src(): string {
    return (this.ctx.component.metadata?.src as string) ?? 'assets/examples/placeholder.svg';
  }
}
