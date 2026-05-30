# API Integration Guide

Complete guide for integrating frontend with TitanSync backend API.

## Base URL Configuration

The API base URL is configured via environment variable `VITE_API_URL`:

```bash
# .env (development)
VITE_API_URL=http://localhost:5000/api

# .env.production (production)
VITE_API_URL=https://api.titansync.com/api
```

Configured in: `src/lib/api.ts`

## Authentication Integration

### Token Management

Tokens are:
- Stored in localStorage
- Auto-injected into all API requests
- Cleared on logout
- Restored on page refresh

### Token Interceptor

Every request automatically includes:
```
Authorization: Bearer <token>
```

### 401 Handling

On 401 response:
1. Token is cleared
2. User redirected to `/login`
3. Session lost

Example:
```typescript
// Automatic - no code needed
authService.login(email, password) // Sets token
// All subsequent requests include token
membersService.getMembers() // Authorization header added automatically
```

## Service Integration

### Pattern: Per-Feature Services

Each domain (members, payments, classes) has dedicated service:

```typescript
// src/services/members.service.ts
export const membersService = {
  // All member-related API calls
  async getMembers(params) { },
  async getMember(id) { },
  // ...
};
```

### Usage in Components

```typescript
import { membersService } from '@/services/members.service';

// In component
const [members, setMembers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  membersService.getMembers({ page: 1, limit: 20 })
    .then(response => {
      if (response.success) {
        setMembers(response.data.members);
      }
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

## Response Format

All API responses follow consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be valid email" },
    { "field": "password", "message": "Minimum 8 characters" }
  ]
}
```

## Existing Integrations

### Authentication Service

**File:** `src/services/auth.service.ts`

```typescript
// Login
authService.login(email, password)
→ POST /auth/login
← { token, user }

// Register
authService.register({ first_name, last_name, email, password, phone })
→ POST /auth/register
← { token, user }

// Get current user
authService.getCurrentUser()
→ GET /auth/me
← { user }

// Logout
authService.logout()
// (Clears local token, no API call)
```

### Members Service

**File:** `src/services/members.service.ts`

```typescript
// List members (with pagination and filters)
membersService.getMembers({ 
  page: 1, 
  limit: 20, 
  search: 'john',
  status: 'active' 
})
→ GET /members?page=1&limit=20&search=john&status=active
← { members: [], pagination: {} }

// Get single member
membersService.getMember(memberId)
→ GET /members/1
← { member: {} }

// Update member
membersService.updateMember(memberId, { first_name, last_name, email, phone })
→ PUT /members/1
← { member: {} }

// Delete (deactivate) member
membersService.deleteMember(memberId)
→ DELETE /members/1
← { success: true }

// Get subscriptions
membersService.getSubscriptions(memberId)
→ GET /members/1/subscriptions
← { subscriptions: [] }

// Create subscription
membersService.createSubscription(memberId, { type_id, start_date })
→ POST /members/1/subscriptions
← { subscription: {} }

// Update subscription status
membersService.updateSubscriptionStatus(memberId, subscriptionId, status)
→ PATCH /members/1/subscriptions/5
← { subscription: {} }
```

## Adding New Endpoints

### Step 1: Create Service Module

```typescript
// src/services/payments.service.ts
import apiClient from '@/lib/api';
import { Payment, ApiResponse } from '@/types';

const BASE = '/payments';

export const paymentsService = {
  async getPayments(params?) {
    const response = await apiClient.getClient().get<ApiResponse<{ payments: Payment[] }>>(BASE, { params });
    return response.data;
  },

  async recordPayment(data: { member_id: number; amount: number; method: string }) {
    const response = await apiClient.getClient().post<ApiResponse<Payment>>(BASE, data);
    return response.data;
  },
};
```

### Step 2: Add Types

```typescript
// src/types/index.ts
export interface Payment {
  payment_id: number;
  member_id: number;
  amount: string;
  method: string;
  payment_date: string;
}

export interface RecordPaymentRequest {
  member_id: number;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
}
```

### Step 3: Use in Component

```typescript
import { paymentsService } from '@/services/payments.service';

const [payments, setPayments] = useState<Payment[]>([]);

useEffect(() => {
  paymentsService.getPayments({ page: 1 })
    .then(res => {
      if (res.success) setPayments(res.data.payments);
    });
}, []);

const handleRecordPayment = async (data: RecordPaymentRequest) => {
  try {
    const response = await paymentsService.recordPayment(data);
    if (response.success) {
      showSuccess('Payment recorded');
      // Refresh list
      await reloadPayments();
    }
  } catch (error) {
    showError('Failed to record payment');
  }
};
```

