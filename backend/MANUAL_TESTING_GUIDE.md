# 🧪 Manual API Testing Guide

This guide will teach you how to manually test your backend API endpoints to verify they're working correctly.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Testing Tools](#testing-tools)
3. [Basic Testing Commands](#basic-testing-commands)
4. [Step-by-Step Testing Examples](#step-by-step-testing-examples)
5. [Understanding Response Codes](#understanding-response-codes)

---

## Prerequisites

Before testing, make sure:
1. ✅ MongoDB is running: `sudo systemctl status mongod`
2. ✅ Backend server is running: `npm start` (in the backend directory)
3. ✅ Server is on port 5000 (check terminal output)

---

## Testing Tools

You can use any of these tools to test your API:

### 1. **curl** (Command Line - Recommended for Learning)
- Already installed on Linux
- Great for quick tests
- Easy to script

### 2. **Postman** (GUI - Best for Complex Testing)
- Download: https://www.postman.com/downloads/
- Visual interface
- Save requests for reuse

### 3. **HTTPie** (Command Line - User Friendly)
- Install: `sudo apt install httpie`
- Prettier output than curl
- Easier syntax

### 4. **Browser** (For GET requests only)
- Just type URL in address bar
- Limited to GET requests
- Good for quick checks

---

## Basic Testing Commands

### Using curl (Most Common)

#### 1. **Simple GET Request**
```bash
curl http://localhost:5000/api/health
```

#### 2. **GET Request with Pretty JSON Output**
```bash
curl -s http://localhost:5000/api/health | jq .
```

#### 3. **POST Request with JSON Data**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

#### 4. **See Full Response (Headers + Body)**
```bash
curl -i http://localhost:5000/api/health
```

#### 5. **See Only HTTP Status Code**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health
```

---

## Step-by-Step Testing Examples

### ✅ Test 1: Health Check (Easiest)

**Purpose:** Verify server is running

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Server is running and database is connected"
}
```

**What to look for:**
- ✅ Status code: 200
- ✅ "status": "healthy"
- ✅ "database": "connected"

---

### ✅ Test 2: Register a New User

**Purpose:** Create a new host account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "host"
  }'
```

**Expected Response (Success):**
```json
{
  "message": "User registered successfully! Please check your email to confirm your account.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Expected Response (Email exists):**
```json
{
  "error": "Email already exists"
}
```

**What to look for:**
- ✅ Status code: 201 (Created) or 400 (Bad Request if validation fails)
- ✅ Success message or error message

---

### ✅ Test 3: Login

**Purpose:** Authenticate and get a token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "host"
  }
}
```

**What to look for:**
- ✅ Status code: 200
- ✅ Token is returned
- ✅ User information is correct

**Note:** The `-c cookies.txt` saves cookies for authenticated requests

---

### ✅ Test 4: Create an Event (Requires Authentication)

**Purpose:** Create a new event as a logged-in host

```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Birthday Party",
    "description": "John 30th Birthday Celebration",
    "date": "2026-02-15T18:00:00Z",
    "location": "123 Main St, City",
    "maxGuests": 50
  }'
```

**Expected Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Birthday Party",
    "description": "John's 30th Birthday Celebration",
    "date": "2026-02-15T18:00:00.000Z",
    "location": "123 Main St, City",
    "hostId": "507f1f77bcf86cd799439011",
    "maxGuests": 50
  }
}
```

**What to look for:**
- ✅ Status code: 201 (Created)
- ✅ Event details are returned
- ✅ Event has an _id

**Note:** The `-b cookies.txt` sends the authentication cookie

---

### ✅ Test 5: Register a Guest

**Purpose:** Register a guest for an event (no authentication needed)

```bash
curl -X POST http://localhost:5000/api/guests/register \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "message": "Guest registered successfully",
  "guest": {
    "_id": "507f1f77bcf86cd799439013",
    "eventId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890"
  }
}
```

---

### ✅ Test 6: Upload Media (Guest)

**Purpose:** Upload a photo to an event

```bash
curl -X POST http://localhost:5000/api/media/guest/upload \
  -F "media=@/path/to/your/image.jpg" \
  -F "eventId=507f1f77bcf86cd799439012" \
  -F "guestId=507f1f77bcf86cd799439013"
```

