import { Link } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { HOME_BY_ROLE } from '@/context/auth.constants'

export default function Unauthorized() {
  const { user } = useAuth()
  const home = user ? HOME_BY_ROLE[user.role] : '/login'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 120,
          lineHeight: 1,
          color: 'var(--danger)',
          opacity: 0.8,
        }}
        aria-hidden="true"
      >
        403
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Access Denied</h1>

      <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 340 }}>
        You don't have permission to view this page.
        {user && (
          <>
            {' '}Your current role is{' '}
            <strong style={{ color: 'var(--text-1)' }}>{user.role}</strong>.
          </>
        )}
      </p>

      <Link
        to={home}
        className="btn btn--neon btn--md"
        style={{ marginTop: 8 }}
      >
        ← Back to Home
      </Link>
    </div>
  )
}
