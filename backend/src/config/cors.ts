import cors from 'cors';
import { env } from './env';

export const corsMiddleware = cors({
  origin: [env.ADMIN_FRONTEND_URL, env.WATCHMAN_FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
