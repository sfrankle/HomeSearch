import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseMigrations {
  constructor() {
    const dbPath = join(__dirname, '..', '..', 'homesearch.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  init() {
    // Create migrations table if it doesn't exist
    this.createMigrationsTable();
    
    // Run all pending migrations
    this.runMigrations();
    
    console.log('✅ Database migrations completed');
  }

  createMigrationsTable() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.exec(createTable);
  }

  getAppliedMigrations() {
    const stmt = this.db.prepare('SELECT version FROM migrations ORDER BY version');
    return stmt.all().map(row => row.version);
  }

  markMigrationApplied(version) {
    const stmt = this.db.prepare('INSERT INTO migrations (version) VALUES (?)');
    stmt.run(version);
  }

  runMigrations() {
    const appliedMigrations = this.getAppliedMigrations();
    const allMigrations = this.getAllMigrations();

    for (const migration of allMigrations) {
      if (!appliedMigrations.includes(migration.version)) {
        console.log(`🔄 Running migration: ${migration.version}`);
        migration.up(this.db);
        this.markMigrationApplied(migration.version);
        console.log(`✅ Migration ${migration.version} completed`);
      }
    }
  }

  getAllMigrations() {
    return [
      {
        version: '001_initial_schema',
        up: (db) => {
          const createTable = `
            CREATE TABLE IF NOT EXISTS properties (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              link TEXT,
              address_street TEXT NOT NULL,
              address_house_number INTEGER NOT NULL,
              address_postal_code TEXT NOT NULL,
              address_city TEXT NOT NULL,
              price_asking_price_eur INTEGER NOT NULL,
              details_area_sqm INTEGER,
              details_floor_info TEXT,
              details_year_built INTEGER,
              details_energy_label TEXT,
              ownership_type TEXT,
              ownership_lease_details TEXT,
              ownership_perceel TEXT,
              vve_monthly_fee_eur REAL,
              metadata_source TEXT DEFAULT 'funda',
              metadata_date_added TEXT,
              main_bedroom_long_edge REAL,
              main_bedroom_short_edge REAL,
              guest_room_long_edge REAL,
              guest_room_short_edge REAL,
              status TEXT DEFAULT 'Interested',
              comments TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `;
          db.exec(createTable);
        }
      },
      {
        version: '002_add_scoring_fields',
        up: (db) => {
          // Add scoring fields to existing properties table
          const addColumns = [
            'ALTER TABLE properties ADD COLUMN main_bedroom_sqm REAL',
            'ALTER TABLE properties ADD COLUMN kitchen_type TEXT',
            'ALTER TABLE properties ADD COLUMN foundation_status TEXT',
            'ALTER TABLE properties ADD COLUMN street_noise TEXT',
            'ALTER TABLE properties ADD COLUMN smelly_business_below BOOLEAN',
            'ALTER TABLE properties ADD COLUMN commute_time_central_min INTEGER',
            'ALTER TABLE properties ADD COLUMN workspace_count INTEGER',
            'ALTER TABLE properties ADD COLUMN viewing_status TEXT',
            'ALTER TABLE properties ADD COLUMN notes TEXT',
            'ALTER TABLE properties ADD COLUMN total_score INTEGER DEFAULT 0',
            'ALTER TABLE properties ADD COLUMN score_breakdown TEXT'
          ];

          for (const sql of addColumns) {
            try {
              db.exec(sql);
            } catch (error) {
              // Column might already exist, ignore the error
              if (!error.message.includes('duplicate column name')) {
                throw error;
              }
            }
          }
        }
      },
      {
        version: '003_add_scoring_config_tables',
        up: (db) => {
          // Create scoring configuration tables
          const createTables = [
            // Main scoring configuration table
            `CREATE TABLE IF NOT EXISTS scoring_config (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              key TEXT UNIQUE NOT NULL,
              value TEXT NOT NULL,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Scoring bands for total area
            `CREATE TABLE IF NOT EXISTS scoring_bands_total_area (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              min_sqm REAL NOT NULL,
              max_sqm REAL,
              points INTEGER NOT NULL,
              weight REAL DEFAULT 1.0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Scoring bands for budget
            `CREATE TABLE IF NOT EXISTS scoring_bands_budget (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              min_price INTEGER NOT NULL,
              max_price INTEGER,
              points INTEGER NOT NULL,
              weight REAL DEFAULT 1.0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Kitchen layout scoring points
            `CREATE TABLE IF NOT EXISTS scoring_kitchen_points (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              kitchen_type TEXT UNIQUE NOT NULL,
              points INTEGER NOT NULL,
              is_dealbreaker BOOLEAN DEFAULT 0,
              weight REAL DEFAULT 1.0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          ];

          for (const sql of createTables) {
            db.exec(sql);
          }
        }
      },
      {
        version: '004_seed_scoring_config',
        up: (db) => {
          // Seed default scoring configuration values
          const configValues = [
            // Bedroom size configuration
            { key: 'bedroom_min_sqm', value: '8.0', description: 'Minimum bedroom size in m² (dealbreaker threshold)' },
            { key: 'bedroom_points', value: '10', description: 'Points awarded when bedroom meets minimum threshold' },
            { key: 'weight_bedroom', value: '1.0', description: 'Weight multiplier for bedroom scoring' },
            
            // Total area configuration
            { key: 'total_area_min_sqm', value: '77.0', description: 'Minimum total area in m² (dealbreaker threshold)' },
            { key: 'weight_total_area', value: '1.0', description: 'Weight multiplier for total area scoring' },
            
            // Floor entrance configuration
            { key: 'floor_max_entrance', value: '2', description: 'Maximum floor number allowed (dealbreaker threshold)' },
            { key: 'weight_floor_entrance', value: '1.0', description: 'Weight multiplier for floor entrance scoring' },
            
            // Budget configuration
            { key: 'weight_budget', value: '1.0', description: 'Weight multiplier for budget scoring' },
            
            // Kitchen layout configuration
            { key: 'weight_kitchen_layout', value: '1.0', description: 'Weight multiplier for kitchen layout scoring' }
          ];

          const insertConfig = db.prepare(`
            INSERT OR IGNORE INTO scoring_config (key, value, description) 
            VALUES (?, ?, ?)
          `);

          for (const config of configValues) {
            insertConfig.run(config.key, config.value, config.description);
          }

          // Seed total area bands
          const areaBands = [
            { min_sqm: 77, max_sqm: 79, points: 5 },
            { min_sqm: 80, max_sqm: 85, points: 7 },
            { min_sqm: 86, max_sqm: 90, points: 9 },
            { min_sqm: 91, max_sqm: null, points: 10 }
          ];

          const insertAreaBand = db.prepare(`
            INSERT OR IGNORE INTO scoring_bands_total_area (min_sqm, max_sqm, points) 
            VALUES (?, ?, ?)
          `);

          for (const band of areaBands) {
            insertAreaBand.run(band.min_sqm, band.max_sqm, band.points);
          }

          // Seed budget bands
          const budgetBands = [
            { min_price: 0, max_price: 750000, points: 10 },
            { min_price: 751000, max_price: 790000, points: 5 },
            { min_price: 791000, max_price: null, points: -5 }
          ];

          const insertBudgetBand = db.prepare(`
            INSERT OR IGNORE INTO scoring_bands_budget (min_price, max_price, points) 
            VALUES (?, ?, ?)
          `);

          for (const band of budgetBands) {
            insertBudgetBand.run(band.min_price, band.max_price, band.points);
          }

          // Seed kitchen layout points
          const kitchenTypes = [
            { kitchen_type: 'open', points: 10, is_dealbreaker: 0 },
            { kitchen_type: 'relocatable', points: 5, is_dealbreaker: 0 },
            { kitchen_type: 'closed', points: 0, is_dealbreaker: 1 }
          ];

          const insertKitchen = db.prepare(`
            INSERT OR IGNORE INTO scoring_kitchen_points (kitchen_type, points, is_dealbreaker) 
            VALUES (?, ?, ?)
          `);

          for (const kitchen of kitchenTypes) {
            insertKitchen.run(kitchen.kitchen_type, kitchen.points, kitchen.is_dealbreaker);
          }
        }
      },
      {
        version: '005_add_missing_commute_fields',
        up: (db) => {
          // Add missing commute time fields to properties table
          const addColumns = [
            'ALTER TABLE properties ADD COLUMN commute_time_mark_min INTEGER',
            'ALTER TABLE properties ADD COLUMN commute_time_sarah_min INTEGER'
          ];

          for (const sql of addColumns) {
            try {
              db.exec(sql);
            } catch (error) {
              // Column might already exist, ignore the error
              if (!error.message.includes('duplicate column name')) {
                throw error;
              }
            }
          }
        }
      },
      {
        version: '006_generic_scoring_system',
        up: (db) => {
          // Create new generic scoring tables
          const createTables = [
            // Main scoring rules table
            `CREATE TABLE IF NOT EXISTS scoring_rules (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              key TEXT UNIQUE NOT NULL,
              category TEXT NOT NULL,
              type TEXT NOT NULL,
              default_threshold REAL,
              default_points INTEGER,
              weight REAL DEFAULT 1.0,
              is_dealbreaker BOOLEAN DEFAULT 0,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Scoring bands for banded rules
            `CREATE TABLE IF NOT EXISTS scoring_bands (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              rule_id INTEGER NOT NULL,
              min_value REAL NOT NULL,
              max_value REAL,
              points INTEGER NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (rule_id) REFERENCES scoring_rules(id) ON DELETE CASCADE
            )`,
            
            // Scoring enums for enum-based rules
            `CREATE TABLE IF NOT EXISTS scoring_enums (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              rule_id INTEGER NOT NULL,
              option TEXT NOT NULL,
              points INTEGER NOT NULL,
              is_dealbreaker BOOLEAN DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (rule_id) REFERENCES scoring_rules(id) ON DELETE CASCADE
            )`
          ];

          for (const sql of createTables) {
            db.exec(sql);
          }
        }
      },
      {
        version: '007_migrate_existing_scoring_data',
        up: (db) => {
          // Migrate existing scoring configuration to new generic structure
          
          // Insert scoring rules
          const rules = [
            {
              key: 'bedroom_min_sqm',
              category: 'Sizing',
              type: 'threshold',
              default_threshold: 8.0,
              default_points: 10,
              weight: 1.0,
              is_dealbreaker: 1,
              description: 'Minimum bedroom size in m² (dealbreaker threshold)'
            },
            {
              key: 'total_area_min_sqm',
              category: 'Area',
              type: 'banded',
              default_threshold: 77.0,
              weight: 1.0,
              is_dealbreaker: 1,
              description: 'Minimum total area in m² (dealbreaker threshold)'
            },
            {
              key: 'floor_max_entrance',
              category: 'Access',
              type: 'threshold',
              default_threshold: 2,
              default_points: 10,
              weight: 1.0,
              is_dealbreaker: 1,
              description: 'Maximum floor number allowed (dealbreaker threshold)'
            },
            {
              key: 'budget_max_price',
              category: 'Financials',
              type: 'banded',
              weight: 1.0,
              is_dealbreaker: 0,
              description: 'Budget scoring based on price bands'
            },
            {
              key: 'kitchen_layout',
              category: 'Layout',
              type: 'enum',
              weight: 1.0,
              is_dealbreaker: 0,
              description: 'Kitchen layout scoring'
            }
          ];

          const insertRule = db.prepare(`
            INSERT OR IGNORE INTO scoring_rules (key, category, type, default_threshold, default_points, weight, is_dealbreaker, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const rule of rules) {
            insertRule.run(
              rule.key,
              rule.category,
              rule.type,
              rule.default_threshold,
              rule.default_points,
              rule.weight,
              rule.is_dealbreaker,
              rule.description
            );
          }

          // Get rule IDs for foreign key references
          const getRuleId = db.prepare('SELECT id FROM scoring_rules WHERE key = ?');
          
          // Migrate total area bands
          const totalAreaRuleId = getRuleId.get('total_area_min_sqm')?.id;
          if (totalAreaRuleId) {
            const areaBands = [
              { min_value: 77, max_value: 79, points: 5 },
              { min_value: 80, max_value: 85, points: 7 },
              { min_value: 86, max_value: 90, points: 9 },
              { min_value: 91, max_value: null, points: 10 }
            ];

            const insertBand = db.prepare(`
              INSERT OR IGNORE INTO scoring_bands (rule_id, min_value, max_value, points)
              VALUES (?, ?, ?, ?)
            `);

            for (const band of areaBands) {
              insertBand.run(totalAreaRuleId, band.min_value, band.max_value, band.points);
            }
          }

          // Migrate budget bands
          const budgetRuleId = getRuleId.get('budget_max_price')?.id;
          if (budgetRuleId) {
            const budgetBands = [
              { min_value: 0, max_value: 750000, points: 10 },
              { min_value: 751000, max_value: 790000, points: 5 },
              { min_value: 791000, max_value: null, points: -5 }
            ];

            const insertBand = db.prepare(`
              INSERT OR IGNORE INTO scoring_bands (rule_id, min_value, max_value, points)
              VALUES (?, ?, ?, ?)
            `);

            for (const band of budgetBands) {
              insertBand.run(budgetRuleId, band.min_value, band.max_value, band.points);
            }
          }

          // Migrate kitchen layout enums
          const kitchenRuleId = getRuleId.get('kitchen_layout')?.id;
          if (kitchenRuleId) {
            const kitchenTypes = [
              { option: 'open', points: 10, is_dealbreaker: 0 },
              { option: 'relocatable', points: 5, is_dealbreaker: 0 },
              { option: 'closed', points: 0, is_dealbreaker: 1 }
            ];

            const insertEnum = db.prepare(`
              INSERT OR IGNORE INTO scoring_enums (rule_id, option, points, is_dealbreaker)
              VALUES (?, ?, ?, ?)
            `);

            for (const kitchen of kitchenTypes) {
              insertEnum.run(kitchenRuleId, kitchen.option, kitchen.points, kitchen.is_dealbreaker);
            }
          }
        }
      }
    ];
  }

  close() {
    this.db.close();
  }
}

export default DatabaseMigrations;
