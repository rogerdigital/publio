import { join } from 'node:path';

const DEFAULT_DATA_DIR = '.publio-data';

export function createLocalDataPath(fileName: string, dataDir = process.env.PUBLIO_DATA_DIR) {
  return join(dataDir ?? join(process.cwd(), DEFAULT_DATA_DIR), fileName);
}
