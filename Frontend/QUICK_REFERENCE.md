# Frontend Quick Reference Guide

## 🗂️ New Files Created

### Components
```
src/components/Sidebar.tsx           # Main navigation sidebar
src/components/Skeleton.tsx          # Loading skeleton loaders
src/components/ErrorBoundary.tsx     # Error handling wrapper
```

### Pages
```
src/pages/admin/EquipmentPage.tsx    # Equipment management
src/pages/admin/ClassesPage.tsx      # Class schedules & booking
src/pages/admin/StaffPage.tsx        # Staff directory
src/pages/admin/AnalyticsPage.tsx    # Analytics dashboard
```

### Services
```
src/services/equipment.service.ts    # Equipment API client
src/services/classes.service.ts      # Classes API client
src/services/staff.service.ts        # Staff API client
```

### Hooks
```
src/hooks/useExportData.ts           # CSV/JSON export utility
```

### Documentation
```
FRONTEND_IMPROVEMENTS.md             # Detailed feature docs
FRONTEND_CHANGES_SUMMARY.md          # This quick summary
```

---

## 🎯 How to Use Each Component

### 1. Sidebar Navigation
```tsx
// Already integrated in App.tsx's LayoutWrapper
// Shows automatically for authenticated users
// Filters menu items by user role
```

**Features:**
- Click items to navigate
- Click chevron to collapse
- See active page highlighted
- View user profile
- Quick logout button

**Accessible to:**
- enterprise_admin ✅
- branch_manager ✅
- trainer ✅ (classes only)
- staff ✅ (members & equipment)
- member ✅ (classes only)

---

### 2. Equipment Page
**URL:** `/admin/equipment`

```tsx
// Features:
- Search equipment by name
- Filter by category
- View status (operational, maintenance, damaged, retired)
- Pagination
- Loading skeletons
```

**Requires:** `enterprise_admin` or `branch_manager` or `staff`

---

### 3. Classes Page
**URL:** `/admin/classes`

```tsx
// Features:
- Date picker to filter classes
- View trainer info
- See capacity/enrollment
- Booking button
- Visual progress bars
```

**Requires:** `enterprise_admin` or `branch_manager` or `trainer` or `member`

---

### 4. Staff Page
**URL:** `/admin/staff`

```tsx
// Features:
- Search by name or email
- Filter by role (Trainer, Staff, Manager, Admin)
- View branch assignment
- Status indicators
- Contact information
```

**Requires:** `enterprise_admin` or `branch_manager`

---

### 5. Analytics Page
**URL:** `/admin/analytics`

```tsx
// Features:
- Line chart: Monthly revenue
- Bar chart: Member growth
- Pie chart: Class occupancy
- Top classes table with progress
- KPI cards at top
```

**Requires:** `enterprise_admin` or `branch_manager`

---

### 6. Members Export
**On:** `/admin/members` page

```tsx
// New buttons at top right:
// CSV - Downloads as CSV file
// JSON - Downloads as JSON file

// Example usage:
const { exportToCSV, exportToJSON } = useExportData();
exportToCSV('members', memberData);
exportToJSON('members', memberData);
```

---

## 🔌 API Integration

Each page has a corresponding service:

### Equipment Service
```tsx
import { equipmentService } from '@/services/equipment.service';

// Methods:
equipmentService.getEquipment(params)          // List with pagination
equipmentService.getEquipmentById(id)          // Get single item
equipmentService.updateEquipmentStatus(id, status)
equipmentService.logMaintenance(id, data)
equipmentService.getOverdueEquipment()
```

### Classes Service
```tsx
import { classesService } from '@/services/classes.service';

// Methods:
classesService.getSchedules(params)            // List schedules
classesService.bookClass(scheduleId)           // Book class
classesService.cancelBooking(bookingId)        // Cancel booking
classesService.getMyBookings()                 // User's bookings
classesService.createSchedule(data)            // Add class session
classesService.cancelSchedule(scheduleId)
```

### Staff Service
```tsx
import { staffService } from '@/services/staff.service';

// Methods:
staffService.getStaffList(params)              // List staff
staffService.getStaffById(id)                  // Get details
staffService.getStaffSchedule(id)              // View schedule
staffService.getPayrollEstimate(id)            // Payroll calc
staffService.createStaff(data)                 // Add staff
staffService.updateStaff(id, data)             // Edit staff
staffService.deactivateStaff(id)               // Remove staff
```

