import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_MOCK_JWT_SECRET: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SENTRY_DSN: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  ENVIRONMENT: z.enum(['development', 'production', 'staging']).default('development'),
  VCOMMISSION_API_KEY: z.string().optional(),
  CUELINKS_API_KEY: z.string().optional(),
  ADMITAD_CLIENT_ID: z.string().optional(),
  ADMITAD_CLIENT_SECRET: z.string().optional(),
  CJ_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export interface CloudflareBindings extends Env {}

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
