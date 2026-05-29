# TitanSync Frontend Architecture

## Overview

This frontend is designed as a modular, scalable React application with clear separation of concerns. It follows a feature-based folder structure with centralized state management and API integration.

## Core Architecture Layers

### 1. **UI Layer** (`src/components/`)
Reusable, presentational components with no business logic.

- **UI Components** (`components/ui/`): Generic, unopinionated components
  - `Button.tsx` - Styled button variants
  - `Input.tsx` - Form input
  - `DataTable.tsx` - Paginated table renderer
  - `StatCard.tsx` - Metric card for dashboards
  - `PageWrapper.tsx` - Page layout container
  - `ProtectedRoute.tsx` - Route guard component

- **Design Principles**:
  - Single Responsibility Principle
  - Props-based customization
  - No direct API calls
  - Pure components where possible

### 2. **Page Layer** (`src/pages/`)
Page components that combine multiple UI components and manage local state.

```
pages/
├── Login.tsx                  # Public auth page
├── Register.tsx               # Public registration
├── AdminDashboard.tsx         # Admin home
└── admin/
    ├── MembersListPage.tsx    # Members CRUD list
    └── MemberDetailPage.tsx   # Member detail view
```

Page components:
- Fetch data from services
- Handle page-level state
- Coordinate component layout
- Navigate between routes

### 3. **State Management** (`src/context/`)

**AuthContext** - Global authentication state
```
├── User data (id, email, role, etc.)
├── JWT token
├── Authentication methods (login, logout, register)
├── Session persistence
└── Role-based access control
```

Pattern: Context + Hooks
- Minimal, focused scope
- Avoids prop drilling
- Easy to extend with useReducer for complex state

### 4. **API Layer** (`src/services/` + `src/lib/`)

**API Client** (`lib/api.ts`)
- Axios instance
- Token injection middleware
- Error handling (auto-redirect on 401)
- Base URL configuration

**Service Modules** (`services/`)
- `auth.service.ts` - Authentication endpoints
- `members.service.ts` - Members/subscriptions
- Future: payments, classes, equipment, etc.

Pattern: Per-feature service modules
```typescript
// Encapsulates all API calls for a domain
export const membersService = {
  getMembers(),
  getMember(),
  updateMember(),
  // ...
}
```

### 5. **Type Safety** (`src/types/`)

Comprehensive TypeScript definitions for:
- API responses and requests
- User roles and permissions
- Domain entities (Member, Subscription, etc.)
- Form data shapes

Benefits:
- IDE autocomplete
- Compile-time type checking
- Self-documenting code
- Refactoring safety

### 6. **Routing** (`App.tsx`)

React Router v6 setup with:
- Route-level code splitting ready
- Protected route wrapper
- Role-based access control
- Redirect on auth failure

## Data Flow

```
User Action
    ↓
Page Component
    ↓
Service Layer (API call)
    ↓
API Client (token injection, error handling)
    ↓
Backend API
    ↓
Response → Service returns typed data
    ↓
Page Component (setState)
    ↓
UI Re-renders
```

## State Management Strategy

### Local State (useState)
- Page-specific UI state (filters, sort, pagination)
- Form inputs
- Loading/error states
- Modal open/close

### Global State (Context)
- Authentication (user, token)
- App settings (theme, language) - future
- User preferences - future

### Server State
- API response data (members, subscriptions, etc.)
- Fetched on demand, not cached
- Fresh data fetched when needed

## Authentication Flow

```
App Mount
  ↓
AuthProvider useEffect
  ↓
Check localStorage for token
  ↓
If token exists:
  - Set token in API client
  - Call GET /auth/me
  - Update user state
  ↓
Protected routes check isAuthenticated
  ↓
Not authenticated? → Redirect to /login
Wrong role? → Redirect to /unauthorized
✓ Allowed? → Render page
```

## API Error Handling

```
Service layer catches errors
  ↓
Check error type:
  - 401 Unauthorized → Clear token, redirect to login
  - 422 Validation → Return errors to component
  - 4xx/5xx → Display toast notification
  ↓
Component handles errors
  - Show user-friendly message
  - Update loading state
  - Offer retry option
```

## Component Patterns

### Page Component Pattern
```typescript
// 1. Fetch data on mount
useEffect(() => {
  loadData();
}, [dependencies]);

// 2. Manage state
const [data, setData] = useState();
const [loading, setLoading] = useState(true);
const [error, setError] = useState();

// 3. Render with layout
return (
  <PageWrapper>
    {/* Loading? Error? Render accordingly */}
    <UIComponent data={data} />
  </PageWrapper>
);
```

