# Quick Reference - Authentication Implementation

## 🚀 Quick Start

### 1. Run the App
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### 2. Login
- Email: `admin@gym.com`
- Password: `admin123`

### 3. Test Features
- View Dashboard
- Open Check-In module
- Click Logout

## 📖 Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main entry - switches between Login/GymApp |
| `store.ts` | Auth state & RBAC helpers |
| `Login.tsx` | Authentication UI |
| `ProtectedRoute.tsx` | Access control wrapper |
| `GymApp.tsx` | Authenticated app container |
| `AttendanceCheckIn.tsx` | Check-in/check-out UI |
| `types.ts` | All data models |

## 🔑 Core Concepts

### Authentication State
```tsx
const { user, token, isAuthenticated, logout } = useStore();
```

### Protected Component
```tsx
<ProtectedRoute requiredRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>
```

### Access Checks
```tsx
const isAdmin = useIsAdmin();
const canAccess = useCanAccess(['admin', 'manager']);
```

## 🔄 API Integration Pattern

```tsx
const response = await fetch('/api/endpoint', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();

if (result.success) {
  // Handle result.data
} else {
  // Handle result.errors
}
```

## 🧪 Quick Tests

### Test 1: Login & Logout
1. Click Login → Enter admin@gym.com / admin123
2. Should show Dashboard
3. Click logout → Return to Login

### Test 2: Role Access
1. Login as admin → See Admin + Operations modules
2. Login as member → See only Dashboard, Members, Reporting

### Test 3: Check-In
1. Navigate to Check-In
2. Enter Member ID (e.g., 1001)
3. See check-in status

### Test 4: Persistence
1. Login → Note user in localStorage
2. Refresh browser → Still logged in
3. Check Console → No errors

## 📱 User Roles

```
admin    → Full access to all modules
staff    → Check-in + operations
manager  → Operations + members
member   → Dashboard + check-in + members
```

## ⚡ Common Tasks

### Add Protected Feature
```tsx
import { ProtectedRoute } from './ProtectedRoute';

<ProtectedRoute requiredRoles={['admin']}>
  <YourComponent />
</ProtectedRoute>
```

### Check User Role
```tsx
const { isAdmin, isTrainer } = useStore();

if (isAdmin()) {
  // Show admin content
}
```

### Make API Call
```tsx
const { token } = useStore();

const response = await fetch('/api/members', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Handle Logout
```tsx
const { logout } = useStore();

const handleLogout = () => {
  logout(); // Clears state & localStorage
  // App redirects to Login automatically
};
```

## 🐛 Troubleshooting

### User Not Persisting After Refresh
- Check localStorage for `user` and `authToken` keys
- Verify store initialization code in store.ts

### Getting 401 Errors
- Check token is included in Authorization header
- Verify token format: `Bearer {token}`

### Role Access Not Working
- Check `requiresAdmin` prop in Sidebar menuItems
- Verify user.role in store matches expected roles

### Check-In Not Working
- Ensure `/api/attendance/check-in` endpoint exists
- Check API response format matches `AttendanceCheckIn` type

## 📞 Documentation

- **Full Auth Guide**: See `AUTHENTICATION_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_COMPLETE.md`
- **Type Definitions**: See `types.ts` lines 1-50
- **Component Code**: See individual `.tsx` files

## 🎯 Current Status

✅ Authentication: Complete
✅ RBAC: Complete
✅ Check-In UI: Complete
✅ Header/Sidebar: Updated with logout
✅ App Integration: Complete

⏳ Remaining (Priority Order):
1. Equipment overdue calculation
2. Class capacity checks
3. Trainer filtering
4. Attendance heatmap
5. Revenue breakdowns

---

**Last Updated**: 2024
**Version**: 1.0.0
