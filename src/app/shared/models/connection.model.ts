export type ConnectionType = 'postgres' | 'rest' | 'csv';

export interface ConnectionConfig {
  id: string;
  name: string;
  type: ConnectionType;
  options: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