## Error Handling

### Network Errors

```typescript
try {
  await membersService.getMembers();
} catch (error) {
  if (error.response?.status === 404) {
    // Not found
  } else if (error.response?.status === 500) {
    // Server error
  } else if (!error.response) {
    // Network error
  }
}
```

### Validation Errors

```typescript
try {
  await authService.register(data);
} catch (error) {
  const validationErrors = error.response?.data?.errors;
  if (validationErrors) {
    // { field: 'email', message: 'Already exists' }
    validationErrors.forEach(err => {
      displayFieldError(err.field, err.message);
    });
  }
}
```

### HTTP Status Codes

| Code | Handling |
|------|----------|
| 200 | Success, show data |
| 201 | Created successfully |
| 400 | Bad request, show error |
| 401 | Unauthorized, redirect to login |
| 403 | Forbidden, redirect to /unauthorized |
| 404 | Not found, show "No data" |
| 409 | Conflict, show business error |
| 422 | Validation failed, show field errors |
| 500 | Server error, show generic error |

## Rate Limiting & Debouncing

### Search Debouncing

```typescript
const [search, setSearch] = useState('');

const debouncedSearch = useCallback(
  debounce((query: string) => {
    membersService.getMembers({ search: query });
  }, 500),
  []
);

const handleSearchChange = (query: string) => {
  setSearch(query);
  debouncedSearch(query);
};
```

## Pagination Pattern

```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
  membersService.getMembers({ page, limit: 20 })
    .then(res => {
      if (res.success) {
        setTotalPages(res.data.pagination.totalPages);
      }
    });
}, [page]);
```

## Handling Async Operations

### Loading States

```typescript
const [loading, setLoading] = useState(false);
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setSubmitting(true);
  try {
    await service.submit(data);
  } finally {
    setSubmitting(false);
  }
};
```

### Showing Toast Notifications

```typescript
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

const handleAction = async () => {
  try {
    await service.doSomething();
    toast({
      title: 'Success',
      description: 'Action completed',
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }
};
```

## API Documentation Reference

See `docs/api.md` in backend for complete API spec:

- `/auth` - Authentication endpoints
- `/members` - Member CRUD
- `/subscriptions` - Subscription management
- `/payments` - Payment recording
- `/classes` - Class schedules & bookings
- `/training` - Personal training sessions
- `/equipment` - Equipment & maintenance
- `/staff` - Staff management
- `/attendance` - Check-in/out
- `/analytics` - Reporting & KPIs

## Environment Variables

```bash
# Development (http://localhost:5000/api)
VITE_API_URL=http://localhost:5000/api

# Staging (https://staging-api.titansync.com/api)
VITE_API_URL=https://staging-api.titansync.com/api

# Production (https://api.titansync.com/api)
VITE_API_URL=https://api.titansync.com/api
```

## CORS Configuration

The backend should have CORS configured to accept requests from:
- `http://localhost:5173` (dev)
- `https://yourdomain.com` (production)

## Testing API Integration

### Manual Testing

1. Start backend: `npm run dev` (backend folder)
2. Start frontend: `npm run dev` (frontend folder)
3. Open browser DevTools → Network tab
4. Perform actions and inspect requests/responses

### Using Frontend Developer Tools

React DevTools can inspect:
- Component state (props, hooks)
- Context values (auth state)

Network tab shows:
- API requests (headers, payload)
- Responses (status, data)
- Timing

## Common Issues & Solutions

### API Not Responding
- Check backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `.env`
- Check Network tab for actual URL being requested

### CORS Errors
- Verify backend CORS configuration
- Check `Access-Control-Allow-Origin` header

### 401 Unauthorized
- Token may be expired
- Token stored locally but not in API client
- Call `authService.login()` to refresh

### Stale Data
- API returns cached data
- Add query parameters (e.g., `?t=timestamp`) to bust cache
- Or implement React Query for smart caching

## Next: Implement Additional Modules

With this base, you can quickly add:
1. **Payments**: Extend `paymentsService`
2. **Classes**: Create `classesService`
3. **Equipment**: Create `equipmentService`
4. **Analytics**: Create `analyticsService`

Each follows the same pattern → Fast integration!
