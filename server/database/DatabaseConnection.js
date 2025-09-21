import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DatabaseMigrations from './migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Handles database connection and initialization
 * Single Responsibility: Database connection management
 */
class DatabaseConnection {
  constructor() {
    const dbPath = join(__dirname, '..', '..', 'homesearch.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  init() {
    // Run database migrations
    const migrations = new DatabaseMigrations();
    migrations.init();
    migrations.close();
    
    console.log('✅ Database initialized');
  }

  getConnection() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export default DatabaseConnection;
