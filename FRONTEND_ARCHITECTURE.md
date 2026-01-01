# MomentVibe Frontend Architecture

## Project Structure

```
frontend/src/
├── app/
│   ├── layout.tsx          # Main layout with AuthProvider and Navbar
│   ├── page.tsx            # Home page (Hero section)
│   ├── dashboard/
│   │   └── page.tsx        # Host dashboard - List all events
│   ├── events/
│   │   ├── create/
│   │   │   └── page.tsx    # Create new event page
│   │   └── [id]/
│   │       └── page.tsx    # Event detail page with tabs
│   ├── login/
│   │   └── page.tsx        # Login page (to be created)
│   ├── register/
│   │   └── page.tsx        # Registration page (to be created)
│   └── globals.css         # Global styles
│
├── components/
│   ├── Navbar.tsx          # Navigation bar with auth menu
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   ├── InputField.js       # (Existing)
│   ├── AuthSwitch.js       # (Existing)
│   └── SocialAuth.js       # (Existing)
│
├── config/
│   └── api.ts              # API configuration and endpoints
│
├── context/
│   └── AuthContext.tsx     # Authentication context provider
│
├── services/
│   ├── authService.ts      # Authentication API calls
│   ├── eventService.ts     # Event API calls
│   ├── mediaService.ts     # Media upload/management API calls
│   ├── albumService.ts     # Album management (to be created)
│   ├── guestbookService.ts # Guestbook API calls (to be created)
│   └── guestService.ts     # Guest registration (to be created)
│
├── hooks/
│   ├── useAuth.ts          # Auth hook (in context)
│   └── useMedia.ts         # Media management hook (to be created)
│
├── types/
│   ├── api.ts              # API response types
│   ├── models.ts           # Data model types
│   └── forms.ts            # Form data types
│
└── utils/
    ├── helpers.ts          # Utility functions
    ├── validators.ts       # Form validators
    └── formatters.ts       # Date/time formatters
```

## Key Features Implemented

### 1. **Authentication System**
- AuthContext for global auth state management
- Login, Register, Logout functionality
- Protected routes
- Token-based authentication

### 2. **Event Management**
- Create new events
- View event details
- Event listing with filtering
- QR code generation for guests
- Permission management (download/share)

### 3. **Media Management**
- Host media upload
- Guest media upload via QR code
- Media approval workflow
- Visibility scheduling
- Media download functionality

### 4. **Navigation & UI**
- Responsive Navbar with auth menu
- Home page with features showcase
- Dashboard with event cards
- Styled using Tailwind CSS

## API Integration

All services are connected to the backend at `http://localhost:5000/api`:

### Auth Endpoints
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/request-password-reset`
- POST `/auth/reset-password`
- GET `/auth/confirm-email`

### Event Endpoints
- POST `/events/create`
- GET `/events/{id}`
- PUT `/events/{id}`
- DELETE `/events/{id}`
- GET `/events/host/events`
- POST `/events/{id}/guest-qr`
- PUT `/events/{id}/permissions`

### Media Endpoints
- POST `/media/upload`
- POST `/media/guest/upload`
- GET `/media/{eventId}`
- PUT `/media/{mediaId}/visibility`
- GET `/media/download/{mediaId}`

## Still To Create

### Pages
- [ ] `/login` - Login page
- [ ] `/register` - Registration page
- [ ] `/profile` - User profile page
- [ ] `/events/[id]/edit` - Edit event page
- [ ] `/events/[id]/guests` - Guest management page
- [ ] `/events/[id]/guestbook` - Guestbook view page
- [ ] `/events/[id]/albums` - Album management
- [ ] `/qr/[eventId]` - Guest upload page with QR scanner
- [ ] `/404` - Not found page
- [ ] `/error` - Error page

### Services
- [ ] `albumService.ts` - Album CRUD operations
- [ ] `guestbookService.ts` - Guestbook messages and reactions
- [ ] `guestService.ts` - Guest registration and management

### Components
- [ ] `MediaUpload.tsx` - File upload component
- [ ] `EventCard.tsx` - Event card component
- [ ] `MediaGallery.tsx` - Media grid/gallery
- [ ] `QRScanner.tsx` - QR code scanner for guests
- [ ] `LoadingSpinner.tsx` - Loading indicator
- [ ] `Modal.tsx` - Modal dialog
- [ ] `Toast.tsx` - Toast notifications
- [ ] `Dropdown.tsx` - Dropdown menu

### Hooks
- [ ] `useEvents.ts` - Events data fetching
- [ ] `useMedia.ts` - Media management
- [ ] `useAlbums.ts` - Album management
- [ ] `useForm.ts` - Form handling
- [ ] `usePagination.ts` - Pagination logic

### Utilities
- [ ] `validators.ts` - Form validators
- [ ] `formatters.ts` - Date and file formatters
- [ ] `helpers.ts` - Helper functions

## Styling

Using **Tailwind CSS** for styling with:
- Responsive design (mobile-first)
- Gradient backgrounds
- Hover effects and transitions
- Dark mode support (can be added)
- Custom color scheme matching MomentVibe brand

## Environment Setup

Create `.env.local` in the frontend directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Next Steps

1. Create remaining pages (Login, Register, Profile)
2. Build missing services
3. Create reusable components
4. Add form validation
5. Implement error handling and toast notifications
6. Add loading states
7. Implement pagination for event/media lists
8. Add search and filter functionality
9. Create responsive mobile views
10. Add accessibility features (a11y)
