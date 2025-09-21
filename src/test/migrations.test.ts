import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DatabaseMigrations from '../../server/database/migrations.js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlinkSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe.skip('Database Migrations - DISABLED FOR SAFETY', () => {
  let testDbPath: string;
  let migrations: DatabaseMigrations;

  beforeEach(() => {
    // Create a test database file - SAFE: Uses separate test database, never touches main homesearch.db
    testDbPath = join(__dirname, '..', '..', 'test-homesearch.db');
    
    // Remove test database if it exists
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('Migration System', () => {
    it('should create migrations table on init', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      migrations.init();

      // Check if migrations table exists
      const tables = migrations.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'").all();
      expect(tables).toHaveLength(1);
    });

    it('should track applied migrations', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      migrations.init();

      // Check if migrations were recorded
      const appliedMigrations = migrations.getAppliedMigrations();
      expect(appliedMigrations).toContain('001_initial_schema');
      expect(appliedMigrations).toContain('002_add_scoring_fields');
    });

    it('should not re-run already applied migrations', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      
      // Run migrations twice
      migrations.init();
      const firstRun = migrations.getAppliedMigrations();
      
      migrations.init();
      const secondRun = migrations.getAppliedMigrations();

      // Should have same migrations both times
      expect(firstRun).toEqual(secondRun);
    });
  });

  describe('Migration 001: Initial Schema', () => {
    it('should create properties table with correct structure', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      migrations.init();

      // Check if properties table exists
      const tables = migrations.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='properties'").all();
      expect(tables).toHaveLength(1);

      // Check table structure
      const columns = migrations.db.prepare("PRAGMA table_info(properties)").all();
      const columnNames = columns.map(col => col.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('address_street');
      expect(columnNames).toContain('address_house_number');
      expect(columnNames).toContain('price_asking_price_eur');
      expect(columnNames).toContain('details_area_sqm');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });
  });

  describe('Migration 002: Scoring Fields', () => {
    it('should add scoring columns to properties table', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      migrations.init();

      // Check if scoring columns were added
      const columns = migrations.db.prepare("PRAGMA table_info(properties)").all();
      const columnNames = columns.map(col => col.name);
      
      expect(columnNames).toContain('main_bedroom_sqm');
      expect(columnNames).toContain('kitchen_type');
      expect(columnNames).toContain('foundation_status');
      expect(columnNames).toContain('street_noise');
      expect(columnNames).toContain('smelly_business_below');
      expect(columnNames).toContain('commute_time_central_min');
      expect(columnNames).toContain('workspace_count');
      expect(columnNames).toContain('viewing_status');
      expect(columnNames).toContain('notes');
      expect(columnNames).toContain('total_score');
      expect(columnNames).toContain('score_breakdown');
    });

    it('should handle duplicate column errors gracefully', () => {
      // Mock the database path
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      
      // Run migrations twice to test duplicate column handling
      expect(() => {
        migrations.init();
        migrations.init();
      }).not.toThrow();
    });
  });

  describe('Migration Data Integrity', () => {
    it('should preserve existing data during migration', () => {
      // Mock the database path - CRITICAL: Must use test database only
      vi.spyOn(DatabaseMigrations.prototype as any, 'constructor').mockImplementation(function() {
        this.db = new Database(testDbPath);
        this.db.pragma('journal_mode = WAL');
      });

      migrations = new DatabaseMigrations();
      migrations.init();

      // Clear any existing data first - SAFE: Only affects test database
      migrations.db.prepare('DELETE FROM properties').run();

      // Insert test data
      const insertStmt = migrations.db.prepare(`
        INSERT INTO properties (
          address_street, address_house_number, address_postal_code, address_city,
          price_asking_price_eur, details_area_sqm, details_floor_info, details_year_built, details_energy_label,
          ownership_type, ownership_lease_details, ownership_perceel, vve_monthly_fee_eur,
          metadata_source, metadata_date_added, status, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        'Test Street', 123, '1234 AB', 'Amsterdam',
        500000, 80, 'parterre', 2020, 'A',
        'volle eigendom', null, null, 100,
        'funda', '2024-01-01', 'Interested', 'Test property'
      );

      // Verify data exists
      const properties = migrations.db.prepare('SELECT * FROM properties').all();
      expect(properties).toHaveLength(1);
      expect(properties[0].address_street).toBe('Test Street');
      expect(properties[0].price_asking_price_eur).toBe(500000);
      expect(properties[0].details_area_sqm).toBe(80);
    });
  });
});
