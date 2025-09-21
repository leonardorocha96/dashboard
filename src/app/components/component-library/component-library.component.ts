import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ComponentTemplate, ComponentCategory } from '../../models/dashboard.models';

@Component({
  selector: 'app-component-library',
  templateUrl: './component-library.component.html',
  styleUrls: ['./component-library.component.scss'],
})
export class ComponentLibraryComponent {
  @Input() components: ComponentTemplate[] = [];

  @Output() addComponent = new EventEmitter<ComponentTemplate>();

  searchTerm = '';
  activeCategory: ComponentCategory | 'todos' = 'indicadores';

  get categories(): (ComponentCategory | 'todos')[] {
    const base: ComponentCategory[] = Array.from(new Set(this.components.map(item => item.category)));
    return ['todos', ...base];
  }

  get filteredComponents(): ComponentTemplate[] {
    return this.components
      .filter(item => this.activeCategory === 'todos' || item.category === this.activeCategory)
      .filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
  }

  onSelectCategory(category: ComponentCategory | 'todos'): void {
    this.activeCategory = category;
  }

  onAddComponent(component: ComponentTemplate): void {
    this.addComponent.emit(component);
  }
}
