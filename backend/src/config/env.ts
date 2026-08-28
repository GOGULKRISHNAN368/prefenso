import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/visitor_management'),
  JWT_ACCESS_SECRET: z.string().min(16).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development-refresh-secret-change-me'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  ADMIN_FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  WATCHMAN_FRONTEND_URL: z.string().url().default('http://localhost:5174'),
  COMPANY_TIMEZONE: z.string().default('Asia/Kolkata'),
  INITIAL_ADMIN_NAME: z.string().default('System Administrator'),
  INITIAL_ADMIN_USERNAME: z.string().min(1).default('admin'),
  INITIAL_ADMIN_PASSWORD: z.string().min(8).default('change-this-before-seeding')
});

const parsedEnv = envSchema.parse(process.env);
if (parsedEnv.NODE_ENV === 'production') {
  const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_FRONTEND_URL', 'WATCHMAN_FRONTEND_URL'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
}
export const env = parsedEnv;
