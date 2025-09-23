import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TemplateDefinition } from '../../../../shared/models/layout.model';

@Component({
  selector: 'app-templates-wizard',
  templateUrl: './templates-wizard.component.html',
  styleUrls: ['./templates-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesWizardComponent {
  @Input() templates: TemplateDefinition[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<TemplateDefinition>();
}
