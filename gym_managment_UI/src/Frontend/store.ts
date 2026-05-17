import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'member';
  avatar?: string;
}

interface StoreState {
  user: User | null;
  currentModule: 'dashboard' | 'admin' | 'operations' | 'members' | 'reporting';
  notifications: string[];
  setUser: (user: User | null) => void;
  setCurrentModule: (module: StoreState['currentModule']) => void;
  addNotification: (notification: string) => void;
  removeNotification: (index: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: {
    id: 1,
    name: 'John Admin',
    email: 'admin@gym.com',
    role: 'admin',
    avatar: 'JA'
  },
  currentModule: 'dashboard',
  notifications: [],
  setUser: (user) => set({ user }),
  setCurrentModule: (module) => set({ currentModule: module }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),
  removeNotification: (index) =>
    set((state) => ({
      notifications: state.notifications.filter((_, i) => i !== index)
    }))
}));
