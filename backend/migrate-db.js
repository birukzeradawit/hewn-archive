const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function migrateDatabase() {
  console.log('🔄 Running database migration...\n');
  
  try {
    // Add email verification and password reset fields to users table
    const alterUsersTable = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE
    `;
    
    await pool.query(alterUsersTable);
    console.log('✅ Added email verification and password reset fields to users table');
    
    // Check if is_verified column exists and migrate data
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_verified'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('📋 Found is_verified column, migrating data...');
      
      await pool.query(`
        UPDATE users 
        SET email_verified = is_verified
      `);
      console.log('✅ Migrated data from is_verified to email_verified');
      
      await pool.query(`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS is_verified
      `);
      console.log('✅ Dropped old is_verified column');
    } else {
      console.log('ℹ️  is_verified column does not exist, no migration needed');
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

migrateDatabase();