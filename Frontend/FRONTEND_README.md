# TitanSync Frontend - Gym Management System

A production-ready React frontend for the TitanSync multi-location gym management system. Built with Vite, TypeScript, React Router, and Tailwind CSS.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run typecheck

# Lint code
npm run lint
```

The dev server runs on `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, DataTable, etc.)
│   └── ProtectedRoute.tsx # Route protection wrapper
├── context/
│   └── AuthContext.tsx   # Global authentication state
├── pages/
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── AdminDashboard.tsx # Admin home dashboard
│   ├── Unauthorized.tsx  # Access denied page
│   └── admin/            # Admin-specific pages
│       ├── MembersListPage.tsx # Members list with filters
│       └── MemberDetailPage.tsx # Member profile & details
├── services/
│   ├── auth.service.ts   # Authentication API calls
│   └── members.service.ts # Members/subscriptions API calls
├── context/
│   └── AuthContext.tsx   # Auth state management
├── lib/
│   └── api.ts           # Axios instance with interceptors
├── types/
│   └── index.ts         # TypeScript type definitions
├── hooks/
├── utils/
└── App.tsx              # Main app with routing
```

## Key Features

### Authentication
- Login & registration forms with validation
- JWT token management with localStorage persistence
- Protected routes with role-based access control
- Session restoration on page refresh
- Automatic redirect to login on token expiry (401)

### Members Management
- **Members List**: Searchable, filterable table with pagination
  - Real-time search by name/email
  - Filter by subscription status (active, expired, cancelled, frozen)
  - Click row to view details
  
- **Member Details**: Comprehensive member profile
  - Profile information (name, email, phone, join date)
  - Subscription history with status badges
  - Visit count and engagement metrics
  - Tabbed interface for organized information

### Design System
- **UI Components**:
  - `Button` - Primary, secondary, and outline variants
  - `Input` - Text input with label support
  - `Card` - Container component
  - `DataTable` - Sortable, paginated data display
  - `StatCard` - KPI display with trends
  - `PageWrapper` - Consistent page layout
  
- **Design Tokens**:
  - Color system: Blue, slate, green, red, yellow palettes
  - 8px spacing system
  - Responsive breakpoints (sm, md, lg, xl, 2xl)
  - Smooth transitions and hover states

### Architecture Highlights

**API Client** (`lib/api.ts`)
- Centralized Axios instance
- Token injection middleware
- 401 redirect on auth failure
- Consistent error handling

**Auth Context** (`context/AuthContext.tsx`)
- Global user state management
- Login/logout functions
- Session persistence
- Role-based access control

**Type Safety**
- Full TypeScript support
- Comprehensive type definitions for all API responses
- Strict null checking enabled

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` (configurable via `VITE_API_URL` in `.env`).

### Available Services

**Auth Service** (`services/auth.service.ts`)
```typescript
authService.login(email, password)
authService.register(data)
authService.getCurrentUser()
authService.logout()
```

**Members Service** (`services/members.service.ts`)
```typescript
membersService.getMembers(params)        // List all members
membersService.getMember(id)             // Get single member
membersService.updateMember(id, data)    // Update member
membersService.deleteMember(id)          // Deactivate member
membersService.getSubscriptions(id)      // Member's subscription history
membersService.createSubscription(id, data)
membersService.updateSubscriptionStatus(memberId, subId, status)
```

## Environment Configuration

Create `.env` file in project root:

```
VITE_API_URL=http://localhost:5000/api
```

## Routing Map

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/unauthorized` - Access denied page

### Protected Routes (Enterprise Admin)
- `/admin` - Admin dashboard with KPIs
- `/admin/members` - Members list
- `/admin/members/:id` - Member details

### Future Routes (Placeholders Ready)
- `/branch` - Branch manager dashboard
- `/branch/classes` - Class schedules
- `/branch/attendance` - Attendance log
- `/branch/equipment` - Equipment management
- `/staff` - Staff portal
- `/member` - Member portal

## Authentication Flow

1. User visits app → `AuthProvider` restores session from localStorage
2. Protected routes check `isAuthenticated` → redirect to `/login` if needed
3. User logs in → token stored, user data cached in context
4. Token automatically added to all API requests
5. Token expiry (401) → automatic redirect to `/login`

## Role-Based Access Control

```typescript
<ProtectedRoute allowedRoles={['enterprise_admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

Supported roles:
- `member` - Gym members
- `staff` - Staff members
- `trainer` - Personal trainers
- `branch_manager` - Branch managers
- `enterprise_admin` - System administrators

## Data Tables

Tables support:
- Column rendering customization
- Row click handlers for navigation
- Pagination controls
- Loading states
- Empty state messages

Example:
```typescript
<DataTable
  columns={columns}
  data={members}
  loading={loading}
  onRowClick={(row) => navigate(`/admin/members/${row.member_id}`)}
  pagination={{
    currentPage: page,
    totalPages,
    onPageChange: setPage,
  }}
/>
```

## Form Handling

The project uses React Hook Form + Zod for validation (already installed). Example:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, errors } = useForm({
  resolver: zodResolver(schema)
});
```

## Styling

- **Framework**: Tailwind CSS
- **Component Library**: shadcn/ui preinstalled
- **Icons**: Lucide React
- **Responsive**: Mobile-first design with breakpoints

Classes follow Tailwind conventions:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari 14+
- Edge (latest)

## Performance

- Code splitting via Vite
- Tree-shaking enabled
- Lazy route loading ready
- Image optimization via Vite
- CSS purging (Tailwind)

## Next Steps

1. **Start backend API**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend dev server**
   ```bash
   npm run dev
   ```

3. **Login with demo credentials**
   - Email: `admin@gym.com`
   - Password: `Demo@123`

4. **Extend with additional modules**:
   - Classes & bookings
   - Payments & billing
   - Equipment management
   - Attendance tracking
   - Staff management
   - Analytics dashboards

## Troubleshooting

**Port 5173 already in use**
```bash
npm run dev -- --port 5174
```

**API connection errors**
- Verify backend is running on http://localhost:5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

**TypeScript errors**
```bash
npm run typecheck
```

**Build errors**
```bash
npm run lint  # Check for linting issues
npm run build  # Full build with verbose output
```

## Production Deployment

Build for production:
```bash
npm run build
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

Set production environment variables before deployment:
```
VITE_API_URL=https://your-api-domain.com/api
```

## Contributing

- Follow existing code style and conventions
- Use TypeScript for type safety
- Create components in `src/components/ui/`
- Create page components in `src/pages/`
- Add types to `src/types/index.ts`
- Test components before committing

## License

MIT
