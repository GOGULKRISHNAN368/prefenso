import { z } from 'zod';

export const loginSchema = z.object({ body: z.object({ username: z.string().trim().min(1).max(120), password: z.string().min(1).max(200) }), params: z.any(), query: z.any() });
export const emptySchema = z.object({ body: z.any(), params: z.any(), query: z.any() });
