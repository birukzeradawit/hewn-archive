const { Pool } = require('pg');

const connectionString = 'postgres://23ba521b480fac9174e7c3d77eeaa22b9699611871bfb371edbae69c03d0ac66:sk_u5uQz3XEmTBOn1w7L3Z9k@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup database
async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    // Backup all tables
    const tables = ['users', 'categories', 'content', 'archive_items', 'partners', 'knowledge_resources'];
    const backupData = {};
    
    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table}`);
      backupData[table] = result.rows;
      console.log(`Backed up ${result.rows.length} records from ${table}`);
    }
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup completed: ${backupFile}`);
    console.log(`Total size: ${fs.statSync(backupFile).size} bytes`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Restore database from backup
async function restoreDatabase(backupFile) {
  try {
    console.log('Starting database restore...');
    
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // Clear existing data
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM knowledge_resources');
    await pool.query('DELETE FROM partners');
    await pool.query('DELETE FROM archive_items');
    await pool.query('DELETE FROM content');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');
    
    // Restore data
    for (const table of ['users', 'categories', 'content', 'archive_items', 'partners', 'knowledge_resources']) {
      if (backupData[table] && backupData[table].length > 0) {
        const columns = Object.keys(backupData[table][0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        for (const row of backupData[table]) {
          const values = columns.map(col => row[col]);
          await pool.query(
            `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`,
            values
          );
        }
        
        console.log(`Restored ${backupData[table].length} records to ${table}`);
      }
    }
    
    console.log('✅ Restore completed successfully');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// List available backups
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    console.log('Available backups:');
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${file} (${stats.size} bytes) - ${stats.mtime.toISOString()}`);
    });
    
    return files;
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

// Delete old backups (keep last 10)
function cleanupBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted old backup: ${file}`);
      });
    }
  } catch (error) {
    console.error('Failed to cleanup backups:', error);
  }
}

// Command line interface
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
  case 'backup':
    backupDatabase()
      .then(() => cleanupBackups())
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case 'restore':
    if (!argument) {
      console.error('Please specify backup file: node backup.js restore <backup-file>');
      process.exit(1);
    }
    restoreDatabase(path.join(BACKUP_DIR, argument))
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case 'list':
    listBackups();
    process.exit(0);
    break;
  default:
    console.log('Usage:');
    console.log('  node backup.js backup          - Create database backup');
    console.log('  node backup.js restore <file>  - Restore from backup file');
    console.log('  node backup.js list            - List available backups');
    process.exit(1);
}