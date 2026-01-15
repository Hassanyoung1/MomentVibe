# API Testing Guide

This guide explains how to test the MomentVibe backend API to ensure all endpoints are working correctly.

## Prerequisites

1. **MongoDB must be running**
   ```bash
   sudo systemctl start mongod
   # Or check: sudo systemctl status mongod
   ```

2. **Redis must be running** (optional but recommended)
   ```bash
   sudo systemctl start redis
   ```

3. **Backend dependencies installed**
   ```bash
   cd backend
   npm install
   ```

## Running Tests

### Quick Health Check

Test if the server and database are properly connected:

```bash
cd backend
npm run test:health
```

This will:
- Check if the `/api/health` endpoint is working
- Verify database connection status
- Return quickly (5 second timeout)

### Full API Integration Tests

Run comprehensive API tests for all endpoints:

```bash
cd backend
npm run test:api
```

This will test:
- ✅ Health check endpoint
- ✅ User registration and login
- ✅ Event creation, retrieval, update
- ✅ Media upload and retrieval
- ✅ Album creation and management
- ✅ Guestbook messages and reactions
- ✅ Event permissions
- ✅ QR code generation

**Note:** This test suite creates real data in your database (with test users/events) and cleans up afterward.

### Run All Tests

Run all test files:

```bash
cd backend
npm test
```

### Using the Test Script

For convenience, use the automated test script:

```bash
cd backend
./scripts/test-api.sh
```

This script will:
1. Check if the server is running
2. Start it in the background if needed
3. Run all tests
4. Provide a summary
5. Clean up background processes

## Manual API Testing

### Using cURL

#### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response (if MongoDB is connected):
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Server is running and database is connected"
}
```

#### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

#### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Save the token from the response, then use it:

#### Create Event
```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Event",
    "description": "This is a test event",
    "date": "2024-12-31T00:00:00.000Z"
  }'
```

#### Get Events
```bash
curl http://localhost:5000/api/events/host/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the collection from `backend/postman-collection.json` (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically after login)
3. Run the collection

### Using HTTPie

```bash
# Install: sudo apt install httpie

# Health check
http GET http://localhost:5000/api/health

# Register
http POST http://localhost:5000/api/auth/register \
  name="Test User" \
  email="test@example.com" \
  password="TestPassword123"

# Login
http POST http://localhost:5000/api/auth/login \
  email="test@example.com" \
  password="TestPassword123"
```

## Test Coverage

The test suite covers:

### Authentication
- ✅ User registration
- ✅ User login
- ✅ User logout
- ✅ Duplicate registration prevention
- ✅ Invalid credentials rejection

### Events
- ✅ Event creation
- ✅ Event retrieval by ID
- ✅ Host events listing
- ✅ Event update
- ✅ Event deletion
- ✅ QR code generation

### Media
- ✅ Media upload
- ✅ Event media retrieval
- ✅ Media approval (host only)
- ✅ Media download

### Albums
- ✅ Album creation
- ✅ Album listing
- ✅ Album update
- ✅ Album deletion

### Guestbook
- ✅ Message creation
- ✅ Message retrieval
- ✅ Reaction addition

### Permissions
- ✅ Permission updates
- ✅ Download permission control

## Troubleshooting

### Tests fail with "Database not connected"

**Solution:** Start MongoDB
```bash
sudo systemctl start mongod
```

Verify connection:
```bash
npm run test:health
```

### Tests fail with timeout

**Solution:** 
1. Ensure the backend server is running
2. Check if port 5000 is available
3. Increase timeout in test files if needed

### Tests create duplicate data

The tests use unique email addresses (with timestamp), so this shouldn't happen. If it does:
1. The test database may need cleanup
2. Check if MongoDB is using the correct database

### Permission errors during media upload

Media upload tests may skip if GridFS is not properly configured. This is expected in some environments.

## Continuous Integration

