import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/context/useAuth'
import { setTokenGetter } from '@/services/api'
import { Sidebar, TopBar, ProtectedRoute } from '@/components'
import ErrorBoundary from '@/components/ErrorBoundary'

// ── Auth pages ─────────────────────────────────────────────
import Login        from '@/pages/Login'
import Register     from '@/pages/Register'
import Unauthorized from '@/pages/admin/Unauthorized'

// ── Admin pages ────────────────────────────────────────────
import AdminDashboard from '@/pages/admin/AdminDashboard'
import MemberList     from '@/pages/admin/MemberList'
import MemberDetail   from '@/pages/admin/MemberDetail'
import Payments       from '@/pages/admin/Payments'
import StaffList      from '@/pages/admin/StaffList'
import Analytics      from '@/pages/admin/Analytics'

// ── Branch pages ───────────────────────────────────────────
import BranchDashboard from '@/pages/branch/BranchDashboard'
import ClassSchedule   from '@/pages/branch/ClassSchedule'
import Attendance      from '@/pages/branch/Attendance'
import Equipment       from '@/pages/branch/Equipment'

// ── Staff pages ────────────────────────────────────────────
import StaffHome        from '@/pages/staff/StaffHome'
import CheckIn          from '@/pages/staff/CheckIn'
import TrainingSessions from '@/pages/staff/TrainingSessions'

// ── Member pages ───────────────────────────────────────────
import MemberPortal from '@/pages/member/MemberPortal'
import MyBookings   from '@/pages/member/MyBookings'
import MySessions   from '@/pages/member/MySessions'
import MyPayments   from '@/pages/member/MyPayments'

// ── App shell (authenticated layout) ──────────────────────

function AppShell() {
  const { getToken } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Wire the Axios interceptor to the auth context token getter
  useEffect(() => {
    setTokenGetter(getToken)
  }, [getToken])

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <TopBar onMenuClick={() => setMobileOpen((o) => !o)} />
        <Routes>

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <MemberList />
            </ProtectedRoute>
          } />
          <Route path="/admin/members/:id" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <MemberDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <StaffList />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['enterprise_admin']}>
              <Analytics />
            </ProtectedRoute>
          } />

          {/* ── Branch ── */}
          <Route path="/branch" element={
            <ProtectedRoute roles={['branch_manager', 'enterprise_admin']}>
              <BranchDashboard />
            </ProtectedRoute>
          } />
          <Route path="/branch/classes" element={
            <ProtectedRoute roles={['branch_manager', 'enterprise_admin']}>
              <ClassSchedule />
            </ProtectedRoute>
          } />
          <Route path="/branch/attendance" element={
            <ProtectedRoute roles={['branch_manager', 'enterprise_admin']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/branch/equipment" element={
            <ProtectedRoute roles={['branch_manager', 'enterprise_admin']}>
              <Equipment />
            </ProtectedRoute>
          } />

          {/* ── Staff / Trainer ── */}
          <Route path="/staff" element={
            <ProtectedRoute roles={['staff', 'trainer']}>
              <StaffHome />
            </ProtectedRoute>
          } />
          <Route path="/staff/checkin" element={
            <ProtectedRoute roles={['staff', 'trainer']}>
              <CheckIn />
            </ProtectedRoute>
          } />
          <Route path="/staff/training" element={
            <ProtectedRoute roles={['trainer']}>
              <TrainingSessions />
            </ProtectedRoute>
          } />

          {/* ── Member ── */}
          <Route path="/member" element={
            <ProtectedRoute roles={['member']}>
              <MemberPortal />
            </ProtectedRoute>
          } />
          <Route path="/member/bookings" element={
            <ProtectedRoute roles={['member']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/member/sessions" element={
            <ProtectedRoute roles={['member']}>
              <MySessions />
            </ProtectedRoute>
          } />
          <Route path="/member/payments" element={
            <ProtectedRoute roles={['member']}>
              <MyPayments />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All authenticated routes go through AppShell */}
          <Route path="/*" element={<ErrorBoundary><AppShell /></ErrorBoundary>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
