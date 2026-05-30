import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { getDefaultPathForRole } from '@/lib/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/Sidebar';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { MembersListPage } from '@/pages/admin/MembersListPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { EquipmentPage } from '@/pages/admin/EquipmentPage';
import { ClassesPage } from '@/pages/admin/ClassesPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { StaffPage } from '@/pages/admin/StaffPage';
import { Unauthorized } from '@/pages/Unauthorized';
import { Toaster } from '@/components/ui/toaster';
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
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <StaffPage />
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
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['enterprise_admin', 'branch_manager']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </LayoutWrapper>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
