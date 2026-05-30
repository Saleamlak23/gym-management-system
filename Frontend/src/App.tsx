import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { getDefaultPathForRole } from '@/lib/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/Sidebar';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { NotFound } from '@/pages/NotFound';
import { Unauthorized } from '@/pages/Unauthorized';
import { Toaster } from '@/components/ui/toaster';

// Admin Pages
import { AdminDashboard } from '@/pages/AdminDashboard';
import { MembersListPage } from '@/pages/admin/MembersListPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { BranchesPage } from '@/pages/admin/Branches';
import { PaymentsPage } from '@/pages/admin/PaymentsPage';
import { ClassesManagement } from '@/pages/admin/ClassesManagement';
import { OnlinePaymentsPage } from '@/pages/admin/OnlinePayments';
import { EquipmentPage } from '@/pages/admin/EquipmentPage';
import { StaffPage } from '@/pages/admin/StaffPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

// Branch Manager Pages
import { BranchDashboard } from '@/pages/branch/BranchDashboard';
import { ClassSchedule } from '@/pages/branch/ClassSchedule';
import { Attendance } from '@/pages/branch/Attendance';

// Staff Pages
import { StaffHome } from '@/pages/staff/StaffHome';
import { CheckInDesk } from '@/pages/staff/CheckInDesk';
import { TrainingSessions } from '@/pages/staff/TrainingSessions';

// Member Pages
import { MemberPortal } from '@/pages/member/MemberPortal';
import { MyBookings } from '@/pages/member/MyBookings';
import { MySessions } from '@/pages/member/MySessions';
import { MyPayments } from '@/pages/member/MyPayments';

// Keep existing admin class page for compatibility
import { ClassesPage } from '@/pages/admin/ClassesPage';

import './App.css';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const HomeRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultPathForRole(user?.role)} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <LayoutWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager', 'staff']}>
                    <MembersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members/:id"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager', 'staff']}>
                    <MemberDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin']}>
                    <StaffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/branches"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin']}>
                    <BranchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/online-payments"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <OnlinePaymentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/equipment"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager', 'staff']}>
                    <EquipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager', 'trainer', 'member']}>
                    <ClassesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes-management"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <ClassesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

<<<<<<< HEAD
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
                  <ProtectedRoute allowedRoles={['branch_manager', 'staff']}>
                    <Attendance />
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

              {/* Default redirect & 404 */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="*" element={<NotFound />} />
=======
              {/* Default redirect */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
>>>>>>> dc6d59c4288d98785a3eed7bc628f93651a3c950
            </Routes>
          </LayoutWrapper>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
