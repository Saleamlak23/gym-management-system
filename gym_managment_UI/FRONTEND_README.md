# 💪 GymPro - Gym Management System Frontend

An enterprise-grade React frontend for comprehensive gym and fitness club management. Built with **React 19**, **Tailwind CSS**, **Lucide-React icons**, and **Recharts** for stunning data visualization.

## 🎯 Features Overview

### **5 Core Modules**

#### 1. **Dashboard** 📊
- Global overview with 4 key summary cards:
  - Total Revenue
  - Total Members
  - Equipment Health
  - Active Classes
- Advanced metrics (Peak class time, Equipment downtime, Member churn rate)
- Interactive revenue & member trend charts
- Weekly class statistics visualization

#### 2. **Admin & Infrastructure** ⚙️
Comprehensive administration with 5 tabs:
- **Branches**: Manage gym locations
- **Staff**: Employee management with role assignment
- **Job Roles**: Define staff positions and permissions
- **Equipment**: Track all gym equipment with serial numbers
- **Maintenance**: Log and monitor equipment maintenance

#### 3. **Club Operations** 💼
Manage daily operations with 4 tabs:
- **Classes Master**: Create and manage fitness classes
- **Daily Schedules**: Schedule classes by time and instructor
- **Class Bookings**: Track member class registrations
- **Personal Training**: Manage one-on-one training sessions

#### 4. **Member & Finance** 💰
Complete membership and billing management:
- **Member Directory**: Member profiles and status tracking
- **Membership Plans**: Create and manage subscription tiers
- **Subscriptions**: Track active and expired memberships
- **Payment History**: Complete financial transaction logs
- **Attendance Logs**: Real-time member check-ins/check-outs

#### 5. **Reporting & Analytics** 📈
Data-driven insights with:
- Revenue vs. Expenses trend analysis
- Membership distribution pie charts
- Weekly class attendance metrics
- Equipment utilization rates
- Staff performance analytics
- Member growth and churn analysis
- Top-performing classes ranking
- Retention insights and recommendations

---

## 📁 Project Structure

```
Frontend/
├── types.ts                 # TypeScript interfaces for all entities
├── store.ts                 # Zustand global state management
├── Sidebar.tsx              # Navigation sidebar component
├── Header.tsx               # Top header with notifications
├── Dashboard.tsx            # Global dashboard landing page
├── DataTable.tsx            # Reusable professional data table
├── Drawer.tsx               # Side drawer for forms
├── AdminModule.tsx          # Admin & Infrastructure module
├── OperationsModule.tsx     # Club Operations module
├── MembersModule.tsx        # Members & Finance module
├── ReportingModule.tsx      # Reporting & Analytics module
└── GymApp.tsx               # Main application container

Key Files:
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── globals.css              # Global styles and animations
└── package.json             # Dependencies and scripts
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Framework | 19.2.6 |
| TypeScript | Type Safety | 6.0.2 |
| Tailwind CSS | Styling | Latest |
| Lucide-React | Icons | Latest |
| Zustand | State Management | Latest |
| Recharts | Data Visualization | Latest |
| Vite | Build Tool | 8.0.12 |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
cd gym_managment_UI
npm install tailwindcss postcss autoprefixer lucide-react zustand recharts
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

4. **Preview Production Build**
```bash
npm run preview
```

---

## 📊 Component Architecture

### **Sidebar Component** (`Sidebar.tsx`)
- Persistent left navigation menu
- 5 main modules + Settings + Logout
- Gradient styling with icons
- Mobile-responsive (hidden on small screens)
- Active tab highlighting

### **Header Component** (`Header.tsx`)
- Displays current module name
- Notification bell with counter
- User profile section
- Logout button
- Mobile menu toggle

### **DataTable Component** (`DataTable.tsx`)
Professional data table with:
- ✅ Multi-column sorting
- 🔍 Row-level search/filter
- ☑️ Bulk selection (checkboxes)
- 📑 Pagination controls
- 🎨 Status badges with color coding
- ✏️ Edit & Delete actions
- ⚡ Loading states
- Responsive design

### **Drawer Component** (`Drawer.tsx`)
- Side drawer for add/edit forms
- Overlay backdrop
- 3 width options (small/medium/large)
- Modal dialog for confirmations
- Smooth animations

---

## 🎨 Design System

### **Colors**
- **Primary**: Blue (#3b82f6) - Dashboard, Main CTA
- **Secondary**: Green (#10b981) - Operations
- **Accent**: Orange (#f59e0b) - Members & Finance
- **Danger**: Red (#ef4444) - Alerts, Maintenance
- **Purple**: #8b5cf6 - Admin
- **Text**: Gray-900 (#111827) - Primary text
- **Background**: Gray-100 (#f3f4f6) - Page background

### **Typography**
- **Headings**: Bold, large
- **Labels**: Medium weight, small size
- **Body**: Regular weight, medium size

### **Spacing**
- All padding/margin use Tailwind's scale (4px base)
- Consistent gaps between components (4, 6 units)

### **Border Radius**
- Small buttons/inputs: rounded-lg
- Cards: rounded-lg
- Large modals: rounded-lg

---

## 📋 Data Models

### Core Entities

```typescript
// Branch Management
Branch {
  id, name, address, phone, email, status, createdAt
}

