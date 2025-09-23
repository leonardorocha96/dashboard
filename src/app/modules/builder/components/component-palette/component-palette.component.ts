import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentDefinition } from '../../../../shared/models/component-registry.model';
import { ComponentRegistryService } from '../../../components-library/component-registry.service';

@Component({
  selector: 'app-component-palette',
  templateUrl: './component-palette.component.html',
  styleUrls: ['./component-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentPaletteComponent {
  components: ComponentDefinition[] = this.registry.getDefinitions();

  constructor(private readonly registry: ComponentRegistryService) {}
}
