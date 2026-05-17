#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\Admin\\Documents\\Database Project\\gym-management-system\\frontend\\UI\\src';

// Create all necessary directories
const directories = [
  'components',
  'pages\\public',
  'pages\\admin',
  'pages\\branch',
  'pages\\staff',
  'pages\\member',
  'hooks',
  'services',
  'context',
  'utils'
];

directories.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  try {
    fs.mkdirSync(fullPath, { recursive: true });
  } catch (e) {
    // Ignore errors if directory already exists
  }
});

// Now create all the component files
const componentsPath = path.join(basePath, 'components');

// Button.jsx
fs.writeFileSync(path.join(componentsPath, 'Button.jsx'), `import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
  ...props 
}) {
  const baseClass = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }[variant] || 'bg-blue-600 text-white hover:bg-blue-700';

  const sizeClass = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }[size] || 'px-4 py-2 text-base';

  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={\`\${baseClass} \${variantClass} \${sizeClass} \${disabledClass} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
`);

console.log('✓ Directories and files created successfully!');
