import { PageLayout, PageSettings } from './layout.model';

export interface Page {
  id: string;
  name: string;
  description?: string;
  layout: PageLayout;
  settings: PageSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
