# 💻 GymPro Frontend - Code Examples & Quick Reference

## 🚀 Quick Start Examples

### Example 1: Using DataTable Component

```typescript
import { DataTable, DataTableColumn } from '../DataTable';

const StaffTable: React.FC = () => {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const staffData = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@gym.com', status: 'active' },
    // ... more data
  ];

  return (
    <DataTable
      columns={columns}
      data={staffData}
      title="Staff Members"
      onAddNew={() => console.log('Add new')}
      onEdit={(row) => console.log('Edit', row)}
      onDelete={(row) => console.log('Delete', row)}
      searchable={true}
      sortable={true}
    />
  );
};
```

### Example 2: Using Drawer Component

```typescript
import { Drawer } from '../Drawer';
import { useState } from 'react';

const StaffForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Staff</button>

      <Drawer
        isOpen={isOpen}
        title="Add New Staff Member"
        onClose={() => setIsOpen(false)}
        width="medium"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-3 pt-6 border-t">
            <button className="flex-1 px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
};
```

### Example 3: Using Zustand Store

```typescript
import { useStore } from '../store';

const MyComponent: React.FC = () => {
  const { user, currentModule, setCurrentModule, addNotification } = useStore();

  const handleModuleChange = (module: string) => {
    setCurrentModule(module as any);
    addNotification('Module changed successfully!');
  };

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Current Module: {currentModule}</p>
      <button onClick={() => handleModuleChange('admin')}>
        Go to Admin
      </button>
    </div>
  );
};
```

### Example 4: Creating a Chart

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart: React.FC = () => {
  const data = [
    { month: 'Jan', revenue: 150000 },
    { month: 'Feb', revenue: 165000 },
    { month: 'Mar', revenue: 155000 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Example 5: Adding a New Tab Module

```typescript
import React, { useState } from 'react';

export const MyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');

  const tabs = [
    { id: 'tab1', label: 'Tab 1', icon: '📋' },
    { id: 'tab2', label: 'Tab 2', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'tab1' && <div>Content for Tab 1</div>}
        {activeTab === 'tab2' && <div>Content for Tab 2</div>}
      </div>
    </div>
  );
};
```

---

## 🎨 Tailwind CSS Quick Classes

### Spacing
```
p-4       // padding
m-6       // margin
gap-4     // gap between items
space-y-4 // vertical spacing
```

### Colors
```
bg-blue-600       // Background blue
text-gray-900     // Text dark gray
border-gray-300   // Border light gray
hover:bg-blue-700 // Hover effect
```

### Layout
```
flex          // Flexbox
grid          // CSS Grid
w-full        // Width 100%
h-screen      // Height 100vh
justify-between // Space between
items-center  // Vertical center
```

### Responsive
```
md:grid-cols-2      // 2 columns on medium+
lg:block             // Block on large+
hidden md:flex       // Hidden by default, flex on medium+
```

---

## 📊 Status Badge Colors

```typescript
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',      // Green
    inactive: 'bg-gray-100 text-gray-800',      // Gray
    maintenance: 'bg-orange-100 text-orange-800', // Orange
    on_leave: 'bg-yellow-100 text-yellow-800',  // Yellow
    pending: 'bg-blue-100 text-blue-800',       // Blue
    completed: 'bg-green-100 text-green-800',   // Green
    cancelled: 'bg-red-100 text-red-800',       // Red
    confirmed: 'bg-green-100 text-green-800',   // Green
    in_progress: 'bg-blue-100 text-blue-800',   // Blue
    scheduled: 'bg-blue-100 text-blue-800',     // Blue
    attended: 'bg-green-100 text-green-800',    // Green
    expired: 'bg-red-100 text-red-800',         // Red
    failed: 'bg-red-100 text-red-800',          // Red
    suspended: 'bg-red-100 text-red-800',       // Red
    retired: 'bg-gray-100 text-gray-800'        // Gray
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
```

---

## 🔄 API Integration Pattern

```typescript
import { useEffect, useState } from 'react';

export const useFetchData = (url: string) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Usage in a component:
export const StaffList: React.FC = () => {
  const { data: staffData, loading } = useFetchData('/api/staff');

  return (
    <DataTable
      columns={staffColumns}
      data={staffData}
      title="Staff Members"
      loading={loading}
    />
  );
};
```

---

## 📝 Form Validation Pattern

```typescript
import { useForm } from 'react-hook-form';

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
}

export const StaffFormWithValidation: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<StaffFormData>();

  const onSubmit = (data: StaffFormData) => {
    console.log('Form data:', data);
    // Send to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Submit
      </button>
    </form>
  );
};
```

---

## 🎯 Conditional Rendering Patterns

```typescript
// Pattern 1: If-else
{currentModule === 'admin' && <AdminModule />}
{currentModule === 'operations' && <OperationsModule />}

// Pattern 2: Switch statement
switch(currentModule) {
  case 'admin':
    return <AdminModule />;
  case 'operations':
    return <OperationsModule />;
  default:
    return <Dashboard />;
}

// Pattern 3: Ternary
{isLoading ? <LoadingSpinner /> : <Content />}

// Pattern 4: Logical AND
{isVisible && <Component />}
```

---

## 🔍 Search & Filter Pattern

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [filteredData, setFilteredData] = useState(data);

useEffect(() => {
  const filtered = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  setFilteredData(filtered);
}, [searchTerm, data]);

return (
  <>
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
    <DataTable data={filteredData} columns={columns} />
  </>
);
```

---

## 🌙 Dark Mode Support (Ready)

```typescript
// Add to globals.css
@media (prefers-color-scheme: dark) {
  body {
    @apply bg-gray-900 text-white;
  }
}

// Use in components
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

---

## ⚡ Performance Optimization

```typescript
// Memoization for expensive components
import { memo } from 'react';

export const StaffCard = memo(({ staff }: { staff: Staff }) => {
  return <div>{staff.name}</div>;
});

// Lazy loading modules
import { lazy, Suspense } from 'react';

const AdminModule = lazy(() => import('./AdminModule'));

export const GymApp: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminModule />
    </Suspense>
  );
};

// useCallback for event handlers
import { useCallback } from 'react';

const handleEdit = useCallback((row: Staff) => {
  // Handle edit
}, []);
```

---

## 📱 Mobile Responsive Pattern

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
  <Card />
  <Card />
  <Card />
  <Card />
</div>
```

---

## 🎓 Type Safety Examples

```typescript
// Define entity types
interface Staff {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'on_leave';
}

// Type-safe component props
interface StaffTableProps {
  data: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  data,
  onEdit,
  onDelete
}) => {
  // Component body
};
```

---

## 🚀 Deployment Checklist

- [ ] Run `npm run build`
- [ ] Test build output: `npm run preview`
- [ ] Check all images load correctly
- [ ] Test responsive design on mobile
- [ ] Verify all links work
- [ ] Check console for errors/warnings
- [ ] Test forms with valid/invalid data
- [ ] Verify API endpoints (if integrated)
- [ ] Test on different browsers
- [ ] Minify and optimize assets
- [ ] Deploy to production

---

**Happy Coding! 🎉**
