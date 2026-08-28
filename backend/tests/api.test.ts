import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Visitor Management API', () => {
  it('returns a healthy response', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'API is healthy' });
  });
  it('does not expose protected data without authentication', async () => {
    const response = await request(app).get('/api/admin/visitors');
    expect(response.status).toBe(401);
  });
});