// Staff Management
Staff {
  id, name, email, phone, roleId, branchId, status, hireDate
}

// Equipment Management
Equipment {
  id, name, categoryId, branchId, serialNumber, 
  purchaseDate, status, lastMaintenanceDate
}

// Membership Management
Member {
  id, firstName, lastName, email, phone, 
  joinDate, status, branchId
}

// Classes Management
ClassMaster {
  id, name, description, instructorId, 
  maxCapacity, duration, level
}

// Financial Management
PaymentHistory {
  id, memberId, subscriptionId, amount, 
  paymentDate, paymentMethod, status
}
```

---

## 🔄 State Management

Using **Zustand** for global state:

```typescript
useStore() {
  user              // Current logged-in user
  currentModule     // Active module (dashboard|admin|...)
  notifications     // Notification messages
  setUser()
  setCurrentModule()
  addNotification()
  removeNotification()
}
```

---

## 🎯 Key Features Breakdown

### **Role-Based Access** (Ready for integration)
- Admin: Full access to all modules
- Manager: Admin + Operations
- Staff: Operations only
- Member: Dashboard + Profile

### **Real-Time Search** 🔍
- Search across all data tables
- Filters work with sorting
- Bulk action support

### **Status Badges** 🏷️
Automatic color coding for:
- active (green)
- inactive (gray)
- maintenance (orange)
- on_leave (yellow)
- pending (blue)
- completed (green)
- failed (red)
- etc.

### **Form Management** 📝
- Modal + Drawer patterns
- React Hook Form ready
- Field validation ready
- Cancel/Save buttons

### **Charts & Analytics** 📊
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distribution
- All charts are responsive

---

## 🔐 Security Considerations

1. **User Authentication** - Ready for JWT integration
2. **Role-Based Access Control** - Component structure supports RBAC
3. **Input Validation** - Form fields ready for validation
4. **XSS Prevention** - React's built-in XSS protection
5. **CSRF Protection** - To be integrated with backend

---

## 🚦 API Integration Points

The frontend is ready to connect to these API endpoints:

```
GET    /api/branches
POST   /api/branches
PUT    /api/branches/:id
DELETE /api/branches/:id

GET    /api/staff
POST   /api/staff
PUT    /api/staff/:id

GET    /api/members
POST   /api/members
PUT    /api/members/:id

GET    /api/classes
GET    /api/schedules
GET    /api/bookings

GET    /api/payments
GET    /api/subscriptions

GET    /api/reports/revenue
GET    /api/reports/attendance
GET    /api/reports/analytics
```

---

## 📱 Responsive Design

- **Desktop**: Full sidebar visible, multi-column layouts
- **Tablet**: Sidebar toggleable, 2-column grids
- **Mobile**: Hamburger menu, 1-column layouts
- All data tables are horizontally scrollable on small screens

---

## ♿ Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3...)
- Color contrast compliance (WCAG AA)
- Keyboard navigation ready
- Focus indicators on interactive elements
- ARIA labels ready for implementation

---

## 🎓 How to Extend

### **Adding a New Module**
1. Create `YourModule.tsx` in `/Frontend`
2. Add to types.ts if new data types needed
3. Import in `GymApp.tsx`
4. Add tab navigation in Sidebar

### **Adding a New Data Table**
```typescript
<DataTable
  columns={columnDefinitions}
  data={yourData}
  title="Your Table"
  onAddNew={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### **Adding a New Chart**
```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={yourData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Line dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

---

## 🐛 Troubleshooting

### Tailwind CSS Not Applied
- Ensure `tailwind.config.js` content paths are correct
- Run `npm run dev` to rebuild
- Check that `globals.css` is imported in `main.tsx`

### Icons Not Showing
- Verify Lucide-React is installed: `npm install lucide-react`
- Check icon name spelling (they're case-sensitive)

### State Not Persisting
- Zustand store is in-memory only
- Integrate with localStorage for persistence
- Connect to backend API for server-side state

---

## 📞 Support & Contribution

For issues or enhancements:
1. Check existing components for patterns
2. Follow the established naming conventions
3. Use TypeScript for type safety
4. Test responsive design

---

## 📄 License

[Your License Here]

---

## 🎉 Quick Start Checklist

- [x] React 19 setup
- [x] Tailwind CSS configured
- [x] 5 main modules built
- [x] Professional data tables
- [x] Global dashboard
- [x] Charts and analytics
- [x] Form components (Drawer/Modal)
- [x] Sidebar navigation
- [x] Header with notifications
- [x] Zustand state management
- [ ] API integration
- [ ] Authentication system
- [ ] Role-based access control
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states

---

**Built with ❤️ for Gym Management Excellence**
