import React from 'react'

const Badge = ({ status = 'active' }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }

  const statusText = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {statusText}
    </span>
  )
}

export default Badge
