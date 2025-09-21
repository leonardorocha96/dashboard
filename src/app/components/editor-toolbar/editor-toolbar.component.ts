import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DeviceMode } from '../../models/dashboard.models';

interface DeviceOption {
  id: DeviceMode;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss'],
})
export class EditorToolbarComponent {
  @Input() viewMode: DeviceMode = 'desktop';

  @Output() deviceModeChange = new EventEmitter<DeviceMode>();
  @Output() createPage = new EventEmitter<void>();
  @Output() openDataSources = new EventEmitter<void>();

  readonly deviceOptions: DeviceOption[] = [
    { id: 'desktop', icon: 'desktop_windows', label: 'Desktop' },
    { id: 'tablet', icon: 'tablet', label: 'Tablet' },
    { id: 'mobile', icon: 'phone_iphone', label: 'Mobile' },
  ];

  onSelectMode(option: DeviceOption): void {
    if (option.id !== this.viewMode) {
      this.deviceModeChange.emit(option.id);
    }
  }
}
