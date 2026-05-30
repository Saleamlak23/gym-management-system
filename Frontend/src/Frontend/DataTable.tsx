import React, { useState } from 'react';
import { ChevronDown, Edit, Trash2, Search, Plus, ChevronUp, ChevronsUp, ChevronsDown } from 'lucide-react';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  title: string;
  onAddNew?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  title,
  onAddNew,
  onEdit,
  onDelete,
  loading = false,
  searchable = true,
  sortable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  let filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortConfig) {
    filteredData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((_, i) => i)));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-orange-100 text-orange-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-blue-100 text-blue-800',
      attended: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      suspended: 'bg-red-100 text-red-800',
      retired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add New
          </button>
        )}
      </div>

      {/* Search & Filters */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedRows.size} selected
              </span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Bulk Actions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronsUp
                          size={14}
                          className={`-mb-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-300'
                          }`}
                        />
                        <ChevronsDown
                          size={14}
                          className={`${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    selectedRows.has(rowIndex) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRowSelection(rowIndex)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column.key}`} className="px-6 py-4 text-sm text-gray-700">
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : ['status', 'state', 'type'].includes(column.key.toLowerCase()) ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row[column.key])}`}>
                          {String(row[column.key]).replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filteredData.length} of {data.length} entries</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Previous
          </button>
          <span className="px-3 py-1">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
