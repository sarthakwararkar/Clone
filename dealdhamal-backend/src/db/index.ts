import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let currentDbUrl: string | null = null;

export function createDb(databaseUrl: string) {
  if (dbInstance && currentDbUrl === databaseUrl) {
    return dbInstance;
  }
  const sql = neon(databaseUrl);
  dbInstance = drizzle(sql, { schema });
  currentDbUrl = databaseUrl;
  return dbInstance;
}

export type Database = ReturnType<typeof createDb>;
