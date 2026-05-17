import React, { useState } from 'react';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable';
import { Drawer } from './Drawer';
import type { Member, MembershipType, Subscription, Payment, AttendanceLog } from './types';

export const MembersModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'plans' | 'subscriptions' | 'payments' | 'attendance'>('members');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Mock data
  const membersData: Member[] = [
    {
      id: 101,
      firstName: 'Rohan',
      lastName: 'Verma',
      email: 'rohan.verma@email.com',
      phone: '+91-9876543210',
      joinDate: '2023-06-15',
      branchId: 1
    },
    {
      id: 102,
      firstName: 'Sneha',
      lastName: 'Desai',
      email: 'sneha.desai@email.com',
      phone: '+91-9876543211',
      joinDate: '2023-07-20',
      branchId: 1
    },
    {
      id: 103,
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@email.com',
      phone: '+91-9876543212',
      joinDate: '2023-08-10',
      branchId: 2
    }
  ];

  const plansData: MembershipType[] = [
    {
      id: 1,
      name: 'Basic Monthly',
      description: 'Access to gym during off-peak hours',
      duration: 30,
      price: 2000
    },
    {
      id: 2,
      name: 'Premium Monthly',
      description: 'Full access to all gym facilities',
      duration: 30,
      price: 4000
    },
    {
      id: 3,
      name: 'Annual Plan',
      description: 'Best value annual subscription',
      duration: 365,
      price: 35000
    }
  ];

  const subscriptionsData: Subscription[] = [
    {
      id: 1,
      memberId: 101,
      membershipTypeId: 2,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active'
    },
    {
      id: 2,
      memberId: 102,
      membershipTypeId: 2,
      startDate: '2024-04-01',
      endDate: '2024-05-01',
      status: 'active'
    },
    {
      id: 3,
      memberId: 103,
      membershipTypeId: 1,
      startDate: '2023-12-01',
      endDate: '2024-01-01',
      status: 'expired'
    }
  ];

  const paymentsData: Payment[] = [
    {
      id: 1,
      memberId: 101,
      subscriptionId: 1,
      amount: 35000,
      paymentDate: '2024-01-01',
      method: 'card',
      status: 'completed'
    },
    {
      id: 2,
      memberId: 102,
      subscriptionId: 2,
      amount: 4000,
      paymentDate: '2024-04-01',
      method: 'cash',
      status: 'completed'
    },
    {
      id: 3,
      memberId: 101,
      subscriptionId: 1,
      amount: 0,
      paymentDate: '2024-05-15',
      method: 'card',
      status: 'pending'
    }
  ];

  const attendanceData: AttendanceLog[] = [
    {
      id: 1,
      memberId: 101,
      date: '2024-05-20',
      checkInTime: '2024-05-20T06:30:00',
      checkOutTime: '2024-05-20T07:45:00'
    },
    {
      id: 2,
      memberId: 102,
      date: '2024-05-20',
      checkInTime: '2024-05-20T06:00:00',
      checkOutTime: '2024-05-20T07:30:00'
    },
    {
      id: 3,
      memberId: 101,
      date: '2024-05-19',
      checkInTime: '2024-05-19T17:00:00',
      checkOutTime: '2024-05-19T18:00:00'
    }
  ];

  const memberColumns: DataTableColumn[] = [
    { key: 'id', label: 'Member ID', sortable: true },
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'joinDate', label: 'Join Date', sortable: true }
  ];

  const planColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Plan Name', sortable: true },
    { key: 'duration', label: 'Duration (days)', sortable: true },
    { key: 'price', label: 'Price (₹)', sortable: true },
    { key: 'description', label: 'Description', sortable: true }
  ];

  const subscriptionColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'memberId', label: 'Member ID', sortable: true },
    { key: 'membershipTypeId', label: 'Plan ID', sortable: true },
    { key: 'startDate', label: 'Start Date', sortable: true },
    { key: 'endDate', label: 'End Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const paymentColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'memberId', label: 'Member ID', sortable: true },
    { key: 'amount', label: 'Amount (₹)', sortable: true },
    { key: 'paymentDate', label: 'Date', sortable: true },
    { key: 'method', label: 'Method', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const attendanceColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'memberId', label: 'Member ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'checkInTime', label: 'Check-in', sortable: true },
    { key: 'checkOutTime', label: 'Check-out', sortable: true }
  ];

  const tabs = [
    { id: 'members', label: 'Member Directory', icon: '👥' },
    { id: 'plans', label: 'Membership Plans', icon: '📋' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🎫' },
    { id: 'payments', label: 'Payment History', icon: '💳' },
    { id: 'attendance', label: 'Attendance Logs', icon: '📍' }
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
                  ? 'border-orange-600 text-orange-600'
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
        {activeTab === 'members' && (
          <DataTable
            columns={memberColumns}
            data={membersData}
            title="Member Directory"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete: ${row.firstName} ${row.lastName}`)}
          />
        )}

        {activeTab === 'plans' && (
          <DataTable
            columns={planColumns}
            data={plansData}
            title="Membership Plans"
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

        {activeTab === 'subscriptions' && (
          <DataTable
            columns={subscriptionColumns}
            data={subscriptionsData}
            title="Active Subscriptions"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete subscription #${row.id}`)}
          />
        )}

        {activeTab === 'payments' && (
          <DataTable
            columns={paymentColumns}
            data={paymentsData}
            title="Payment History"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete payment #${row.id}`)}
          />
        )}

        {activeTab === 'attendance' && (
          <DataTable
            columns={attendanceColumns}
            data={attendanceData}
            title="Attendance Logs"
            searchable={true}
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
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
          {activeTab === 'members' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.firstName || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.lastName || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedRow?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue={selectedRow?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}

          {activeTab === 'plans' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.price || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.duration || 30}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue={selectedRow?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}

          {activeTab === 'subscriptions' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.memberId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  defaultValue={selectedRow?.membershipTypeId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Plan</option>
                  {plansData.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'active'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.memberId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.amount || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  defaultValue={selectedRow?.method || 'cash'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
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
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
