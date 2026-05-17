const fs = require('fs');
const path = require('path');

const basePath = process.argv[2] || 'c:\\Users\\Admin\\Documents\\Database Project\\gym-management-system\\frontend\\UI\\src';

const dirs = [
  'components',
  'pages',
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

dirs.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log('✓ Created: ' + dir);
  } else {
    console.log('✓ Exists: ' + dir);
  }
});

console.log('\n✓ All directories created successfully!');
