import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import dbClient from '../config/db.mjs';

describe('API Integration Tests', () => {
  let authToken = '';
  let userId = '';
  let eventId = '';

  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123',
  };

  before(async () => {
    if (!dbClient.isAlive()) {
      console.log('Waiting for database connection...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const expectedStatus = dbClient.isAlive() ? 200 : 503;
      const res = await request(app).get('/api/health').expect(expectedStatus);
      
      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('database');
      console.log('✓ Health check passed');
    });
  });

  describe('Authentication API', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).to.have.property('message');
      console.log('✓ User registration successful');
    });

    it('should not register duplicate user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.error).to.include('already exists');
      console.log('✓ Duplicate registration prevented');
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      authToken = res.body.token;
      userId = res.body.user._id || res.body.user.id;
      console.log('✓ User login successful');
    });

    it('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401);
      console.log('✓ Invalid login rejected');
    });
  });

  describe('Events API', () => {
    it('should create a new event', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'This is a test event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(res.body).to.have.property('event');
      expect(res.body.event).to.have.property('_id');
      eventId = res.body.event._id;
      console.log('✓ Event creation successful');
    });

    it('should get event by ID', async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(res.body).to.have.property('_id', eventId);
      console.log('✓ Event retrieval successful');
    });

    it('should get host events', async () => {
      const res = await request(app)
        .get('/api/events/host/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
      console.log('✓ Host events retrieval successful');
    });
  });

  describe('Cleanup', () => {
    it('should delete test event', async () => {
      if (eventId) {
        await request(app)
          .delete(`/api/events/${eventId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        console.log('✓ Event deletion successful');
      }
    });
  });
});

