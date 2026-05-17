import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Briefcase, 
  Users, 
  BarChart3,
  LogOut,
  ClipboardList
} from 'lucide-react';
import { useStore } from './store';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { currentModule, setCurrentModule, logout, isAdmin } = useStore();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-500'
    },
    {
      id: 'attendance',
      label: 'Check-In',
      icon: ClipboardList,
      color: 'text-green-500'
    },
    {
      id: 'admin',
      label: 'Admin & Infrastructure',
      icon: Settings,
      color: 'text-purple-500',
      requiresAdmin: true
    },
    {
      id: 'operations',
      label: 'Club Operations',
      icon: Briefcase,
      color: 'text-green-500',
      requiresAdmin: true
    },
    {
      id: 'members',
      label: 'Member & Finance',
      icon: Users,
      color: 'text-orange-500'
    },
    {
      id: 'reporting',
      label: 'Reporting & Analytics',
      icon: BarChart3,
      color: 'text-red-500'
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const visibleMenuItems = menuItems.filter(item => {
    if (item.requiresAdmin) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl transition-transform duration-300 z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">GymPro</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase mb-4 px-2">Main Menu</p>
        <div className="space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentModule(item.id as any);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-700 border-l-4 border-blue-500 shadow-lg'
                    : 'hover:bg-slate-700/50 border-l-4 border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : item.color} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isActive && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all duration-200">
          <Settings size={20} />
          <span className="flex-1 text-left font-medium">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="flex-1 text-left font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
