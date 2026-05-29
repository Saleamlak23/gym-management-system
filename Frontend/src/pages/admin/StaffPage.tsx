import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/Skeleton';
import { staffService } from '@/services/staff.service';

interface StaffMember {
  staff_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  branch_name: string;
  join_date: string;
  status: string;
}

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    loadStaff();
  }, [page, role]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const response = await staffService.getStaffList({
        page,
        limit: 20,
        search,
        role: role || undefined,
      });
      if (response.success && response.data) {
        setStaff(response.data.staff);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      trainer: 'bg-blue-100 text-blue-800',
      staff: 'bg-purple-100 text-purple-800',
      manager: 'bg-green-100 text-green-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'first_name' as const,
      label: 'Name',
      render: (_value: string, row: StaffMember) => `${row.first_name} ${row.last_name}`,
    },
    {
      key: 'email' as const,
      label: 'Email',
    },
    {
      key: 'phone' as const,
      label: 'Phone',
    },
    {
      key: 'role_name' as const,
      label: 'Role',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(value)}`}>{value}</span>
      ),
    },
    {
      key: 'branch_name' as const,
      label: 'Branch',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(value)}`}>{value}</span>
      ),
    },
  ];

  if (loading) {
    return <TableSkeleton rows={5} cols={6} />;
  }

  return (
    <PageWrapper title="Staff Management" description="Manage gym staff members and roles">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            <option value="">All Roles</option>
            <option value="trainer">Trainer</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </PageWrapper>
  );
};
