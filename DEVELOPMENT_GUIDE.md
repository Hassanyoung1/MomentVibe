# MomentVibe Frontend - Development Guide

## 🎓 Development Standards

### File Naming Conventions

```
Pages:      page.tsx (lowercase)
Components: ComponentName.tsx (PascalCase)
Services:   serviceName.ts (camelCase)
Utilities:  utilityName.ts (camelCase)
Contexts:   ContextName.tsx (PascalCase)
Types:      models.ts or types/ (lowercase)
```

### Import Order

```typescript
// 1. React & Next.js imports
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External dependencies
import Link from 'next/link';

// 3. Internal components
import { Navbar } from '@/components/Navbar';

// 4. Services
import { eventService } from '@/services/eventService';

// 5. Context & Hooks
import { useAuth } from '@/context/AuthContext';

// 6. Types
import type { Event } from '@/types/models';

// 7. Utilities
import { formatters } from '@/utils/formatters';
```

---

## 🔧 Creating New Features

### 1. Creating a New Service

```typescript
// src/services/newService.ts

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';

interface DataType {
  field: string;
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`,
});

export const newService = {
  async fetchData(): Promise<DataType[]> {
    const response = await fetch(`${API_BASE_URL}/endpoint`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },

  async createData(data: DataType): Promise<DataType> {
    const response = await fetch(`${API_BASE_URL}/endpoint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  },
};
```

### 2. Creating a New Page

```typescript
// src/app/new-page/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { newService } from '@/services/newService';

export default function NewPage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await newService.fetchData();
      setData(result);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Page Title</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Your content here */}
      </div>
    </div>
  );
}
```

### 3. Creating a New Component

```typescript
// src/components/NewComponent.tsx

import React from 'react';

interface NewComponentProps {
  title: string;
  data?: any;
  onAction?: () => void;
}

export function NewComponent({ title, data, onAction }: NewComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {/* Component content */}
      
      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Action
        </button>
      )}
    </div>
  );
}
```

### 4. Adding a New Hook

```typescript
// src/hooks/useNewFeature.ts

import { useState, useEffect } from 'react';
import { newService } from '@/services/newService';

interface UseNewFeatureOptions {
  autoFetch?: boolean;
}

export function useNewFeature(options: UseNewFeatureOptions = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (options.autoFetch) {
      fetchData();
    }
  }, [options.autoFetch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await newService.fetchData();
      setData(result);
    } catch (err) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
```

---

## 📝 Form Handling Pattern

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validators } from '@/utils/validators';

export default function FormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validators.email(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!validators.password(formData.password)) {
      newErrors.password = 'Password is too weak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Submit form
      await submitForm(formData);
      router.push('/success');
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition"
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## 🎨 Tailwind Utility Classes Reference

### Spacing
```css
p-4    /* padding: 1rem */
m-6    /* margin: 1.5rem */
mb-8   /* margin-bottom: 2rem */
px-4   /* padding-left/right: 1rem */
gap-6  /* gap: 1.5rem */
```

### Colors
```css
bg-blue-600      /* Blue background */
text-gray-700    /* Gray text */
border-red-500   /* Red border */
hover:bg-blue-700 /* Hover state */
```

### Flexbox & Grid
```css
flex               /* display: flex */
flex-col          /* flex-direction: column */
justify-center    /* justify-content: center */
items-center      /* align-items: center */
grid              /* display: grid */
grid-cols-3       /* grid-template-columns: repeat(3, minmax(0, 1fr)) */
gap-6             /* gap: 1.5rem */
```

### Responsive
```css
sm:text-lg        /* Small screen and up */
md:grid-cols-2    /* Medium screen and up */
lg:p-8            /* Large screen and up */
```

### Other Utilities
```css
rounded-lg        /* Border radius */
shadow-lg         /* Box shadow */
transition        /* CSS transitions */
opacity-50        /* Opacity */
cursor-pointer    /* Cursor style */
```

---

## 🧪 Testing Your Code

### Test Page Component
```bash
# Start dev server
npm run dev

# Visit your page at http://localhost:3000/your-page
```

### Test Service Call
```typescript
// In browser console
import { eventService } from '@/services/eventService';

// Try a service call
eventService.getHostEvents()
  .then(events => console.log('Events:', events))
  .catch(err => console.error('Error:', err));
```

### Debug API Calls
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. See API call with request/response
5. Check Authorization header
```

---

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: TypeScript errors
```bash
# Check for errors
npm run build

# Clear cache and rebuild
rm -rf .next
npm run build
```

### Issue: Auth token not working
```typescript
// Check if token exists
localStorage.getItem('token');

// Check if header is correct
// Should be: Authorization: Bearer [token]

// Verify token is being set after login
authService.getToken();
```

### Issue: API calls failing
```
1. Check if backend is running (localhost:5000)
2. Check Network tab in DevTools
3. Verify API URL in .env.local
4. Check CORS configuration
5. Verify Authorization header
```

---

## 📚 Best Practices

### Error Handling
```typescript
try {
  const data = await service.fetchData();
  setData(data);
} catch (error) {
  console.error('Error:', error);
  setError('User-friendly error message');
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // Do something
  } finally {
    setLoading(false);  // Always stop loading
  }
};
```

### Form Validation
```typescript
// Always validate before submit
const validateForm = (): boolean => {
  const errors: Record<string, string> = {};
  if (!validators.email(email)) errors.email = 'Invalid email';
  setErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### Component Reusability
```typescript
// ❌ Don't do this (hard to reuse)
export function MyComponent() {
  return <button className="...">Specific action</button>;
}

// ✅ Do this (more reusable)
interface MyComponentProps {
  label: string;
  onClick: () => void;
}
export function MyComponent({ label, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

---

## 🚀 Performance Tips

1. **Use 'use client' wisely** - Only on components that need interactivity
2. **Lazy load images** - Use Next.js Image component
3. **Code splitting** - Keep components small
4. **Memoization** - Use React.memo for expensive components
5. **Debounce** - Use debounce for search inputs

```typescript
import { helpers } from '@/utils/helpers';

const debouncedSearch = helpers.debounce((query: string) => {
  searchService.search(query);
}, 300);
```

---

## 📖 Code Examples

### Fetching Data
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  eventService.getHostEvents()
    .then(setData)
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

### Conditional Rendering
```typescript
{isLoading ? (
  <div>Loading...</div>
) : error ? (
  <div className="text-red-600">{error}</div>
) : (
  <div>{/* Your content */}</div>
)}
```

### Styling Conditional Classes
```typescript
<div className={`
  px-4 py-2 rounded-lg transition
  ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
`}>
  Content
</div>
```

---

## 🎯 Commit Message Standards

```
feat: Add new feature (e.g., "Add media upload component")
fix: Fix bug (e.g., "Fix auth token expiration")
refactor: Refactor code (e.g., "Extract common logic")
docs: Add documentation (e.g., "Add API documentation")
style: Code style changes (e.g., "Fix formatting")
test: Add tests (e.g., "Add unit tests for validators")
```

---

## 📞 Getting Help

1. **Check existing code** - Look for similar implementations
2. **Read TypeScript errors** - They're usually very helpful
3. **Check Network tab** - See what the API is returning
4. **Use browser DevTools** - Debug state and props
5. **Read documentation** - Check files in root directory

---

**Happy Coding! 🚀**
