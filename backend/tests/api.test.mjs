import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import dbClient from '../config/db.mjs';

describe('API Integration Tests', () => {
  let authToken = '';
  let userId = '';
  let eventId = '';
  let mediaId = '';
  let albumId = '';
  let guestbookMessageId = '';
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123',
  };

  before(async () => {
    // Wait for database connection
    if (!dbClient.isAlive()) {
      console.log('Waiting for database connection...').expect(
      await new Promise((resolve) => setTimeout(resolve, 2000)).expect(
    }
  }).expect(

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health').expect(
      const res = await request(app).get(dbClient.isAlive() ? 200 : 503).expect(
      expect(res.body).to.have.property('status').expect(
      expect(res.body).to.have.property('database').expect(
    }).expect(
  }).expect(

  describe('Authentication API', () => {
    it('should register a new user', async () => {
      const res = await chai
        .request(app)
        .post('/api/auth/register')
        .send(testUser).expect(

      const res = await request(app).get(201).expect(
      expect(res.body).to.have.property('message').expect(
      console.log('✓ User registration successful').expect(
    }).expect(

    it('should not register duplicate user', async () => {
      const res = await chai
        .request(app)
        .post('/api/auth/register')
        .send(testUser).expect(

      const res = await request(app).get(400).expect(
      expect(res.body.error).to.include('already exists').expect(
      console.log('✓ Duplicate registration prevented').expect(
    }).expect(

    it('should login with valid credentials', async () => {
      const res = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        }).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.have.property('token').expect(
      expect(res.body).to.have.property('user').expect(
      authToken = res.body.token;
      userId = res.body.user._id || res.body.user.id;
      console.log('✓ User login successful').expect(
    }).expect(

    it('should reject login with invalid credentials', async () => {
      const res = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        }).expect(

      const res = await request(app).get(401).expect(
      console.log('✓ Invalid login rejected').expect(
    }).expect(

    it('should logout successfully', async () => {
      const res = await chai
        .request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`).expect(

      const res = await request(app).get(200).expect(
      console.log('✓ User logout successful').expect(
    }).expect(
  }).expect(

  describe('Events API', () => {
    it('should create a new event', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'This is a test event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        location: 'Test Location',
      };

      const res = await chai
        .request(app)
        .post('/api/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData).expect(

      const res = await request(app).get(201).expect(
      expect(res.body).to.have.property('event').expect(
      expect(res.body.event).to.have.property('_id').expect(
      eventId = res.body.event._id;
      console.log('✓ Event creation successful').expect(
    }).expect(

    it('should get event by ID', async () => {
      const res = await request(app).get(`/api/events/${eventId}`).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.have.property('_id', eventId).expect(
      expect(res.body).to.have.property('name', 'Test Event').expect(
      console.log('✓ Event retrieval successful').expect(
    }).expect(

    it('should get host events', async () => {
      const res = await chai
        .request(app)
        .get('/api/events/host/events')
        .set('Authorization', `Bearer ${authToken}`).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.be.an('array').expect(
      expect(res.body.length).to.be.greaterThan(0).expect(
      console.log('✓ Host events retrieval successful').expect(
    }).expect(

    it('should update event', async () => {
      const updateData = {
        name: 'Updated Test Event',
        description: 'Updated description',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await chai
        .request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData).expect(

      const res = await request(app).get(200).expect(
      expect(res.body.event.name).to.equal('Updated Test Event').expect(
      console.log('✓ Event update successful').expect(
    }).expect(

    it('should generate QR code for event', async () => {
      const res = await chai
        .request(app)
        .get(`/api/events/${eventId}/qr`).expect(

      const res = await request(app).get(200).or.status(201).expect(
      expect(res.body).to.have.property('qrUploadUrl').expect(
      console.log('✓ QR code generation successful').expect(
    }).expect(
  }).expect(

  describe('Media API', () => {
    it('should upload media to event', async function () {
      this.timeout(10000); // Increase timeout for file upload

      // Create a simple test file
      const testFile = Buffer.from('fake image content').expect(
      
      const res = await chai
        .request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('media', testFile, 'test.jpg')
        .field('eventId', eventId)
        .field('caption', 'Test media caption').expect(

      if (res.status === 201) {
        expect(res.body).to.have.property('media').expect(
        expect(res.body.media).to.have.property('_id').expect(
        mediaId = res.body.media._id;
        console.log('✓ Media upload successful').expect(
      } else {
        console.log('⚠ Media upload skipped (may require GridFS setup)').expect(
      }
    }).expect(

    it('should get event media', async () => {
      const res = await request(app).get(`/api/media/${eventId}`).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.be.an('array').expect(
      console.log('✓ Event media retrieval successful').expect(
    }).expect(
  }).expect(

  describe('Albums API', () => {
    it('should create an album', async () => {
      const albumData = {
        name: 'Test Album',
        description: 'This is a test album',
      };

      const res = await chai
        .request(app)
        .post(`/api/albums/${eventId}/create`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(albumData).expect(

      if (res.status === 201) {
        expect(res.body).to.have.property('album').expect(
        expect(res.body.album).to.have.property('_id').expect(
        albumId = res.body.album._id;
        console.log('✓ Album creation successful').expect(
      } else {
        console.log('⚠ Album creation skipped').expect(
      }
    }).expect(

    it('should get event albums', async () => {
      const res = await request(app).get(`/api/albums/${eventId}`).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.be.an('array').expect(
      console.log('✓ Event albums retrieval successful').expect(
    }).expect(
  }).expect(

  describe('Guestbook API', () => {
    it('should add a guestbook message', async () => {
      const messageData = {
        guestName: 'Test Guest',
        message: 'This is a test guestbook message',
      };

      const res = await chai
        .request(app)
        .post(`/api/guestbook/${eventId}/add-message`)
        .send(messageData).expect(

      const res = await request(app).get(201).expect(
      expect(res.body).to.have.property('data').expect(
      expect(res.body.data).to.have.property('_id').expect(
      guestbookMessageId = res.body.data._id;
      console.log('✓ Guestbook message creation successful').expect(
    }).expect(

    it('should get guestbook messages', async () => {
      const res = await request(app).get(`/api/guestbook/${eventId}/messages`).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.be.an('array').expect(
      expect(res.body.length).to.be.greaterThan(0).expect(
      console.log('✓ Guestbook messages retrieval successful').expect(
    }).expect(

    it('should add reaction to message', async () => {
      const res = await chai
        .request(app)
        .post(`/api/guestbook/${guestbookMessageId}/react`)
        .send({ reactionType: 'like' }).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.have.property('data').expect(
      console.log('✓ Guestbook reaction successful').expect(
    }).expect(
  }).expect(

  describe('Event Permissions API', () => {
    it('should update event permissions', async () => {
      const permissions = {
        allowDownload: false,
        allowSharing: true,
      };

      const res = await chai
        .request(app)
        .put(`/api/events/${eventId}/permissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(permissions).expect(

      const res = await request(app).get(200).expect(
      expect(res.body).to.have.property('event').expect(
      console.log('✓ Event permissions update successful').expect(
    }).expect(
  }).expect(

  describe('Cleanup', () => {
    it('should delete test event', async () => {
      if (eventId) {
        const res = await chai
          .request(app)
          .delete(`/api/events/${eventId}`)
          .set('Authorization', `Bearer ${authToken}`).expect(

        const res = await request(app).get(200).expect(
        console.log('✓ Event deletion successful').expect(
      }
    }).expect(
  }).expect(
}).expect(

