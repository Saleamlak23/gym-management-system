import React, { useState } from 'react';
import { DataTable, DataTableColumn } from '../DataTable';
import { Drawer } from '../Drawer';
import { ClassMaster, DailySchedule, ClassBooking, PersonalTrainingSession } from '../types';

export const OperationsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classes' | 'schedules' | 'bookings' | 'training'>('classes');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Mock data
  const classesData: ClassMaster[] = [
    {
      id: 1,
      name: 'Power Yoga',
      description: 'High-intensity yoga session',
      instructorId: 1,
      maxCapacity: 30,
      duration: 60,
      level: 'intermediate'
    },
    {
      id: 2,
      name: 'CrossFit Boot Camp',
      description: 'Intense cardio and strength training',
      instructorId: 2,
      maxCapacity: 25,
      duration: 45,
      level: 'advanced'
    },
    {
      id: 3,
      name: 'Zumba Fitness',
      description: 'Dance-based cardio workout',
      instructorId: 3,
      maxCapacity: 50,
      duration: 60,
      level: 'beginner'
    }
  ];

  const schedulesData: DailySchedule[] = [
    {
      id: 1,
      classId: 1,
      className: 'Power Yoga',
      date: '2024-05-20',
      startTime: '06:00 AM',
      endTime: '07:00 AM',
      instructorId: 1,
      instructorName: 'Rajesh Kumar',
      branchId: 1
    },
    {
      id: 2,
      classId: 2,
      className: 'CrossFit Boot Camp',
      date: '2024-05-20',
      startTime: '05:30 AM',
      endTime: '06:15 AM',
      instructorId: 2,
      instructorName: 'Priya Sharma',
      branchId: 1
    },
    {
      id: 3,
      classId: 3,
      className: 'Zumba Fitness',
      date: '2024-05-20',
      startTime: '06:30 PM',
      endTime: '07:30 PM',
      instructorId: 3,
      instructorName: 'Amit Singh',
      branchId: 1
    }
  ];

  const bookingsData: ClassBooking[] = [
    {
      id: 1,
      classId: 1,
      memberId: 101,
      bookingDate: '2024-05-20',
      status: 'confirmed'
    },
    {
      id: 2,
      classId: 1,
      memberId: 102,
      bookingDate: '2024-05-20',
      status: 'confirmed'
    },
    {
      id: 3,
      classId: 2,
      memberId: 103,
      bookingDate: '2024-05-20',
      status: 'attended'
    }
  ];

  const trainingSessionsData: PersonalTrainingSession[] = [
    {
      id: 1,
      memberId: 101,
      trainerId: 1,
      sessionDate: '2024-05-20',
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      status: 'scheduled'
    },
    {
      id: 2,
      memberId: 102,
      trainerId: 2,
      sessionDate: '2024-05-20',
      startTime: '04:00 PM',
      endTime: '05:00 PM',
      status: 'completed'
    }
  ];

  const classColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Class Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'maxCapacity', label: 'Capacity', sortable: true },
    { key: 'duration', label: 'Duration (min)', sortable: true },
    { key: 'level', label: 'Level', sortable: true }
  ];

  const scheduleColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'className', label: 'Class', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'startTime', label: 'Start Time', sortable: true },
    { key: 'endTime', label: 'End Time', sortable: true },
    { key: 'instructorName', label: 'Instructor', sortable: true }
  ];

  const bookingColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'classId', label: 'Class ID', sortable: true },
    { key: 'memberId', label: 'Member ID', sortable: true },
    { key: 'bookingDate', label: 'Booking Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const trainingColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'memberId', label: 'Member ID', sortable: true },
    { key: 'trainerId', label: 'Trainer ID', sortable: true },
    { key: 'sessionDate', label: 'Date', sortable: true },
    { key: 'startTime', label: 'Start Time', sortable: true },
    { key: 'endTime', label: 'End Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const tabs = [
    { id: 'classes', label: 'Classes Master', icon: '📚' },
    { id: 'schedules', label: 'Daily Schedules', icon: '📅' },
    { id: 'bookings', label: 'Class Bookings', icon: '🎫' },
    { id: 'training', label: 'Personal Training', icon: '💪' }
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
                  ? 'border-green-600 text-green-600'
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
        {activeTab === 'classes' && (
          <DataTable
            columns={classColumns}
            data={classesData}
            title="Class Master"
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

        {activeTab === 'schedules' && (
          <DataTable
            columns={scheduleColumns}
            data={schedulesData}
            title="Daily Schedules"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete schedule #${row.id}`)}
          />
        )}

        {activeTab === 'bookings' && (
          <DataTable
            columns={bookingColumns}
            data={bookingsData}
            title="Class Bookings"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete booking #${row.id}`)}
          />
        )}

        {activeTab === 'training' && (
          <DataTable
            columns={trainingColumns}
            data={trainingSessionsData}
            title="Personal Training Sessions"
            onAddNew={() => {
              setSelectedRow(null);
              setIsDrawerOpen(true);
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setIsDrawerOpen(true);
            }}
            onDelete={(row) => alert(`Delete session #${row.id}`)}
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
          {activeTab === 'classes' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedRow?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue={selectedRow?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Capacity
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.maxCapacity || 30}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.duration || 60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  defaultValue={selectedRow?.level || 'beginner'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'schedules' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  defaultValue={selectedRow?.classId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Class</option>
                  {classesData.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={selectedRow?.date || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  defaultValue={selectedRow?.startTime || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  defaultValue={selectedRow?.endTime || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.memberId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'confirmed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="attended">Attended</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'training' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.memberId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trainer ID
                </label>
                <input
                  type="number"
                  defaultValue={selectedRow?.trainerId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={selectedRow?.sessionDate || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  defaultValue={selectedRow?.status || 'scheduled'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
