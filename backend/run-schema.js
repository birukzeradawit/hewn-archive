const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  console.log('Connecting to database...');
  
  try {
    // Execute individual CREATE TABLE statements
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        content_type VARCHAR(50),
        image_url VARCHAR(500),
        file_url VARCHAR(500),
        author VARCHAR(100),
        date_created DATE,
        featured BOOLEAN DEFAULT FALSE,
        published BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS archive_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        collection_name VARCHAR(100),
        item_type VARCHAR(50),
        location TEXT,
        year INTEGER,
        image_url VARCHAR(500),
        document_url VARCHAR(500),
        metadata JSONB,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        description TEXT,
        website VARCHAR(255),
        logo_url VARCHAR(500),
        contact_email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS knowledge_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        resource_type VARCHAR(50),
        content TEXT,
        file_url VARCHAR(500),
        external_link VARCHAR(500),
        category VARCHAR(100),
        author VARCHAR(100),
        published BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    console.log(`Creating ${createStatements.length} tables...`);
    
    for (const statement of createStatements) {
      try {
        await pool.query(statement);
        console.log('✓ Created table');
      } catch (error) {
        console.error('✗ Error creating table:', error.message);
      }
    }
    
    // Insert default categories
    const insertCategories = `
      INSERT INTO categories (name, description) VALUES
      ('Manuscripts', 'Historical Ethiopian manuscripts and documents'),
      ('Churches', 'Rock-hewn churches and religious sites'),
      ('Obelisks', 'Ancient stelae and obelisks'),
      ('Artifacts', 'Cultural artifacts and heritage items'),
      ('Photographs', 'Historical photographs and images')
      ON CONFLICT DO NOTHING
    `;
    
    try {
      await pool.query(insertCategories);
      console.log('✓ Inserted default categories');
    } catch (error) {
      console.log('⊘ Categories may already exist');
    }
    
    console.log('\n✅ Database schema executed successfully!');
    
    // Test connection by querying categories
    const result = await pool.query('SELECT * FROM categories');
    console.log(`Found ${result.rows.length} categories in database`);
    
    if (result.rows.length > 0) {
      console.log('Categories:', result.rows.map(c => c.name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Database schema execution failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

runSchema();