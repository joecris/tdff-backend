import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    // 'dev': unverified x-user-id header lookup (see dev-auth-verifier.ts).
    // 'auth0': real JWT verification against Auth0's JWKS (see
    // auth0-jwt-verifier.ts) — requires AUTH0_DOMAIN/AUTH0_AUDIENCE below.
    AUTH_MODE: z.enum(['dev', 'auth0']).default('dev'),
    // Only required when AUTH_MODE=auth0 — enforced by the .refine() below
    // rather than .notEmpty() here, since dev mode never reads either.
    AUTH0_DOMAIN: z.string().min(1).optional(),
    AUTH0_AUDIENCE: z.string().min(1).optional(),
  })
  .refine((data) => data.AUTH_MODE !== 'auth0' || data.AUTH0_DOMAIN !== undefined, {
    message: 'AUTH0_DOMAIN is required when AUTH_MODE=auth0',
    path: ['AUTH0_DOMAIN'],
  })
  .refine((data) => data.AUTH_MODE !== 'auth0' || data.AUTH0_AUDIENCE !== undefined, {
    message: 'AUTH0_AUDIENCE is required when AUTH_MODE=auth0',
    path: ['AUTH0_AUDIENCE'],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
