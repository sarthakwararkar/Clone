import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string().min(1),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SENTRY_DSN: z.string().url(),
  R2_PUBLIC_URL: z.string().url(),
  ENVIRONMENT: z.enum(['development', 'production', 'staging']).default('development'),
  VCOMMISSION_API_KEY: z.string().optional(),
  ADMITAD_CLIENT_ID: z.string().optional(),
  ADMITAD_CLIENT_SECRET: z.string().optional(),
  CJ_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export interface CloudflareBindings extends Env {
  R2_BUCKET: R2Bucket;
}

export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );
    throw new Error(`Invalid environment variables:\n${errors.join('\n')}`);
  }
  return result.data;
}