---

## 🎨 Styling

All components use **Tailwind CSS** and **shadcn/ui**.

### Color System

**Status Colors:**
- Green: Active/Operational/Complete
- Red: Inactive/Expired/Damaged
- Yellow: Maintenance/Warning/On Leave
- Gray: Cancelled/Retired/Inactive
- Blue: Primary/Active route

**Examples:**
```tsx
// Use these for badges:
'bg-green-100 text-green-800'   // Active
'bg-red-100 text-red-800'       // Inactive
'bg-yellow-100 text-yellow-800' // Warning
'bg-slate-100 text-slate-800'   // Default
```

---

## 📱 Responsive Breakpoints

```tsx
// Grid layouts adapt automatically:
// Mobile (320px+):  1 column
// Tablet (768px+):  2 columns
// Desktop (1024px+): 3+ columns

// Example:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🧪 Testing Pages

### Quick Test Flow:
1. **Login Page**
   ```
   Email: admin@gym.com
   Password: Demo@123
   ```

2. **Dashboard** → See all KPIs
3. **Members** → Search, Filter, Export
4. **Staff** → View staff directory
5. **Equipment** → Check equipment status
6. **Classes** → View & book classes
7. **Analytics** → See charts & trends

---

## 🐛 Error Handling

### Error Boundary
```tsx
// Automatically catches errors
// Shows user-friendly error screen
// Has recovery button to retry
```

### API Errors
```tsx
// Each service catches API errors
// Check console for details
// Use toast notifications for user feedback
```

---

## ⚡ Performance Tips

1. **Loading States**
   ```tsx
   import { Skeleton, TableSkeleton } from '@/components/Skeleton';
   
   if (loading) {
     return <TableSkeleton rows={5} cols={5} />;
   }
   ```

2. **Pagination**
   ```tsx
   // All lists use pagination
   // Reduces initial load
   // Better performance
   ```

3. **Lazy Routes**
   ```tsx
   // Components are ready for lazy loading
   // Just wrap with React.lazy() when needed
   ```

---

## 🔐 Access Control

### Check User Role
```tsx
import { useAuth } from '@/context/AuthContext';

export const MyComponent = () => {
  const { user } = useAuth();
  
  if (user?.role === 'enterprise_admin') {
    // Show admin features
  }
};
```

### Protect Routes
```tsx
<Route
  path="/admin/equipment"
  element={
    <ProtectedRoute allowedRoles={['enterprise_admin', 'staff']}>
      <EquipmentPage />
    </ProtectedRoute>
  }
/>
```

---

## 📚 Documentation

- **FRONTEND_IMPROVEMENTS.md** - Detailed feature documentation
- **FRONTEND_README.md** - Setup & architecture guide
- **This file** - Quick reference

---

## 🚀 Next Development Steps

1. **Connect to Backend APIs**
   - Replace mock data with real API calls
   - Test data flow end-to-end

2. **Add Real-time Updates**
   - WebSocket integration
   - Live occupancy updates

3. **Enhance Features**
   - Bulk member operations
   - Staff scheduling calendar
   - Equipment maintenance alerts

4. **Mobile Optimization**
   - Test on actual devices
   - Optimize touch interactions

5. **Performance**
   - Add React.lazy() for routes
   - Optimize image sizes
   - Monitor bundle size

---

## 🆘 Troubleshooting

### Sidebar doesn't show?
→ Make sure you're logged in
→ Check user role in browser console

### Pages don't load?
→ Check if backend API is running
→ Verify VITE_API_URL in .env
→ Check browser console for errors

### Export buttons disabled?
→ No data to export
→ Try loading data first

### Charts not showing?
→ Mock data in AnalyticsPage.tsx
→ Replace with real API data

---

## 📞 Support

For issues or improvements:
1. Check error boundary message
2. Open browser console for details
3. Review service error responses
4. Check backend API logs
5. Verify database connection

---

**Version:** 1.0.0
**Last Updated:** 2026-05-29
**Maintained By:** Frontend Enhancement Initiative
