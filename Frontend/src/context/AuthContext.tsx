import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthResponse, AuthUser } from '@/types';
import { authService } from '@/services/auth.service';
import apiClient from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (firstName: string, lastName: string, email: string, password: string, phone?: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        apiClient.setToken(savedToken);
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            setToken(savedToken);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        apiClient.setToken(newToken);
        setToken(newToken);
        setUser(newUser);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, phone?: string) => {
    try {
      const response = await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
      });
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        apiClient.setToken(newToken);
        setToken(newToken);
        setUser(newUser);
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
