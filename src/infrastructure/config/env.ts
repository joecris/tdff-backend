import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // 'dev': unverified x-user-id header lookup (see dev-auth-verifier.ts).
  // 'auth0': real JWT verification — not implemented yet, reserved so
  // switching later is an env change, not a code change at call sites.
  AUTH_MODE: z.enum(['dev', 'auth0']).default('dev'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