### Service Module Pattern
```typescript
export const serviceModule = {
  async apiCall(params) {
    const response = await apiClient.get('/endpoint');
    return response.data; // Typed!
  }
};
```

### Protected Route Pattern
```typescript
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <AdminPage />
</ProtectedRoute>
```

## Scalability Considerations

### Current Architecture Scales To:
- 10+ pages ✓
- Multiple user roles ✓
- Complex forms ✓
- Large data tables ✓

### When to Add:
- **Redux/Zustand**: If multiple pages share complex state
- **React Query**: If significant server state caching needed
- **Storybook**: When component library grows
- **E2E Tests**: Before major feature launches

## Folder Structure Rules

1. **One file per component** (unless tightly coupled)
2. **Exports in index.ts** for barrel imports
3. **Services are domain-focused** (not per-endpoint)
4. **Pages are route-mapped** (mirror router structure)
5. **Types co-located** with usage (or in types/index.ts)

## Adding a New Feature

### Step 1: Add Types
```typescript
// src/types/index.ts
export interface NewEntity { /* ... */ }
export interface NewRequest { /* ... */ }
```

### Step 2: Create Service
```typescript
// src/services/new-feature.service.ts
export const newFeatureService = {
  async getItems() { /* ... */ },
  async createItem(data) { /* ... */ },
};
```

### Step 3: Create Pages
```typescript
// src/pages/NewFeatureList.tsx
// src/pages/NewFeatureDetail.tsx
```

### Step 4: Add Routes
```typescript
// src/App.tsx
<Route path="/feature" element={<NewFeatureList />} />
```

### Step 5: Create UI Components (if needed)
```typescript
// src/components/ui/NewFeatureCard.tsx
```

## Performance Optimization

### Code Splitting
- Routes split automatically via Vite
- Dynamic imports ready for components

### Bundle Size
- Tree-shake unused code: `npm run build`
- Check bundle: `npm run build -- --analyze` (if plugin installed)

### Rendering
- Memoization with `React.memo()` for list items
- useCallback for callbacks passed to children
- useMemo for expensive computations

### Data Fetching
- Request cancellation on component unmount
- Debounce search inputs
- Pagination to avoid loading all data

## Testing Strategy

### Unit Tests
- Service functions (pure logic)
- Utility functions
- Component logic

### Integration Tests
- Full page flows
- Auth flows
- Form submission

### E2E Tests
- Critical user paths
- Login → Navigate → Submit form

## Debugging

### Browser DevTools
- React DevTools for state inspection
- Redux DevTools (if added later)
- Network tab for API calls

### Console Logging
```typescript
console.log('Component state:', state);
console.error('API Error:', error);
```

### TypeScript Checking
```bash
npm run typecheck
```

## Common Patterns

### Loading State
```typescript
if (loading) return <Skeleton />;
if (error) return <Error message={error} />;
return <Data data={data} />;
```

### Search & Filter
```typescript
const [query, setQuery] = useState('');
useEffect(() => {
  loadFiltered(query);
}, [query]);
```

### Pagination
```typescript
const [page, setPage] = useState(1);
pagination={{ currentPage: page, onPageChange: setPage }}
```

### Async Form Submit
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await service.submit(data);
    showSuccess();
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Deployment Checklist

- [ ] Run `npm run build` succeeds
- [ ] Run `npm run typecheck` passes
- [ ] Run `npm run lint` passes
- [ ] Environment variables configured
- [ ] API URL points to production
- [ ] Tested in production-like environment
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Auth flow tested end-to-end

## Architecture Diagrams

### Request Flow
```
Page → Service → API Client → Backend
                           ↓
                      Response (typed)
                           ↓
                      Page (setState)
                           ↓
                      Component Render
```

### Auth Flow
```
Login Page
    ↓
authService.login()
    ↓
API Client POST /auth/login
    ↓
Backend validates
    ↓
Token + User data returned
    ↓
AuthContext updates
    ↓
Redirect to Dashboard
```

### Route Protection
```
Navigate to /admin
    ↓
<ProtectedRoute>
    ↓
isAuthenticated? NO → Redirect /login
             YES → role allowed? NO → Redirect /unauthorized
                            YES → Render page
```

This architecture balances simplicity for small/medium projects with scalability for growth.