**Replace:** `/path/to/your/image.jpg` with an actual image path

**Expected Response:**
```json
{
  "message": "Media uploaded successfully",
  "media": {
    "_id": "507f1f77bcf86cd799439014",
    "eventId": "507f1f77bcf86cd799439012",
    "fileId": "507f1f77bcf86cd799439015",
    "filename": "image.jpg",
    "contentType": "image/jpeg"
  }
}
```

---

### ✅ Test 7: Get Event Media

**Purpose:** Retrieve all media for an event

```bash
curl http://localhost:5000/api/media/507f1f77bcf86cd799439012
```

**Expected Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "eventId": "507f1f77bcf86cd799439012",
    "filename": "image.jpg",
    "contentType": "image/jpeg",
    "uploadedAt": "2026-01-13T12:00:00.000Z"
  }
]
```

---

### ✅ Test 8: Add Guestbook Message

**Purpose:** Leave a message in the event guestbook

```bash
curl -X POST http://localhost:5000/api/guestbook/507f1f77bcf86cd799439012/add-message \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Jane Smith",
    "message": "Thanks for the amazing party! 🎉"
  }'
```

**Expected Response:**
```json
{
  "message": "Guestbook entry added!",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "eventId": "507f1f77bcf86cd799439012",
    "guestName": "Jane Smith",
    "message": "Thanks for the amazing party! 🎉",
    "createdAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

### ✅ Test 9: Get Guestbook Messages

**Purpose:** View all messages for an event

```bash
curl http://localhost:5000/api/guestbook/507f1f77bcf86cd799439012/messages
```

**Expected Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "eventId": "507f1f77bcf86cd799439012",
    "guestName": "Jane Smith",
    "message": "Thanks for the amazing party! 🎉",
    "reactions": {
      "like": 0,
      "love": 0,
      "laugh": 0
    },
    "createdAt": "2026-01-13T12:00:00.000Z"
  }
]
```

---

## Understanding Response Codes

| Code | Meaning | What It Means |
|------|---------|---------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid data sent (check your JSON) |
| **401** | Unauthorized | Need to login first |
| **403** | Forbidden | Don't have permission |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Something went wrong on server |

---

## Quick Testing Workflow

### 1. **Start Fresh**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# Make sure backend is running
cd /home/hassanyoung1/MomentVibe/backend
npm start
```

### 2. **Test Basic Connectivity**
```bash
curl http://localhost:5000/api/health
```

### 3. **Create a User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User","role":"host"}'
```

### 4. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  -c cookies.txt
```

### 5. **Create an Event**
```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Event","date":"2026-02-15T18:00:00Z","location":"Test Location"}'
```

---

## Pro Tips 💡

### 1. **Save Responses to Files**
```bash
curl http://localhost:5000/api/health > response.json
```

### 2. **Use Variables**
```bash
EVENT_ID="507f1f77bcf86cd799439012"
curl http://localhost:5000/api/media/$EVENT_ID
```

### 3. **Pretty Print JSON**
```bash
curl -s http://localhost:5000/api/health | jq .
```

### 4. **Test with Verbose Output (See Everything)**
```bash
curl -v http://localhost:5000/api/health
```

### 5. **Follow Redirects**
```bash
curl -L http://localhost:5000/api/health
```

---

## Common Issues & Solutions

### ❌ "Connection refused"
**Problem:** Server not running
**Solution:** 
```bash
cd /home/hassanyoung1/MomentVibe/backend
npm start
```

### ❌ "401 Unauthorized"
**Problem:** Need to login first
**Solution:** Run the login command and save cookies

### ❌ "400 Bad Request"
**Problem:** Invalid JSON or missing required fields
**Solution:** Check your JSON syntax and required fields

### ❌ "Cannot connect to MongoDB"
**Problem:** MongoDB not running
**Solution:**
```bash
sudo systemctl start mongod
```

---

## Next Steps

1. ✅ Try each example above in order
2. ✅ Save the commands you use frequently
3. ✅ Create a test script with your common workflows
4. ✅ Consider using Postman for a GUI experience

---

**Happy Testing! 🚀**
