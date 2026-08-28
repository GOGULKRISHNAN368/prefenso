import { z } from 'zod';

export const checkInSchema = z.object({ body: z.object({ visitorName: z.string().trim().min(2).max(120), phoneNumber: z.string().trim().min(7).max(20).regex(/^[+\d][\d\s()-]{6,19}$/), reasonForVisit: z.string().trim().min(2).max(300), personToMeet: z.string().trim().max(120).optional(), notes: z.string().trim().max(500).optional() }), params: z.any(), query: z.any() });
export const checkoutSchema = z.object({ body: z.object({ checkoutAt: z.string().datetime().optional() }), params: z.any(), query: z.any() });
