import React, { createContext, useState, useCallback } from 'react';

// Module-level token storage (not localStorage for security)
let currentToken = null;
let currentUser = null;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      if (data.success) {
        currentToken = data.data.token;
        currentUser = data.data.user;
        setToken(currentToken);
        setUser(currentUser);
        return data.data;
      }
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    currentToken = null;
    currentUser = null;
    setToken(null);
    setUser(null);
  }, []);

  const getToken = useCallback(() => currentToken, []);
  const getUser = useCallback(() => currentUser, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    getToken,
    getUser,
    isAuthenticated: !!currentToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
