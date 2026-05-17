import React from 'react'

const Input = ({ label, error, type = 'text', placeholder, value, onChange }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
          error
            ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
            : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input
