const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function addTestData() {
  console.log('🔧 Adding test data...\n');
  
  try {
    // Add test partners
    await pool.query(`
      INSERT INTO partners (name, organization, description, website, logo_url, contact_email)
      VALUES 
        ('Ethiopian Studies Institute', 'Research Institute', 'Leading research institute for Ethiopian studies', 'https://esi.edu.et', '', 'contact@esi.edu.et'),
        ('Center for African Studies', 'Academic Center', 'Dedicated to research and documentation of African heritage', 'https://cas.edu', '', 'info@cas.edu'),
        ('Heritage Conservation Network', 'NGO', 'International network for heritage conservation', 'https://hcn.org', '', 'info@hcn.org')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Added 3 test partners');

    // Add test knowledge resources
    await pool.query(`
      INSERT INTO knowledge_resources (title, description, resource_type, content, file_url, external_link, category, author, published, created_by)
      VALUES 
        ('Introduction to Ethiopian Manuscripts', 'A comprehensive guide to Ethiopian manuscript traditions', 'article', 'Ethiopian manuscripts represent one of the richest literary traditions in Africa...', '', '', 'Manuscripts', 'Dr. Alemu', true, 1),
        ('GIS Mapping for Heritage Sites', 'Technical guide for using GIS in heritage documentation', 'guide', 'Geographic Information Systems (GIS) provide powerful tools for documenting...', '', '', 'Technology', 'Tech Team', true, 1),
        ('Rock-Hewn Churches Documentation', 'Documentation standards for rock-hewn churches', 'document', 'This document outlines the standard procedures for documenting...', '', '', 'Churches', 'Heritage Team', true, 1)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Added 3 test knowledge resources');

    // Verify data
    const partnersResult = await pool.query('SELECT COUNT(*) as count FROM partners');
    const knowledgeResult = await pool.query('SELECT COUNT(*) as count FROM knowledge_resources');
    
    console.log(`\n📊 Current Database Status:`);
    console.log(`  Partners: ${partnersResult.rows[0].count} records`);
    console.log(`  Knowledge Resources: ${knowledgeResult.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

addTestData();
