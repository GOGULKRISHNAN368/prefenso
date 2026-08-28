import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { User } from '../src/modules/users/user.model';
import { Block } from '../src/modules/blocks/block.model';
import { Visitor } from '../src/modules/visitors/visitor.model';

const enabled = Boolean(process.env.TEST_MONGODB_URI);
const suite = enabled ? describe : describe.skip;

suite('MongoDB visitor workflows', () => {
  let adminToken = '';
  let block1Id = '';
  let block2Id = '';
  let block1Token = '';
  let block2Token = '';
  let block1VisitorId = '';
  let block2VisitorId = '';

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI!);
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Block.deleteMany({}), Visitor.deleteMany({})]);
    const admin = await User.create({ name: 'Test Administrator', username: 'admin-test', passwordHash: await bcrypt.hash('AdminPass123', 4), role: 'ADMIN', blockId: null, isActive: true });
    const [block1, block2] = await Block.create([{ name: 'Block 1', code: 'BLOCK-1', displayOrder: 1, createdBy: admin._id }, { name: 'Block 2', code: 'BLOCK-2', displayOrder: 2, createdBy: admin._id }]);
    block1Id = block1.id; block2Id = block2.id;
    const adminLogin = await request(app).post('/api/auth/admin/login').send({ username: 'admin-test', password: 'AdminPass123' });
    adminToken = adminLogin.body.data.accessToken;
    const credentials = async (id: string, username: string, name: string) => request(app).put(`/api/admin/blocks/${id}/credentials`).set('Authorization', `Bearer ${adminToken}`).send({ name, username, password: 'Watchman123', confirmPassword: 'Watchman123' });
    await credentials(block1Id, 'block1-test', 'Block 1 Security');
    await credentials(block2Id, 'block2-test', 'Block 2 Security');
    block1Token = (await request(app).post('/api/auth/watchman/login').send({ username: 'block1-test', password: 'Watchman123' })).body.data.accessToken;
    block2Token = (await request(app).post('/api/auth/watchman/login').send({ username: 'block2-test', password: 'Watchman123' })).body.data.accessToken;
  });

  afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  it('allows an admin to log in and rejects an invalid password', async () => {
    expect(adminToken).toBeTruthy();
    const response = await request(app).post('/api/auth/admin/login').send({ username: 'admin-test', password: 'wrong-password' });
    expect(response.status).toBe(401); expect(response.body.message).toBe('Invalid username or password');
  });

  it('allows an admin to create and update a block', async () => {
    const created = await request(app).post('/api/admin/blocks').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Block 3', code: 'BLOCK-3' });
    expect(created.status).toBe(201);
    const updated = await request(app).patch(`/api/admin/blocks/${created.body.data.id}`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Updated Block 3' });
    expect(updated.status).toBe(200); expect(updated.body.data.name).toBe('Updated Block 3');
  });

  it('configures Watchman credentials and allows the configured login', async () => {
    const response = await request(app).post('/api/auth/watchman/login').send({ username: 'block1-test', password: 'Watchman123' });
    expect(response.status).toBe(200); expect(response.body.data.user.blockId).toBe(block1Id);
  });

  it('rejects login for a deactivated block', async () => {
    await request(app).patch(`/api/admin/blocks/${block1Id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: false });
    const response = await request(app).post('/api/auth/watchman/login').send({ username: 'block1-test', password: 'Watchman123' });
    expect(response.status).toBe(401);
  });

  it('checks in a visitor using the authenticated Watchman block', async () => {
    await request(app).patch(`/api/admin/blocks/${block1Id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: true });
    block1Token = (await request(app).post('/api/auth/watchman/login').send({ username: 'block1-test', password: 'Watchman123' })).body.data.accessToken;
    const response = await request(app).post('/api/watchman/visitors/check-in').set('Authorization', `Bearer ${block1Token}`).send({ visitorName: 'Priya Menon', phoneNumber: '+919876543210', reasonForVisit: 'Meeting finance', personToMeet: 'Finance' });
    expect(response.status).toBe(201); expect(response.body.data.blockId).toBe(block1Id); block1VisitorId = response.body.data.id;
  });

  it('only returns visitors belonging to the authenticated block', async () => {
    const b1 = await request(app).post('/api/watchman/visitors/check-in').set('Authorization', `Bearer ${block1Token}`).send({ visitorName: 'Block One Visitor', phoneNumber: '9876543210', reasonForVisit: 'Delivery' });
    const b2 = await request(app).post('/api/watchman/visitors/check-in').set('Authorization', `Bearer ${block2Token}`).send({ visitorName: 'Block Two Visitor', phoneNumber: '9876543211', reasonForVisit: 'Meeting' });
    block1VisitorId = b1.body.data.id; block2VisitorId = b2.body.data.id;
    const own = await request(app).get('/api/watchman/visitors/history').set('Authorization', `Bearer ${block1Token}`);
    const foreign = await request(app).get(`/api/watchman/visitors/${block2VisitorId}`).set('Authorization', `Bearer ${block1Token}`);
    expect(own.body.data.every((visitor: { blockId: string }) => visitor.blockId === block1Id)).toBe(true); expect(foreign.status).toBe(404);
  });

  it('returns people inside with only INSIDE records', async () => {
    const response = await request(app).get('/api/watchman/visitors/inside').set('Authorization', `Bearer ${block1Token}`);
    expect(response.status).toBe(200); expect(response.body.data.every((visitor: { status: string }) => visitor.status === 'INSIDE')).toBe(true);
  });

  it('rejects checkout earlier than check-in and performs an atomic checkout', async () => {
    const early = await request(app).patch(`/api/watchman/visitors/${block1VisitorId}/check-out`).set('Authorization', `Bearer ${block1Token}`).send({ checkoutAt: '2000-01-01T00:00:00.000Z' });
    expect(early.status).toBe(422);
    const checkedOut = await request(app).patch(`/api/watchman/visitors/${block1VisitorId}/check-out`).set('Authorization', `Bearer ${block1Token}`).send({ checkoutAt: new Date().toISOString() });
    expect(checkedOut.status).toBe(200); expect(checkedOut.body.data.status).toBe('EXITED');
    const second = await request(app).patch(`/api/watchman/visitors/${block1VisitorId}/check-out`).set('Authorization', `Bearer ${block1Token}`).send({ checkoutAt: new Date().toISOString() });
    expect(second.status).toBe(409);
  });

  it('lets an admin view visitors across blocks', async () => {
    const response = await request(app).get('/api/admin/visitors').set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200); expect(response.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('applies day filtering in Asia/Kolkata and refresh restores a session', async () => {
    await Visitor.create({ visitorCode: 'V-DAY-TEST', visitorName: 'Timezone Visitor', phoneNumber: '9000000000', reasonForVisit: 'Timezone test', blockId: block1Id, checkInAt: new Date('2026-08-27T19:00:00.000Z'), checkOutAt: null, status: 'INSIDE', checkedInBy: (await User.findOne({ username: 'block1-test' }))!._id, checkedOutBy: null });
    const day = await request(app).get('/api/admin/visitors').query({ date: '2026-08-28' }).set('Authorization', `Bearer ${adminToken}`);
    expect(day.body.data.some((visitor: { visitorCode: string }) => visitor.visitorCode === 'V-DAY-TEST')).toBe(true);
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/admin/login').send({ username: 'admin-test', password: 'AdminPass123' });
    const refreshed = await agent.post('/api/auth/admin/refresh');
    expect(login.status).toBe(200); expect(refreshed.status).toBe(200); expect(refreshed.body.data.accessToken).toBeTruthy();
  });

  it('revokes active sessions after a password reset', async () => {
    const reset = await request(app).put(`/api/admin/blocks/${block2Id}/reset-password`).set('Authorization', `Bearer ${adminToken}`).send({ password: 'NewWatch123', confirmPassword: 'NewWatch123' });
    expect(reset.status).toBe(200);
    const oldSession = await request(app).get('/api/watchman/dashboard').set('Authorization', `Bearer ${block2Token}`);
    const newLogin = await request(app).post('/api/auth/watchman/login').send({ username: 'block2-test', password: 'NewWatch123' });
    expect(oldSession.status).toBe(401); expect(newLogin.status).toBe(200);
  });
});
