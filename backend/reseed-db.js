import fs from 'fs';
import path from 'path';
import { query } from './src/config/db.js';

async function reseedDatabase() {
  try {
    console.log('🔄 Reseeding database...\n');

    // Read schema and seed SQL files
    const schemaSQL = fs.readFileSync(
      path.join(process.cwd(), '../database/schema.sql'),
      'utf-8'
    );
    const seedSQL = fs.readFileSync(
      path.join(process.cwd(), '../database/seed.sql'),
      'utf-8'
    );

    // Execute entire schema as one query
    console.log('🛠️  Executing schema...');
    await query(schemaSQL);
    console.log('✅ Schema created\n');

    // Execute entire seed as one query
    console.log('🌱 Seeding data...');
    await query(seedSQL);
    console.log('✅ Database reseeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reseeding database:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

reseedDatabase();
