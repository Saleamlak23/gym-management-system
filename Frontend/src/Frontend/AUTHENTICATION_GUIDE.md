# Frontend Authentication & RBAC Implementation Guide

## Overview
The Gym Management System frontend has been updated with a complete JWT-based authentication system, role-based access control (RBAC), and tablet-friendly check-in interface aligned with the backend specification.

## 1. Authentication Flow

### Login Component (`Login.tsx`)
- **Location**: `/src/Frontend/Login.tsx`
- **Purpose**: Entry point for user authentication
- **Features**:
  - Login/Signup toggle form
  - Email/Password validation
  - JWT token handling (localStorage)
  - Mock login fallback for testing
  - Error handling with API response format support
  - Demo credentials display

**Usage**:
```tsx
import { Login } from './Frontend/Login';

// Will be shown if user is not authenticated
<Login />
```

### Store Authentication State (`store.ts`)
- **Location**: `/src/Frontend/store.ts`
- **Purpose**: Global state management for authentication and authorization
- **State**:
  - `user: User | null` - Current logged-in user object
  - `isAuthenticated: boolean` - Authentication status
  - `token: string | null` - JWT token from backend

**Key Actions**:
```tsx
const { 
  user,                    // User object or null
  isAuthenticated,         // boolean
  token,                   // JWT token string
  setUser,                 // (user: User | null) => void
  setToken,                // (token: string | null) => void
  logout,                  // () => void
  canAccess,               // (roles: string[]) => boolean
  isAdmin,                 // () => boolean
  isTrainer                // () => boolean
} = useStore();
```

**localStorage Persistence**:
- `user` - Stored as JSON string with key `user`
- `authToken` - Stored as string with key `authToken`
- Both are cleared on logout

## 2. Protected Route Component

### ProtectedRoute Component (`ProtectedRoute.tsx`)
- **Location**: `/src/Frontend/ProtectedRoute.tsx`
- **Purpose**: Wrapper component that enforces authentication and role-based access

**Basic Usage**:
```tsx
import { ProtectedRoute } from './ProtectedRoute';

<ProtectedRoute>
  <AdminPanel />
</ProtectedRoute>
```

**With Role Requirements**:
```tsx
<ProtectedRoute requiredRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>
```

**Access Control Hooks**:

```tsx
// Check if user has access to specific roles
const canAccess = useCanAccess(['admin', 'manager']);
if (canAccess) {
  // Show admin content
}

// Check if user is trainer
const isTrainer = useIsTrainer();

// Check if user is admin
const isAdmin = useIsAdmin();
```

## 3. API Integration

### API Response Format
All API endpoints follow this standard format:
```tsx
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: {
    field?: string;
    message: string;
  }[];
}
```

### Login Endpoint
**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@gym.com",
  "password": "password123"
}
```

**Response** (success):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Admin",
      "email": "admin@gym.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Sign Up Endpoint
**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "name": "New Member",
  "email": "member@gym.com",
  "password": "password123"
}
```

**Response** (success):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## 4. Main Application Flow

### App.tsx Integration
```tsx
import { GymApp } from './Frontend/GymApp';
import { Login } from './Frontend/Login';
import { useStore } from './Frontend/store';

function App() {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <GymApp /> : <Login />;
}
```

### User Roles and Permissions
- **admin**: Full access to all modules (Admin, Operations)
- **manager**: Access to Operations and Members modules
- **staff**: Access to check-in and member operations
- **member**: Access to member dashboard and check-in only

**Module Access Control**:
```tsx
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', requiresAdmin: false },  // All roles
  { id: 'attendance', label: 'Check-In', requiresAdmin: false },  // All roles
  { id: 'admin', label: 'Admin', requiresAdmin: true },           // Admin only
  { id: 'operations', label: 'Operations', requiresAdmin: true }, // Admin only
  { id: 'members', label: 'Members', requiresAdmin: false },      // All roles
  { id: 'reporting', label: 'Reporting', requiresAdmin: false }   // All roles
];
```

## 5. Member Check-In Module

### AttendanceCheckIn Component
- **Location**: `/src/Frontend/AttendanceCheckIn.tsx`
- **Purpose**: Tablet-friendly interface for member check-in/check-out
- **Features**:
  - Large touch-friendly buttons
  - Card/ID scanning support (numeric input)
  - Real-time session tracking
  - Subscription validation
  - Check-out functionality

**API Endpoints**:

