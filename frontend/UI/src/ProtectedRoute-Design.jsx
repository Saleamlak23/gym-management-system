import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth()

  // Check if user is authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  // Check if user has the required role
  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
