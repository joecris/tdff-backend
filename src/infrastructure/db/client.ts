import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/env';
import * as schema from './schema';

export const pool = new Pool({ connectionString: env.DATABASE_URL });

/**
 * The one and only place `drizzle-orm` is imported by name across the app
 * (outside of the schema/migrations themselves). Outbound persistence
 * adapters depend on this — the domain and application layers never see it.
 */
export const db = drizzle(pool, { schema });

export async function closeDb(): Promise<void> {
  await pool.end();
}
