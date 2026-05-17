import React from 'react'

const PageWrapper = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {title && (
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        )}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default PageWrapper
