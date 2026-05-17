import React, { useState } from 'react';
import { DataTable, DataTableColumn } from '../DataTable';
import { Drawer } from '../Drawer';
import { Staff, Branch, EquipmentCategory, Equipment, MaintenanceLog } from '../types';

export const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branches' | 'staff' | 'roles' | 'equipment' | 'maintenance'>('branches');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Mock data
  const branchesData: Branch[] = [
    {
      id: 1,
      name: 'Downtown Gym',
      address: '123 Main St, City Center',
      phone: '+91-9876543210',
      email: 'downtown@gym.com',
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      id: 2,
      name: 'Airport Gym',
      address: '456 Airport Rd',
      phone: '+91-9876543211',
      email: 'airport@gym.com',
      status: 'active',
      createdAt: '2023-02-20'
    },
    {
      id: 3,
      name: 'Mall Gym',
      address: '789 Shopping Mall',
      phone: '+91-9876543212',
      email: 'mall@gym.com',
      status: 'inactive',
      createdAt: '2023-03-10'
    }
  ];

  const staffData: Staff[] = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh@gym.com',
      phone: '+91-9876543210',
      roleId: 1,
      branchId: 1,
      status: 'active',
      hireDate: '2023-01-10'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@gym.com',
      phone: '+91-9876543211',
      roleId: 2,
      branchId: 1,
      status: 'active',
      hireDate: '2023-02-15'
    },
    {
      id: 3,
      name: 'Amit Singh',
      email: 'amit@gym.com',
      phone: '+91-9876543212',
      roleId: 3,
      branchId: 2,
      status: 'on_leave',
      hireDate: '2023-03-01'
    }
  ];

  const equipmentData: Equipment[] = [
    {
      id: 1,
      name: 'Treadmill Pro X',
      categoryId: 1,
      branchId: 1,
      serialNumber: 'TR-2024-001',
      purchaseDate: '2022-06-10',
      status: 'active',
      lastMaintenanceDate: '2024-05-01'
    },
    {
      id: 2,
      name: 'Dumbbell Set 50kg',
      categoryId: 2,
      branchId: 1,
      serialNumber: 'DB-2024-001',
      purchaseDate: '2022-08-20',
      status: 'active',
      lastMaintenanceDate: '2024-04-15'
    },
    {
      id: 3,
      name: 'Elliptical Machine',
      categoryId: 1,
      branchId: 2,
      serialNumber: 'EL-2024-001',
      purchaseDate: '2021-12-05',
      status: 'maintenance',
      lastMaintenanceDate: '2024-05-10'
    }
  ];

  const maintenanceData: MaintenanceLog[] = [
    {
      id: 1,
      equipmentId: 3,
      equipmentName: 'Elliptical Machine',
      maintenanceDate: '2024-05-10',
      completionDate: undefined,
      description: 'Motor belt replacement',
      cost: 5000,
      status: 'in_progress'
    },
    {
      id: 2,
      equipmentId: 1,
      equipmentName: 'Treadmill Pro X',
      maintenanceDate: '2024-05-01',
      completionDate: '2024-05-02',
      description: 'Quarterly maintenance',
      cost: 2500,
      status: 'completed'
    }
  ];

  const branchColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Branch Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const staffColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'roleId', label: 'Role ID', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'hireDate', label: 'Hire Date', sortable: true }
  ];

  const equipmentColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Equipment Name', sortable: true },
    { key: 'serialNumber', label: 'Serial Number', sortable: true },
    { key: 'categoryId', label: 'Category', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance', sortable: true }
  ];

  const maintenanceColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'equipmentName', label: 'Equipment', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'maintenanceDate', label: 'Date', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const tabs = [
    { id: 'branches', label: 'Branches', icon: '🏢' },
    { id: 'staff', label: 'Staff', icon: '👥' },
    { id: 'roles', label: 'Job Roles', icon: '🎯' },
    { id: 'equipment', label: 'Equipment', icon: '⚙️' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'branches' && (
          <DataTable
            columns={branchColumns}
            data={branchesData}
            title="Branch Management"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete: ${row.name}`)}
          />
        )}

        {activeTab === 'staff' && (
          <DataTable
            columns={staffColumns}
            data={staffData}
            title="Staff Management"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete: ${row.name}`)}
          />
        )}

        {activeTab === 'roles' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Job Roles management coming soon</p>
          </div>
        )}

        {activeTab === 'equipment' && (
          <DataTable
            columns={equipmentColumns}
            data={equipmentData}
            title="Equipment Management"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete: ${row.name}`)}
          />
        )}

        {activeTab === 'maintenance' && (
          <DataTable
            columns={maintenanceColumns}
            data={maintenanceData}
            title="Maintenance Logs"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete: ${row.id}`)}
          />
        )}
      </div>

      {/* Drawer for Forms */}
      <Drawer
        isOpen={isDrawerOpen}
        title={selectedRow ? 'Edit Record' : 'Add New Record'}
        onClose={() => setIsDrawerOpen(false)}
        width="medium"
      >
        <form className="space-y-4">
          {activeTab === 'branches' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  defaultValue={selectedRow?.address || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue={selectedRow?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedRow?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'active'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'staff' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedRow?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue={selectedRow?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'active'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'equipment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.serialNumber || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'active'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
