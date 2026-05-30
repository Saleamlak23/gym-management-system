# Quick Start Guide - Frontend Development

## Running the Application

### 1. Start the Development Server
```bash
cd my-app
npm run dev
```

The server will start on `http://localhost:5173` (or next available port)

### 2. Open in Browser
Navigate to the displayed URL and you'll see the login page.

### 3. Test the Application

#### Option A: Manual Testing
- Click "Sign up here" to create a test account
- Login with your credentials
- Explore different dashboards based on your role

#### Option B: Using Mock Data
The pages use mock data by default, so you can:
- Navigate to `/login` and see the login form
- Navigate to `/register` for registration
- Check any page like `/admin` (will redirect to login)
- All table data and dashboards show sample data

## Available Routes

### Public Routes
- `http://localhost:5173/login` - Login page
- `http://localhost:5173/register` - Registration page

### Admin Routes (requires enterprise_admin role)
- `/admin` - Dashboard with KPIs
- `/admin/members` - Member management
- `/admin/members/:id` - Member details
- `/admin/payments` - Payment records
- `/admin/branches` - Branch list
- `/admin/staff` - Staff directory
- `/admin/analytics` - Analytics

### Branch Manager Routes
- `/branch` - Branch dashboard
- `/branch/classes` - Class schedule
- `/branch/attendance` - Attendance log
- `/branch/equipment` - Equipment list

### Staff Routes
- `/staff` - Staff home
- `/staff/checkin` - Check-in desk
- `/staff/training` - Training sessions

### Member Routes
- `/member` - Member portal
- `/member/bookings` - Class bookings
- `/member/sessions` - Training sessions
- `/member/payments` - Payment history

## Project Structure

```
my-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Spinner.tsx
│   │   ├── PageWrapper.tsx
│   │   ├── StatCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   │
│   ├── pages/              # Feature pages (21 pages)
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── MemberList.tsx
│   │   ├── MemberDetail.tsx
│   │   ├── MemberPortal.tsx
│   │   ├── Payments.tsx
│   │   ├── MyPayments.tsx
│   │   ├── MyBookings.tsx
│   │   ├── MySessions.tsx
│   │   ├── ClassSchedule.tsx
│   │   ├── Equipment.tsx
│   │   ├── Attendance.tsx
│   │   ├── CheckInDesk.tsx
│   │   ├── TrainingSessions.tsx
│   │   ├── BranchDashboard.tsx
│   │   ├── StaffHome.tsx
│   │   ├── StaffList.tsx
│   │   ├── Branches.tsx
│   │   ├── Unauthorized.tsx
│   │   └── index.ts
│   │
│   ├── services/           # API client services
│   │   ├── auth.service.ts
│   │   ├── members.service.ts
│   │   ├── payments.service.ts
│   │   ├── classes.service.ts
│   │   ├── training.service.ts
│   │   ├── attendance.service.ts
│   │   ├── equipment.service.ts
│   │   └── staff.service.ts
│   │
│   ├── context/            # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── styles/             # CSS files
│   │   ├── index.css
│   │   ├── components.css
│   │   ├── auth.css
│   │   ├── members.css
│   │   ├── payments.css
│   │   ├── dashboard.css
│   │   ├── portal.css
│   │   ├── checkin.css
│   │   ├── bookings.css
│   │   ├── sessions.css
│   │   ├── classes.css
│   │   ├── equipment.css
│   │   └── attendance.css
│   │
│   ├── App.tsx             # Main router configuration
│   ├── main.tsx            # Entry point
│   └── hooks/              # Custom hooks (extensible)
│
├── .env                    # Environment variables
├── .env.example            # Example env file
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
├── index.html              # HTML template
└── IMPLEMENTATION.md       # Detailed implementation guide
```

## Key Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control
- Protected routes with automatic redirects
- Login and registration forms

### 💾 State Management
- React Context for auth state
- No prop drilling thanks to Context
- Modular service layer for API calls

### 📱 Responsive Design
- Mobile-first CSS approach
- Works on all screen sizes
- Tablet-friendly interfaces (check-in desk)
- Responsive grids and layouts

### 🎨 UI Components
- 12 production-ready components
- Consistent styling system
- Professional color scheme
- Accessible form elements

### 📊 Data Tables
- Sortable columns
- Loading states
- Empty state handling
- Responsive table wrapper

## Build Commands

```bash
# Development
npm run dev        # Start dev server

# Production
npm run build      # Build for production
npm run preview    # Preview production build

# Code Quality
npm run lint       # Run ESLint
```

## Customization

### Change Colors
Edit `src/styles/components.css` CSS custom properties:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --danger-color: #ef4444;
  /* ... etc */
}
```

### Add New Page
1. Create file in `src/pages/`
2. Export from `src/pages/index.ts`
3. Add route in `App.tsx`
4. Create page-specific CSS in `src/styles/`

### Add New Component
1. Create file in `src/components/`
2. Export from `src/components/index.ts`
3. Add component-specific CSS in `src/styles/components.css`

### Add New API Service
1. Create file in `src/services/`
2. Use Axios instance from existing services
3. Export functions for use in pages

## Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite automatically tries the next port (5174, 5175, etc.)

### Build Errors
- Delete `node_modules` and run `npm install`
- Clear `dist/` folder: `rm -rf dist`
- Check TypeScript: Run `tsc --noEmit`

### API Connection Issues
- Verify backend is running on port 5000
- Check `.env` file has correct `VITE_API_URL`
- Check browser console for CORS errors

## Next Steps

1. **Connect Backend**: Update API service URLs when backend is ready
2. **Add Real Data**: Replace mock data in pages with actual API calls
3. **Implement Charts**: Add charting library for analytics dashboards
4. **Add Notifications**: Toast/notification system for user feedback
5. **Write Tests**: Add Jest tests for components and services
6. **Performance**: Code splitting and lazy loading for large apps

## Support Files

- `IMPLEMENTATION.md` - Comprehensive implementation details
- `.env.example` - Example environment variables
- TypeScript config files - Type safety configuration

---

**Ready to code!** 🚀
