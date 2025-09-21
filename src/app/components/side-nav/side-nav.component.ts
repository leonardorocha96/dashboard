import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SideNavItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent {
  @Input() items: SideNavItem[] = [];
  @Input() activeItemId: string | null = null;

  @Output() itemSelected = new EventEmitter<string>();

  onSelect(item: SideNavItem): void {
    this.itemSelected.emit(item.id);
  }
}
