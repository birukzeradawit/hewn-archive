const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n');
  
  try {
    // Delete test archive item
    const archiveResult = await pool.query(
      "DELETE FROM archive_items WHERE title LIKE '%Test%' OR title LIKE '%test%'"
    );
    console.log(`✅ Deleted ${archiveResult.rowCount} test archive items`);

    // Delete test content
    const contentResult = await pool.query(
      "DELETE FROM content WHERE title LIKE '%Test%' OR title LIKE '%test%'"
    );
    console.log(`✅ Deleted ${contentResult.rowCount} test content items`);

    // Delete test users (keep admin user)
    const userResult = await pool.query(
      "DELETE FROM users WHERE username != 'nm' AND email != 'biruk5063@gmail.com'"
    );
    console.log(`✅ Deleted ${userResult.rowCount} test users`);

    // Check remaining data
    const archiveCount = await pool.query('SELECT COUNT(*) as count FROM archive_items');
    const contentCount = await pool.query('SELECT COUNT(*) as count FROM content');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`\n📊 Remaining data:`);
    console.log(`  Archive items: ${archiveCount.rows[0].count}`);
    console.log(`  Content items: ${contentCount.rows[0].count}`);
    console.log(`  Users: ${userCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

cleanupTestData();
