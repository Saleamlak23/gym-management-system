#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_PATH = 'c:\\Users\\Admin\\Documents\\Database Project\\gym-management-system\\frontend\\UI\\src';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Created:', filePath.replace(SRC_PATH, 'src'));
}

// Create directories
const dirs = [
  'components',
  'pages\\public',
  'pages\\admin',
  'pages\\branch',
  'pages\\staff',
  'pages\\member',
  'hooks',
  'services',
  'context',
  'utils'
];

console.log('\n📁 Creating directories...\n');
dirs.forEach(dir => ensureDir(path.join(SRC_PATH, dir)));

console.log('\n📄 Creating component files...\n');

// Create components
writeFile(path.join(SRC_PATH, 'components', 'Button.jsx'), `import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
  ...props 
}) {
  const baseClass = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }[variant] || 'bg-blue-600 text-white hover:bg-blue-700';

  const sizeClass = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }[size] || 'px-4 py-2 text-base';

  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={\`\${baseClass} \${variantClass} \${sizeClass} \${disabledClass} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'Input.jsx'), `import React from 'react';

export function Input({ 
  label, 
  error, 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  disabled = false,
  className = '',
  ...props 
}) {
  const inputClass = \`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 \${
    error ? 'border-red-500' : 'border-gray-300'
  } \${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} \${className}\`;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClass}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'Badge.jsx'), `import React from 'react';

export function Badge({ status, className = '' }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={\`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${statusColors[status] || statusColors.inactive} \${className}\`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'DataTable.jsx'), `import React, { useState } from 'react';
import { Button } from './Button';

export function DataTable({ 
  columns, 
  data = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onAddNew 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  let sortedData = [...data];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                >
                  {col.label} {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm space-x-2 flex gap-2">
                  {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>}
                  {onDelete && <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2 flex gap-2">
          <Button 
            size="sm" 
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'PageWrapper.jsx'), `import React from 'react';

export function PageWrapper({ title, subtitle, children, actions }) {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-4">{actions}</div>}
        </div>
        <div className="bg-white rounded-lg shadow">
          {children}
        </div>
      </div>
    </div>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'StatCard.jsx'), `import React from 'react';

export function StatCard({ label, value, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={\`text-sm mt-2 \${trend > 0 ? 'text-green-600' : 'text-red-600'}\`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  );
}
`);

writeFile(path.join(SRC_PATH, 'components', 'ProtectedRoute.jsx'), `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
`);

writeFile(path.join(SRC_PATH, 'components', 'index.js'), `export { Button } from './Button';
export { Input } from './Input';
export { Badge } from './Badge';
export { DataTable } from './DataTable';
export { PageWrapper } from './PageWrapper';
export { StatCard } from './StatCard';
export { ProtectedRoute } from './ProtectedRoute';
`);

console.log('\n📄 Creating page files...\n');

// Public pages
writeFile(path.join(SRC_PATH, 'pages', 'public', 'LoginPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function LoginPage() {
  return (
    <PageWrapper title="Login">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'public', 'RegisterPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function RegisterPage() {
  return (
    <PageWrapper title="Register">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'public', 'UnauthorizedPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function UnauthorizedPage() {
  return (
    <PageWrapper title="Unauthorized">
      <div className="p-8">
        <p>You do not have permission to access this page</p>
      </div>
    </PageWrapper>
  );
}
`);

// Admin pages
writeFile(path.join(SRC_PATH, 'pages', 'admin', 'AdminDashboard.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function AdminDashboard() {
  return (
    <PageWrapper title="Admin Dashboard">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'admin', 'MembersPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function MembersPage() {
  return (
    <PageWrapper title="Members">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'admin', 'BranchesPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function BranchesPage() {
  return (
    <PageWrapper title="Branches">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'admin', 'StaffPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function StaffPage() {
  return (
    <PageWrapper title="Staff">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'admin', 'PaymentsPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function PaymentsPage() {
  return (
    <PageWrapper title="Payments">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'admin', 'AnalyticsPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function AnalyticsPage() {
  return (
    <PageWrapper title="Analytics">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

// Branch pages
writeFile(path.join(SRC_PATH, 'pages', 'branch', 'BranchDashboard.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function BranchDashboard() {
  return (
    <PageWrapper title="Branch Dashboard">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'branch', 'ClassesPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function ClassesPage() {
  return (
    <PageWrapper title="Classes">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'branch', 'AttendancePage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function AttendancePage() {
  return (
    <PageWrapper title="Attendance">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'branch', 'EquipmentPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function EquipmentPage() {
  return (
    <PageWrapper title="Equipment">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

// Staff pages
writeFile(path.join(SRC_PATH, 'pages', 'staff', 'StaffDashboard.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function StaffDashboard() {
  return (
    <PageWrapper title="Staff Dashboard">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'staff', 'CheckinPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function CheckinPage() {
  return (
    <PageWrapper title="Check-in">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'staff', 'TrainingPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function TrainingPage() {
  return (
    <PageWrapper title="Training">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

// Member pages
writeFile(path.join(SRC_PATH, 'pages', 'member', 'MemberDashboard.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function MemberDashboard() {
  return (
    <PageWrapper title="Member Dashboard">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'member', 'BookingsPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function BookingsPage() {
  return (
    <PageWrapper title="Bookings">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'member', 'SessionsPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function SessionsPage() {
  return (
    <PageWrapper title="Sessions">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

writeFile(path.join(SRC_PATH, 'pages', 'member', 'PaymentsPage.jsx'), `import React from 'react';
import { PageWrapper } from '../../components';

export function MemberPaymentsPage() {
  return (
    <PageWrapper title="Payments">
      <div className="p-8">
        <p>Page content coming soon</p>
      </div>
    </PageWrapper>
  );
}
`);

console.log('\n📄 Creating service files...\n');

// Services
writeFile(path.join(SRC_PATH, 'services', 'member.service.js'), `import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export const memberService = {
  getMembers: async (filters = {}) => {
    try {
      const response = await api.get('/members', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching members' };
    }
  },
  
  getMemberById: async (id) => {
    try {
      const response = await api.get(\`/members/\${id}\`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching member' };
    }
  },
  
  updateMember: async (id, data) => {
    try {
      const response = await api.put(\`/members/\${id}\`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating member' };
    }
  },

  getMemberSubscriptions: async (memberId) => {
    try {
      const response = await api.get(\`/members/\${memberId}/subscriptions\`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching subscriptions' };
    }
  },

  getMemberPayments: async (memberId) => {
    try {
      const response = await api.get(\`/members/\${memberId}/payments\`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching payments' };
    }
  },

  getMemberAttendance: async (memberId, days = 30) => {
    try {
      const response = await api.get(\`/members/\${memberId}/attendance\`, { params: { days } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching attendance' };
    }
  }
};
`);

console.log('\n📄 Creating context files...\n');

// Copy AuthContext.jsx to context folder
const authContextContent = fs.readFileSync(path.join(SRC_PATH, 'AuthContext.jsx'), 'utf8');
writeFile(path.join(SRC_PATH, 'context', 'AuthContext.jsx'), authContextContent);

console.log('\n📄 Creating App.jsx...\n');

writeFile(path.join(SRC_PATH, 'App.jsx'), `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components';

// Pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MembersPage } from './pages/admin/MembersPage';
import { BranchesPage } from './pages/admin/BranchesPage';
import { StaffPage } from './pages/admin/StaffPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { BranchDashboard } from './pages/branch/BranchDashboard';
import { ClassesPage } from './pages/branch/ClassesPage';
import { AttendancePage } from './pages/branch/AttendancePage';
import { EquipmentPage } from './pages/branch/EquipmentPage';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { CheckinPage } from './pages/staff/CheckinPage';
import { TrainingPage } from './pages/staff/TrainingPage';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { BookingsPage } from './pages/member/BookingsPage';
import { SessionsPage } from './pages/member/SessionsPage';
import { MemberPaymentsPage } from './pages/member/PaymentsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="enterprise_admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute requiredRole="enterprise_admin"><MembersPage /></ProtectedRoute>} />
      <Route path="/admin/branches" element={<ProtectedRoute requiredRole="enterprise_admin"><BranchesPage /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute requiredRole="enterprise_admin"><StaffPage /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute requiredRole="enterprise_admin"><PaymentsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="enterprise_admin"><AnalyticsPage /></ProtectedRoute>} />

      {/* Branch Manager Routes */}
      <Route path="/branch" element={<ProtectedRoute requiredRole="branch_manager"><BranchDashboard /></ProtectedRoute>} />
      <Route path="/branch/classes" element={<ProtectedRoute requiredRole="branch_manager"><ClassesPage /></ProtectedRoute>} />
      <Route path="/branch/attendance" element={<ProtectedRoute requiredRole="branch_manager"><AttendancePage /></ProtectedRoute>} />
      <Route path="/branch/equipment" element={<ProtectedRoute requiredRole="branch_manager"><EquipmentPage /></ProtectedRoute>} />

      {/* Staff/Trainer Routes */}
      <Route path="/staff" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/checkin" element={<ProtectedRoute requiredRole="staff"><CheckinPage /></ProtectedRoute>} />
      <Route path="/staff/training" element={<ProtectedRoute requiredRole="staff"><TrainingPage /></ProtectedRoute>} />

      {/* Member Routes */}
      <Route path="/member" element={<ProtectedRoute requiredRole="member"><MemberDashboard /></ProtectedRoute>} />
      <Route path="/member/bookings" element={<ProtectedRoute requiredRole="member"><BookingsPage /></ProtectedRoute>} />
      <Route path="/member/sessions" element={<ProtectedRoute requiredRole="member"><SessionsPage /></ProtectedRoute>} />
      <Route path="/member/payments" element={<ProtectedRoute requiredRole="member"><MemberPaymentsPage /></ProtectedRoute>} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
`);

console.log('\n✅ All files created successfully!\\n');
