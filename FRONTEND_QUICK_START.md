# MomentVibe Frontend - Quick Start Guide

## 🚀 Quick Setup

### 1. Environment Setup
```bash
cd frontend

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 2. Install & Run
```bash
npm install
npm run dev
```

**Access**: http://localhost:3000

## 📱 Testing the Frontend

### Home Page
- Navigate to http://localhost:3000
- See landing page with features
- Links to Login/Register (to be implemented)

### Dashboard
- After login (once implemented): http://localhost:3000/dashboard
- View all your events
- Create new events

### Create Event
- http://localhost:3000/events/create
- Fill in event details
- Set permissions
- Create event

### Event Details
- http://localhost:3000/events/[event-id]
- View event overview
- See media gallery
- Manage settings

## 🔧 Development Workflow

### 1. Adding a New Page
```typescript
// app/new-page/page.tsx
'use client';
import { useAuth } from '@/context/AuthContext';

export default function NewPage() {
  const { isAuthenticated } = useAuth();
  
  return <div>Your content</div>;
}
```

### 2. Using Services
```typescript
import { eventService } from '@/services/eventService';

// Create event
const event = await eventService.createEvent(data);

// Get events
const events = await eventService.getHostEvents();

// Update event
await eventService.updateEvent(id, data);
```

### 3. Using Auth
```typescript
import { useAuth } from '@/context/AuthContext';

export default function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Hello {user?.name}</div>;
}
```

### 4. Using Utilities
```typescript
import { validators } from '@/utils/validators';
import { formatters } from '@/utils/formatters';
import { helpers } from '@/utils/helpers';

// Validate
if (!validators.email(email)) {
  // Invalid email
}

// Format
const formatted = formatters.date(event.date);
const time = formatters.relativeTime(message.createdAt);

// Helper
const slug = helpers.slugify(eventName);
helpers.downloadFile(blob, 'filename.zip');
```

## 📋 Implementation Checklist

### Priority 1 (Must Have)
- [ ] Login page with form validation
- [ ] Register page with form validation
- [ ] Toast notification system
- [ ] Media upload component
- [ ] Event edit page
- [ ] Guestbook view and add message

### Priority 2 (Should Have)
- [ ] Guest management page
- [ ] Album management UI
- [ ] QR code scanner component
- [ ] Media gallery with filters
- [ ] Download all media as ZIP
- [ ] User profile page

### Priority 3 (Nice to Have)
- [ ] Dark mode
- [ ] Image optimization
- [ ] Infinite scroll
- [ ] Real-time notifications (socket.io)
- [ ] Search functionality
- [ ] Advanced filters

## 🧩 Component Template

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  // Define props here
}

export default function ComponentName(props: Props) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load data
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Your JSX here */}
    </div>
  );
}
```

## 🎨 Styling Guidelines

### Color Palette
```css
Primary: bg-blue-600
Secondary: bg-purple-600
Accent: bg-pink-500
Success: bg-green-600
Error: bg-red-600
Warning: bg-yellow-600
Info: bg-blue-500
```

### Layout
```css
Container: max-w-6xl mx-auto px-4
Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Padding: p-4 sm:p-6 lg:p-8
Margin: mb-4 mt-6
```

## 🧪 Testing API Integration

### Test with curl
```bash
# Get auth endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get events (with token)
curl http://localhost:5000/api/events/host/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Debugging

### Check Auth Status
```typescript
// In browser console
localStorage.getItem('token'); // Should return JWT token
```

### View API Calls
- Open DevTools → Network tab
- Check request/response headers
- Verify Authorization header is present

### Common Issues

**Problem**: "next: not found"
```bash
# Solution:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem**: CORS errors
- Ensure backend is running on localhost:5000
- Check CORS configuration in backend

**Problem**: "Cannot find module"
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

## 📚 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)

## 🚨 Important Notes

1. **Backend Must Be Running**
   - Start backend: `cd backend && npm run start`
   - Backend runs on http://localhost:5000

2. **Environment Variables**
   - Create `.env.local` file
   - Add `NEXT_PUBLIC_API_URL`
   - Never commit secrets to git

3. **Token Management**
   - Token stored in localStorage
   - Sent in Authorization header
   - Expires based on backend config

4. **Protected Routes**
   - Dashboard and event management require login
   - Public pages: Home, Login, Register

## 💡 Tips

- Use `npm run dev` for development
- Use `npm run build` to check for TypeScript errors
- Use browser DevTools for debugging
- Check both frontend and backend console logs
- Use Postman to test API endpoints directly

---

**Happy Coding! 🎉**
