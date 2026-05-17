import { create } from 'zustand';
import type { User, JWTPayload } from './types';

interface StoreState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  
  // Navigation
  currentModule: 'dashboard' | 'admin' | 'operations' | 'members' | 'reporting' | 'attendance';
  
  // UI State
  notifications: string[];
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setCurrentModule: (module: StoreState['currentModule']) => void;
  addNotification: (notification: string) => void;
  removeNotification: (index: number) => void;
  
  // RBAC Helpers
  canAccess: (requiredRoles: string[]) => boolean;
  isTrainer: () => boolean;
  isAdmin: () => boolean;
}

export const useStore = create<StoreState>((set, get) => {
  // Initialize from localStorage on startup
  const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const initialUser = savedUser ? JSON.parse(savedUser) : null;
  const initialToken = savedToken || null;

  return {
    // Auth State
    user: initialUser,
    isAuthenticated: !!initialUser,
    token: initialToken,
    
    // UI State
    currentModule: 'dashboard',
    notifications: [],
    
    // Auth Actions
    setUser: (user) => {
      set({ 
        user, 
        isAuthenticated: !!user 
      });
      if (typeof localStorage !== 'undefined') {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
      }
    },
    
    setToken: (token) => {
      set({ token });
      if (typeof localStorage !== 'undefined') {
        if (token) {
          localStorage.setItem('authToken', token);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    },
    
    logout: () => {
      set({ 
        user: null, 
        isAuthenticated: false, 
        token: null,
        currentModule: 'dashboard'
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    },
    
    // Module Navigation
    setCurrentModule: (module) => set({ currentModule: module }),
    
    // Notifications
    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification]
      })),
    
    removeNotification: (index) =>
      set((state) => ({
        notifications: state.notifications.filter((_, i) => i !== index)
      })),
    
    // RBAC Helpers
    canAccess: (requiredRoles: string[]) => {
      const state = get();
      if (!state.user) return false;
      if (requiredRoles.length === 0) return true;
      return requiredRoles.includes(state.user.role);
    },
    
    isTrainer: () => {
      const state = get();
      return state.user?.role === 'trainer';
    },
    
    isAdmin: () => {
      const state = get();
      return state.user?.role === 'admin';
    }
  };
});
