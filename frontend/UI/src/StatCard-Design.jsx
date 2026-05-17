import React from 'react'

const StatCard = ({ label, value, icon: Icon, trend = 'neutral' }) => {
  const trendStyles = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L9.414 13H12z" clipRule="evenodd" />
          </svg>
        )
      case 'neutral':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 10a1 1 0 112 0 1 1 0 01-2 0zM10 10a1 1 0 112 0 1 1 0 01-2 0zM14 10a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="bg-blue-100 rounded-lg p-3">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className={trendStyles[trend]}>
        {getTrendIcon()}
      </div>
    </div>
  )
}

export default StatCard
