import { z } from 'zod';

const password = z.string().min(8).regex(/[A-Za-z]/, 'Password must contain a letter').regex(/[0-9]/, 'Password must contain a number');
export const blockSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(80), code: z.string().trim().min(2).max(20).regex(/^[a-zA-Z0-9_-]+$/), displayOrder: z.coerce.number().int().min(0).optional() }), params: z.any(), query: z.any() });
export const updateBlockSchema = z.object({ body: blockSchema.shape.body.partial(), params: z.any(), query: z.any() });
export const credentialsSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/), password: password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' }), params: z.any(), query: z.any() });
export const resetPasswordSchema = z.object({ body: z.object({ password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' }), params: z.any(), query: z.any() });
export const statusSchema = z.object({ body: z.object({ isActive: z.boolean() }), params: z.any(), query: z.any() });
