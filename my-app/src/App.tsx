import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components';
import {
  Login,
  Register,
  Unauthorized,
  AdminDashboard,
  BranchDashboard,
  StaffHome,
  MemberPortal,
  Branches,
  StaffList,
  MemberList,
  MemberDetail,
  Payments,
  Analytics,
  ClassSchedule,
  Attendance,
  Equipment,
  CheckInDesk,
  TrainingSessions,
  MyBookings,
  MySessions,
  MyPayments,
} from './pages';
import './styles/app.css';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <Branches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <StaffList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/members"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <MemberList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/members/:id"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <MemberDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['enterprise_admin']}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Branch Manager Routes */}
      <Route
        path="/branch"
        element={
          <ProtectedRoute allowedRoles={['branch_manager']}>
            <BranchDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/branch/classes"
        element={
          <ProtectedRoute allowedRoles={['branch_manager']}>
            <ClassSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/branch/attendance"
        element={
          <ProtectedRoute allowedRoles={['branch_manager']}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/branch/equipment"
        element={
          <ProtectedRoute allowedRoles={['branch_manager']}>
            <Equipment />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'trainer']}>
            <StaffHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/checkin"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <CheckInDesk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/training"
        element={
          <ProtectedRoute allowedRoles={['staff', 'trainer']}>
            <TrainingSessions />
          </ProtectedRoute>
        }
      />

      {/* Member Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/bookings"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/sessions"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MySessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/payments"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MyPayments />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
