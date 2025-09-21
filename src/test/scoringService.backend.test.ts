import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculatePropertyScore } from '../../server/services/scoringService.js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlinkSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Backend Scoring Service (Generic Rules)', () => {
  let testDbPath: string;
  let db: Database.Database;
  let mockDbManager: any;

  beforeEach(() => {
    // Create a test database file
    testDbPath = join(__dirname, '..', '..', 'test-scoring.db');
    
    // Remove test database if it exists
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    // Create test database
    db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');

    // Create tables
    db.exec(`
      CREATE TABLE scoring_rules (
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
      );

      CREATE TABLE scoring_bands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id INTEGER NOT NULL,
        min_value REAL NOT NULL,
        max_value REAL,
        points INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rule_id) REFERENCES scoring_rules(id) ON DELETE CASCADE
      );

      CREATE TABLE scoring_enums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id INTEGER NOT NULL,
        option TEXT NOT NULL,
        points INTEGER NOT NULL,
        is_dealbreaker BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rule_id) REFERENCES scoring_rules(id) ON DELETE CASCADE
      );
    `);

    // Insert test rules
    const insertRule = db.prepare(`
      INSERT INTO scoring_rules (key, category, type, default_threshold, default_points, weight, is_dealbreaker, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Bedroom size rule (threshold)
    insertRule.run('bedroom_min_sqm', 'Sizing', 'threshold', 8.0, 10, 1.0, 1, 'Minimum bedroom size');
    
    // Total area rule (banded)
    insertRule.run('total_area_min_sqm', 'Area', 'banded', 77.0, null, 1.0, 1, 'Total living area');
    
    // Kitchen layout rule (enum)
    insertRule.run('kitchen_layout', 'Layout', 'enum', null, null, 1.0, 0, 'Kitchen layout type');

    // Get rule IDs
    const bedroomRuleId = db.prepare('SELECT id FROM scoring_rules WHERE key = ?').get('bedroom_min_sqm')?.id;
    const areaRuleId = db.prepare('SELECT id FROM scoring_rules WHERE key = ?').get('total_area_min_sqm')?.id;
    const kitchenRuleId = db.prepare('SELECT id FROM scoring_rules WHERE key = ?').get('kitchen_layout')?.id;

    // Insert area bands
    const insertBand = db.prepare(`
      INSERT INTO scoring_bands (rule_id, min_value, max_value, points)
      VALUES (?, ?, ?, ?)
    `);
    insertBand.run(areaRuleId, 77, 79, 5);
    insertBand.run(areaRuleId, 80, 85, 7);
    insertBand.run(areaRuleId, 86, 90, 9);
    insertBand.run(areaRuleId, 91, null, 10);

    // Insert kitchen enums
    const insertEnum = db.prepare(`
      INSERT INTO scoring_enums (rule_id, option, points, is_dealbreaker)
      VALUES (?, ?, ?, ?)
    `);
    insertEnum.run(kitchenRuleId, 'open', 10, 0);
    insertEnum.run(kitchenRuleId, 'relocatable', 5, 0);
    insertEnum.run(kitchenRuleId, 'closed', 0, 1);

    // Mock database manager
    mockDbManager = {
      db: db
    };
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('Threshold Rules', () => {
    it('should pass threshold rule when value meets requirement', async () => {
      const property = {
        scoring: {
          main_bedroom_sqm: 10 // Above 8.0 threshold
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(10);
      expect(result.score_normalized).toBeGreaterThan(0);
      expect(result.dealbreakers).toHaveLength(0);
      expect(result.score_breakdown.bedroom_min_sqm.score).toBe(10);
      expect(result.score_breakdown.bedroom_min_sqm.reason).toContain('meets threshold');
    });

    it('should fail threshold rule when value below requirement (dealbreaker)', async () => {
      const property = {
        scoring: {
          main_bedroom_sqm: 6 // Below 8.0 threshold
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(0);
      expect(result.score_normalized).toBe(0);
      expect(result.dealbreakers).toContain('Minimum bedroom size below threshold (6 < 8)');
      expect(result.score_breakdown.bedroom_min_sqm.score).toBe(0);
      expect(result.score_breakdown.bedroom_min_sqm.reason).toContain('below threshold');
    });
  });

  describe('Banded Rules', () => {
    it('should score correctly for banded rule', async () => {
      const property = {
        details: {
          area_sqm: 82 // Should be in 80-85 band (7 points)
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(7);
      expect(result.score_normalized).toBeGreaterThan(0);
      expect(result.dealbreakers).toHaveLength(0);
      expect(result.score_breakdown.total_area_min_sqm.score).toBe(7);
      expect(result.score_breakdown.total_area_min_sqm.reason).toContain('80-85');
    });

    it('should fail banded rule when below threshold (dealbreaker)', async () => {
      const property = {
        details: {
          area_sqm: 70 // Below 77.0 threshold
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(0);
      expect(result.score_normalized).toBe(0);
      expect(result.dealbreakers).toContain('Total living area below threshold (70 < 77)');
      expect(result.score_breakdown.total_area_min_sqm.score).toBe(0);
    });
  });

  describe('Enum Rules', () => {
    it('should score correctly for enum rule', async () => {
      const property = {
        scoring: {
          kitchen_type: 'open' // Should get 10 points
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(10);
      expect(result.score_normalized).toBeGreaterThan(0);
      expect(result.dealbreakers).toHaveLength(0);
      expect(result.score_breakdown.kitchen_layout.score).toBe(10);
      expect(result.score_breakdown.kitchen_layout.reason).toContain('open');
    });

    it('should fail enum rule when option is dealbreaker', async () => {
      const property = {
        scoring: {
          kitchen_type: 'closed' // Is a dealbreaker
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(0);
      expect(result.score_normalized).toBe(0);
      expect(result.dealbreakers).toContain('Kitchen layout type closed (dealbreaker)');
      expect(result.score_breakdown.kitchen_layout.score).toBe(0);
    });
  });

  describe('Combined Rules', () => {
    it('should calculate combined score for multiple rules', async () => {
      const property = {
        scoring: {
          main_bedroom_sqm: 10, // 10 points
          kitchen_type: 'open'  // 10 points
        },
        details: {
          area_sqm: 85 // 7 points
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(27); // 10 + 10 + 7
      expect(result.score_normalized).toBeGreaterThan(0);
      expect(result.dealbreakers).toHaveLength(0);
    });

    it('should return 0 score when any dealbreaker is triggered', async () => {
      const property = {
        scoring: {
          main_bedroom_sqm: 6,  // Dealbreaker
          kitchen_type: 'open'  // 10 points
        },
        details: {
          area_sqm: 85 // 7 points
        }
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(0); // Dealbreaker triggered
      expect(result.score_normalized).toBe(0);
      expect(result.dealbreakers).toHaveLength(1);
    });
  });

  describe('Missing Data Handling', () => {
    it('should handle missing property values gracefully', async () => {
      const property = {
        // No scoring data
      };

      const result = await calculatePropertyScore(property, mockDbManager);

      expect(result.score_raw).toBe(0);
      expect(result.score_normalized).toBe(0);
      expect(result.dealbreakers).toHaveLength(0);
      expect(result.score_breakdown.bedroom_min_sqm.reason).toContain('not specified');
    });
  });
});
