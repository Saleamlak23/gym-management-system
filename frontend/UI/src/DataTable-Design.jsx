import React, { useState } from 'react'

// Import Button component (adjust path as needed in actual implementation)
const Button = ({ variant = 'primary', size = 'md', disabled = false, onClick, children }) => (
  <button className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
    variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
    variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' :
    'bg-red-600 text-white hover:bg-red-700'
  } ${size === 'sm' ? 'px-2 py-1 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-base'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  disabled={disabled} onClick={onClick}>{children}</button>
)

const DataTable = ({ columns = [], data = [], loading = false, onEdit, onDelete, onAddNew }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  let sortedData = [...data]
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Button variant="primary" size="md" onClick={onAddNew}>
          Add New
        </Button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortColumn === col.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(row.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(row.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
