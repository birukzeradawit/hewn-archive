const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  console.log('🔍 Checking database connectivity and data...\n');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');
    
    // Check tables
    const tables = ['users', 'categories', 'content', 'archive_items', 'partners', 'knowledge_resources'];
    
    console.log('📊 Database Tables:');
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ✓ ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`  ✗ ${table}: Error - ${error.message}`);
      }
    }
    
    // Check specific data
    console.log('\n👥 Users:');
    const users = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    if (users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.role} - ${new Date(user.created_at).toLocaleString()}`);
      });
    } else {
      console.log('  No users found yet');
    }
    
    console.log('\n📁 Categories:');
    const categories = await pool.query('SELECT * FROM categories');
    categories.rows.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description}`);
    });
    
    console.log('\n📝 Recent Content:');
    const content = await pool.query('SELECT title, published, created_at FROM content ORDER BY created_at DESC LIMIT 3');
    if (content.rows.length > 0) {
      content.rows.forEach(item => {
        console.log(`  - ${item.title} (Published: ${item.published}) - ${new Date(item.created_at).toLocaleString()}`);
      });
    } else {
      console.log('  No content found yet');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

checkDatabase();