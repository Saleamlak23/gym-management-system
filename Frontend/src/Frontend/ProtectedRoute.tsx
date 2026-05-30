import React from 'react';
import { useStore } from './store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">Please log in to access this page</p>
        </div>
      </div>
    );
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-600 mt-2">Your role doesn't have access to this page</p>
          <p className="text-sm text-gray-500 mt-1">Required: {requiredRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to check if user has required role
 */
export const useCanAccess = (requiredRoles: string[]): boolean => {
  const { user } = useStore();
  if (!user) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(user.role);
};

/**
 * Hook to check if user is a trainer
 */
export const useIsTrainer = (): boolean => {
  const { user } = useStore();
  return user?.role === 'staff'; // Trainers are staff members
};

/**
 * Hook to check if user has admin role
 */
export const useIsAdmin = (): boolean => {
  const { user } = useStore();
  return user?.role === 'admin';
};
