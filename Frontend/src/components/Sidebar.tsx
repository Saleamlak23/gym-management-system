import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, BarChart3, Dumbbell, Calendar, Wrench, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const menuItems = [
    // Admin routes
    { label: 'Dashboard', icon: BarChart3, path: '/admin', roles: ['enterprise_admin', 'branch_manager'] },
    { label: 'Members', icon: Users, path: '/admin/members', roles: ['enterprise_admin', 'branch_manager', 'staff'] },
    { label: 'Staff', icon: Users, path: '/admin/staff', roles: ['enterprise_admin'] },
    { label: 'Branches', icon: Users, path: '/admin/branches', roles: ['enterprise_admin'] },
    { label: 'Classes', icon: Calendar, path: '/admin/classes', roles: ['enterprise_admin', 'branch_manager'] },
    { label: 'Equipment', icon: Wrench, path: '/admin/equipment', roles: ['enterprise_admin', 'branch_manager', 'staff'] },
    { label: 'Payments', icon: BarChart3, path: '/admin/payments', roles: ['enterprise_admin', 'branch_manager'] },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics', roles: ['enterprise_admin', 'branch_manager'] },

    // Branch manager routes
    { label: 'Branch Dashboard', icon: BarChart3, path: '/branch', roles: ['branch_manager'] },
    { label: 'Class Schedule', icon: Calendar, path: '/branch/classes', roles: ['branch_manager'] },
    { label: 'Attendance', icon: Users, path: '/branch/attendance', roles: ['branch_manager', 'staff'] },

    // Staff routes
    { label: 'Check-In Desk', icon: Users, path: '/staff/checkin', roles: ['staff'] },
    { label: 'Training Sessions', icon: Dumbbell, path: '/staff/training', roles: ['staff', 'trainer'] },

    // Member routes
    { label: 'My Portal', icon: BarChart3, path: '/member', roles: ['member'] },
    { label: 'My Bookings', icon: Calendar, path: '/member/bookings', roles: ['member'] },
    { label: 'My Sessions', icon: Dumbbell, path: '/member/sessions', roles: ['member'] },
    { label: 'My Payments', icon: BarChart3, path: '/member/payments', roles: ['member'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className={`flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} border-r border-slate-800`}>
      {/* Logo/Brand */}
      <div className={`flex items-center justify-between p-6 border-b border-slate-800 ${collapsed ? 'flex-col' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <Dumbbell className="h-6 w-6" />
          </div>
          {!collapsed && <span className="font-bold text-lg">TitanSync</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-slate-800 p-1 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {!collapsed && (
          <div className="px-2 py-2">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};
