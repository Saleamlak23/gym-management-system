import React, { useEffect, useState } from 'react';
import { Wrench, AlertCircle } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { DataTable } from '@/components/ui/DataTable';
import { TableSkeleton } from '@/components/Skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { equipmentService } from '@/services/equipment.service';

interface Equipment {
  equipment_id: number;
  name: string;
  category: string;
  status: string;
  purchase_date: string;
  last_maintenance: string;
  branch_id: number;
}

export const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    loadEquipment();
  }, [page, category]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const response = await equipmentService.getEquipment({
        page,
        limit: 20,
        search,
        category: category || undefined,
      });
      if (response.success && response.data) {
        setEquipment(response.data.equipment);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      damaged: 'bg-red-100 text-red-800',
      retired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'name' as const,
      label: 'Equipment Name',
    },
    {
      key: 'category' as const,
      label: 'Category',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(value)}`}>{value}</span>
      ),
    },
    {
      key: 'purchase_date' as const,
      label: 'Purchase Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'last_maintenance' as const,
      label: 'Last Maintenance',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Never',
    },
  ];

  if (loading) {
    return <TableSkeleton rows={5} cols={5} />;
  }

  return (
    <PageWrapper title="Equipment Management" description="Track and manage gym equipment">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            <option value="">All Categories</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="functional">Functional</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={equipment}
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
