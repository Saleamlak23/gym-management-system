import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalDashboard } from './Dashboard';
import { AdminModule } from './AdminModule';
import { OperationsModule } from './OperationsModule';
import { MembersModule } from './MembersModule';
import { ReportingModule } from './ReportingModule';
import { useStore } from './store';

export const GymApp: React.FC = () => {
  const { currentModule } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {currentModule === 'dashboard' && <GlobalDashboard />}
            {currentModule === 'admin' && <AdminModule />}
            {currentModule === 'operations' && <OperationsModule />}
            {currentModule === 'members' && <MembersModule />}
            {currentModule === 'reporting' && <ReportingModule />}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
