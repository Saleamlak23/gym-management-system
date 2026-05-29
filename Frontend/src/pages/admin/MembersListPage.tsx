import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Member } from '@/types';
import { membersService } from '@/services/members.service';
import { useExportData } from '@/hooks/useExportData';

export const MembersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { exportToCSV, exportToJSON } = useExportData();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    loadMembers();
  }, [page, status]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await membersService.getMembers({
        page,
        limit: 20,
        search,
        status: status || undefined,
      });
      if (response.success && response.data) {
        setMembers(response.data.members);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      frozen: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'first_name' as const,
      label: 'Name',
      render: (_value: string, row: Member) => `${row.first_name} ${row.last_name}`,
    },
    {
      key: 'email' as const,
      label: 'Email',
    },
    {
      key: 'join_date' as const,
      label: 'Join Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'subscription_status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(value)}`}>{value}</span>
      ),
    },
    {
      key: 'total_visits' as const,
      label: 'Visits',
    },
  ];

  return (
    <PageWrapper title="Members" description="Manage gym members and their subscriptions">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row sm:items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="frozen">Frozen</option>
          </select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV('members', members)}
              className="flex items-center gap-2"
              disabled={members.length === 0}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToJSON('members', members)}
              className="flex items-center gap-2"
              disabled={members.length === 0}
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        onRowClick={(row) => navigate(`/admin/members/${row.member_id}`)}
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </PageWrapper>
  );
};
