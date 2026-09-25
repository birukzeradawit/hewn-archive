const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }
    
    console.log('Current users:');
    usersResult.rows.forEach(user => {
      console.log(`  ${user.id}. ${user.username} (${user.email}) - ${user.role}`);
    });
    
    // Update the first user to admin role
    const firstUser = usersResult.rows[0];
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['admin', firstUser.id]
    );
    
    console.log(`\n✅ User "${firstUser.username}" (${firstUser.email}) has been updated to admin role.`);
    console.log(`📋 You can now access the admin dashboard at: admin.html`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

createAdminUser();