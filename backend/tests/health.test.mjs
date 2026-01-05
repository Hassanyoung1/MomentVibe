import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import dbClient from '../config/db.mjs';

describe('Health Check Tests', () => {
  it('should return health status endpoint', async () => {
    const expectedStatus = dbClient.isAlive() ? 200 : 503;
    const res = await request(app).get('/api/health').expect(expectedStatus);
    
    expect(res.body).to.have.property('status');
    expect(res.body).to.have.property('database');
    expect(res.body).to.have.property('message');
    
    if (dbClient.isAlive()) {
      expect(res.body.status).to.equal('healthy');
      expect(res.body.database).to.equal('connected');
      console.log('✓ Database is connected');
    } else {
      expect(res.body.status).to.equal('unhealthy');
      expect(res.body.database).to.equal('disconnected');
      console.log('⚠ Database is not connected - ensure MongoDB is running');
    }
  });
});

