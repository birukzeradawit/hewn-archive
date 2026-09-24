const pool = require('./config/database');

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        // Ignore duplicate table errors
        if (!error.message.includes('already exists')) {
          console.error('✗ Error:', error.message);
        }
      }
    }
    
    console.log('Database initialization completed successfully!');
    
    // Test connection by querying categories
    const result = await pool.query('SELECT * FROM categories');
    console.log(`Found ${result.rows.length} categories in database`);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();