For CI/CD, you can run:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Check exit code
echo $? # Should be 0 if all tests pass
```

## Writing New Tests

To add new tests:

1. Create a test file in `backend/tests/`:
   ```javascript
   import chai from 'chai';
   import chaiHttp from 'chai-http';
   import app from '../index.mjs';
   
   const { expect } = chai;
   chai.use(chaiHttp);
   
   describe('My Feature', () => {
     it('should do something', async () => {
       const res = await chai.request(app)
         .get('/api/my-endpoint');
       
       expect(res).to.have.status(200);
     });
   });
   ```

2. Run your test:
   ```bash
   mocha tests/my-feature.test.mjs --exit
   ```

## Test Environment

Tests can be run against:
- Local MongoDB instance
- In-memory MongoDB (if configured)
- Test database (recommended for CI)

Set `NODE_ENV=test` to use test configuration:
```bash
NODE_ENV=test npm test
```






This guide explains how to test the MomentVibe backend API to ensure all endpoints are working correctly.

## Prerequisites

1. **MongoDB must be running**
   ```bash
   sudo systemctl start mongod
   # Or check: sudo systemctl status mongod
   ```

2. **Redis must be running** (optional but recommended)
   ```bash
   sudo systemctl start redis
   ```

3. **Backend dependencies installed**
   ```bash
   cd backend
   npm install
   ```

## Running Tests

### Quick Health Check

Test if the server and database are properly connected:

```bash
cd backend
npm run test:health
```

This will:
- Check if the `/api/health` endpoint is working
- Verify database connection status
- Return quickly (5 second timeout)

### Full API Integration Tests

Run comprehensive API tests for all endpoints:

```bash
cd backend
npm run test:api
```

This will test:
- ✅ Health check endpoint
- ✅ User registration and login
- ✅ Event creation, retrieval, update
- ✅ Media upload and retrieval
- ✅ Album creation and management
- ✅ Guestbook messages and reactions
- ✅ Event permissions
- ✅ QR code generation

**Note:** This test suite creates real data in your database (with test users/events) and cleans up afterward.

### Run All Tests

Run all test files:

```bash
cd backend
npm test
```

### Using the Test Script

For convenience, use the automated test script:

```bash
cd backend
./scripts/test-api.sh
```

This script will:
1. Check if the server is running
2. Start it in the background if needed
3. Run all tests
4. Provide a summary
5. Clean up background processes

## Manual API Testing

### Using cURL

#### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response (if MongoDB is connected):
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Server is running and database is connected"
}
```

#### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

#### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Save the token from the response, then use it:

#### Create Event
```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Event",
    "description": "This is a test event",
    "date": "2024-12-31T00:00:00.000Z"
  }'
```

#### Get Events
```bash
curl http://localhost:5000/api/events/host/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the collection from `backend/postman-collection.json` (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically after login)
3. Run the collection

### Using HTTPie

```bash
# Install: sudo apt install httpie

# Health check
http GET http://localhost:5000/api/health

# Register
http POST http://localhost:5000/api/auth/register \
  name="Test User" \
  email="test@example.com" \
  password="TestPassword123"

# Login
http POST http://localhost:5000/api/auth/login \
  email="test@example.com" \
  password="TestPassword123"
```

## Test Coverage

The test suite covers:

### Authentication
- ✅ User registration
- ✅ User login
- ✅ User logout
- ✅ Duplicate registration prevention
- ✅ Invalid credentials rejection

### Events
- ✅ Event creation
- ✅ Event retrieval by ID
- ✅ Host events listing
- ✅ Event update
- ✅ Event deletion
- ✅ QR code generation

### Media
- ✅ Media upload
- ✅ Event media retrieval
- ✅ Media approval (host only)
- ✅ Media download

### Albums
- ✅ Album creation
- ✅ Album listing
- ✅ Album update
- ✅ Album deletion

### Guestbook
- ✅ Message creation
- ✅ Message retrieval
- ✅ Reaction addition

### Permissions
- ✅ Permission updates
- ✅ Download permission control

## Troubleshooting

### Tests fail with "Database not connected"

**Solution:** Start MongoDB
```bash
sudo systemctl start mongod
```

Verify connection:
```bash
npm run test:health
```

### Tests fail with timeout

**Solution:** 
1. Ensure the backend server is running
2. Check if port 5000 is available
3. Increase timeout in test files if needed

### Tests create duplicate data

The tests use unique email addresses (with timestamp), so this shouldn't happen. If it does:
1. The test database may need cleanup
2. Check if MongoDB is using the correct database

### Permission errors during media upload

Media upload tests may skip if GridFS is not properly configured. This is expected in some environments.

## Continuous Integration

For CI/CD, you can run:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Check exit code
echo $? # Should be 0 if all tests pass
```

## Writing New Tests

To add new tests:

1. Create a test file in `backend/tests/`:
   ```javascript
   import chai from 'chai';
   import chaiHttp from 'chai-http';
   import app from '../index.mjs';
   
   const { expect } = chai;
   chai.use(chaiHttp);
   
   describe('My Feature', () => {
     it('should do something', async () => {
       const res = await chai.request(app)
         .get('/api/my-endpoint');
       
       expect(res).to.have.status(200);
     });
   });
   ```

2. Run your test:
   ```bash
   mocha tests/my-feature.test.mjs --exit
   ```

## Test Environment

Tests can be run against:
- Local MongoDB instance
- In-memory MongoDB (if configured)
- Test database (recommended for CI)

Set `NODE_ENV=test` to use test configuration:
```bash
NODE_ENV=test npm test
```





