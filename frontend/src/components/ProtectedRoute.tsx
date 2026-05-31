import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import type { UserRole } from '@/types'
import Spinner from './Spinner'

interface Props {
  children: ReactNode
  roles?: UserRole[]  // empty = any authenticated user
}

export default function ProtectedRoute({ children, roles = [] }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still rehydrating — show a centred spinner
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  // Not logged in — redirect to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role — redirect to 403 page
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