**Check-In**:
```
POST /api/attendance/check-in
{
  "memberId": 123
}

Response:
{
  "success": true,
  "data": {
    "memberId": 123,
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2024-12-31T00:00:00Z",
    "canCheckIn": true
  }
}
```

**Check-Out**:
```
POST /api/attendance/check-out
{
  "memberId": 123
}
```

## 6. Header and Sidebar Updates

### Logout Functionality
**Sidebar**:
```tsx
<button onClick={handleLogout}>
  <LogOut size={20} />
  <span>Logout</span>
</button>
```

**Header**:
```tsx
<button onClick={handleLogout} title="Logout">
  <LogOut size={20} />
</button>
```

When logout is clicked:
1. `store.logout()` is called
2. User state is cleared
3. Token is removed from localStorage
4. App redirects to Login screen

### Module Title Display
Header dynamically shows current module title:
```tsx
const titles = {
  'dashboard': 'Dashboard',
  'attendance': 'Member Check-In',
  'admin': 'Admin & Infrastructure',
  'operations': 'Club Operations',
  'members': 'Member & Finance',
  'reporting': 'Reporting & Analytics'
};
```

## 7. JWT Token Handling

### Token Storage
- Tokens are stored in `localStorage` with key `authToken`
- On app startup, token is loaded from localStorage if available
- Token persists across browser refreshes

### Token in API Requests
Add to fetch headers:
```tsx
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

fetch('/api/endpoint', {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});
```

### Token Expiration
- Backend generates tokens with TTL (time-to-live)
- Frontend should check response status:
  - 401: Token expired or invalid → Clear localStorage, redirect to Login
  - 403: Insufficient permissions → Show error message

## 8. Demo Credentials

For testing without backend:

**Admin**:
- Email: `admin@gym.com`
- Password: `admin123`
- Role: `admin`

**Staff/Trainer**:
- Email: `trainer@gym.com`
- Password: `trainer123`
- Role: `staff`

**Member**:
- Email: `member@gym.com`
- Password: `member123`
- Role: `member`

## 9. Implementation Checklist

- ✅ Authentication types (types.ts)
- ✅ Store with JWT state (store.ts)
- ✅ Login component (Login.tsx)
- ✅ Protected routes (ProtectedRoute.tsx)
- ✅ Check-in module (AttendanceCheckIn.tsx)
- ✅ Header logout functionality
- ✅ Sidebar logout & RBAC
- ✅ Main app integration (App.tsx, GymApp.tsx)
- ⏳ Equipment overdue calculation (AdminModule.tsx)
- ⏳ Class capacity checks (OperationsModule.tsx)
- ⏳ Trainer role filtering (OperationsModule.tsx)
- ⏳ Attendance heatmap (ReportingModule.tsx)
- ⏳ Revenue breakdowns (ReportingModule.tsx)

## 10. Error Handling Patterns

### API Error Handling
```tsx
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (result.success) {
    setUser(result.data.user);
    setToken(result.data.token);
  } else {
    // Handle errors array
    const errorMessages = result.errors?.map(e => e.message).join(', ');
    setError(errorMessages || result.message);
  }
} catch (err) {
  setError('Network error');
}
```

### Subscription Validation
```tsx
// Check-in validation logic
const canCheckIn = (user: Member, subscription: Subscription) => {
  if (!user || subscription.status !== 'active') return false;
  
  const now = new Date();
  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);
  
  return now >= startDate && now <= endDate;
};
```

## 11. Testing

### Test Login Flow
1. Click "Sign In" in Login component
2. Enter admin@gym.com / admin123
3. Should redirect to Dashboard
4. Check localStorage for `user` and `authToken`

### Test Logout
1. Click logout button in header
2. Should return to Login screen
3. localStorage should be cleared

### Test RBAC
1. Login as admin
2. Should see Admin & Operations modules
3. Login as member
4. Should only see Dashboard, Check-In, Members, Reporting

### Test Check-In
1. Navigate to Check-In module
2. Enter member ID (e.g., 1001)
3. Should show check-in success or subscription error
4. Check-out button should appear after successful check-in

## 12. Future Enhancements

- [ ] Refresh token endpoint (`POST /api/auth/refresh`)
- [ ] Token refresh mechanism (auto-refresh before expiry)
- [ ] Social login (Google, Facebook)
- [ ] Multi-factor authentication (MFA)
- [ ] Role hierarchy and nested permissions
- [ ] API request interceptor for automatic token injection
- [ ] Real-time notifications via WebSocket
- [ ] Member profile page with subscription details
- [ ] Attendance history and analytics
