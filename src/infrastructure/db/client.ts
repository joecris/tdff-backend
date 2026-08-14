import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/env';
import * as schema from './schema';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Capped low in production (Vercel serverless): many concurrent function
  // instances can each spin up their own pool, and the external pooler
  // (Supabase's Supavisor, transaction mode) is what actually absorbs that
  // fan-in — not this in-process pool. A large `max` here would just
  // multiply connections against Supavisor's own upstream limit instead
  // of helping. Local dev/test run against a single long-lived process,
  // where the default-sized pool is fine.
  max: env.NODE_ENV === 'production' ? 3 : 10,
});

/**
 * The one and only place `drizzle-orm` is imported by name across the app
 * (outside of the schema/migrations themselves). Outbound persistence
 * adapters depend on this — the domain and application layers never see it.
 */
export const db = drizzle(pool, { schema });

export async function closeDb(): Promise<void> {
  await pool.end();
}
