import React from 'react';
import { Bell, Menu, LogOut } from 'lucide-react';
import { useStore } from '../store';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, notifications, currentModule, logout } = useStore();

  const getModuleTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      attendance: 'Member Check-In',
      admin: 'Admin & Infrastructure',
      operations: 'Club Operations',
      members: 'Member & Finance',
      reporting: 'Reporting & Analytics'
    };
    return titles[currentModule] || 'Dashboard';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{getModuleTitle()}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={24} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.avatar || user?.name?.[0]}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
