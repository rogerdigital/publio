export interface Migration {
  version: number;
  name: string;
  up: (dataDir: string) => void;
}

export interface SchemaVersion {
  version: number;
  migratedAt: string;
}
