import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { MembersListPage } from '@/pages/admin/MembersListPage';
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage';
import { Unauthorized } from '@/pages/Unauthorized';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
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
            path="/admin/members"
            element={
              <ProtectedRoute allowedRoles={['enterprise_admin']}>
                <MembersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members/:id"
            element={
              <ProtectedRoute allowedRoles={['enterprise_admin']}>
                <MemberDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
