/**
 * Handles generic scoring configuration CRUD operations
 * Single Responsibility: Scoring configuration data access with generic rule management
 */
class ScoringConfigRepository {
  constructor(db) {
    this.db = db;
  }

  // ===== RULE MANAGEMENT =====

  /**
   * Get all scoring rules with their configuration
   */
  getAllRules() {
    const stmt = this.db.prepare(`
      SELECT * FROM scoring_rules 
      ORDER BY category, key
    `);
    return stmt.all();
  }

  /**
   * Get a specific rule by key
   */
  getRuleByKey(key) {
    const stmt = this.db.prepare('SELECT * FROM scoring_rules WHERE key = ?');
    return stmt.get(key);
  }

  /**
   * Create a new scoring rule
   */
  createRule(rule) {
    const stmt = this.db.prepare(`
      INSERT INTO scoring_rules (key, category, type, default_threshold, default_points, weight, is_dealbreaker, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
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

  /**
   * Update a scoring rule
   */
  updateRule(key, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(updateKey => {
      if (updates[updateKey] !== undefined) {
        fields.push(`${updateKey} = ?`);
        values.push(updates[updateKey]);
      }
    });
    
    if (fields.length === 0) return { changes: 0 };
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(key);
    
    const stmt = this.db.prepare(`
      UPDATE scoring_rules 
      SET ${fields.join(', ')} 
      WHERE key = ?
    `);
    
    return stmt.run(...values);
  }

  /**
   * Delete a scoring rule (cascades to bands and enums)
   */
  deleteRule(key) {
    const stmt = this.db.prepare('DELETE FROM scoring_rules WHERE key = ?');
    return stmt.run(key);
  }

  // ===== BAND MANAGEMENT =====

  /**
   * Get all bands for a specific rule
   */
  getBandsForRule(ruleKey) {
    const stmt = this.db.prepare(`
      SELECT sb.* FROM scoring_bands sb
      JOIN scoring_rules sr ON sb.rule_id = sr.id
      WHERE sr.key = ?
      ORDER BY sb.min_value
    `);
    return stmt.all(ruleKey);
  }

  /**
   * Add a new band to a rule
   */
  addBand(ruleKey, minValue, maxValue, points) {
    const ruleId = this.getRuleByKey(ruleKey)?.id;
    if (!ruleId) {
      throw new Error(`Rule with key '${ruleKey}' not found`);
    }

    const stmt = this.db.prepare(`
      INSERT INTO scoring_bands (rule_id, min_value, max_value, points)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(ruleId, minValue, maxValue, points);
  }

  /**
   * Update a band
   */
  updateBand(bandId, minValue, maxValue, points) {
    const stmt = this.db.prepare(`
      UPDATE scoring_bands 
      SET min_value = ?, max_value = ?, points = ?
      WHERE id = ?
    `);
    return stmt.run(minValue, maxValue, points, bandId);
  }

  /**
   * Delete a band
   */
  deleteBand(bandId) {
    const stmt = this.db.prepare('DELETE FROM scoring_bands WHERE id = ?');
    return stmt.run(bandId);
  }

  /**
   * Replace all bands for a rule
   */
  replaceBandsForRule(ruleKey, bands) {
    const ruleId = this.getRuleByKey(ruleKey)?.id;
    if (!ruleId) {
      throw new Error(`Rule with key '${ruleKey}' not found`);
    }

    // Delete existing bands
    const deleteStmt = this.db.prepare('DELETE FROM scoring_bands WHERE rule_id = ?');
    deleteStmt.run(ruleId);

    // Insert new bands
    const insertStmt = this.db.prepare(`
      INSERT INTO scoring_bands (rule_id, min_value, max_value, points)
      VALUES (?, ?, ?, ?)
    `);

    for (const band of bands) {
      insertStmt.run(ruleId, band.min_value, band.max_value, band.points);
    }
  }

  // ===== ENUM MANAGEMENT =====

  /**
   * Get all enum options for a specific rule
   */
  getEnumsForRule(ruleKey) {
    const stmt = this.db.prepare(`
      SELECT se.* FROM scoring_enums se
      JOIN scoring_rules sr ON se.rule_id = sr.id
      WHERE sr.key = ?
      ORDER BY se.option
    `);
    return stmt.all(ruleKey);
  }

  /**
   * Add a new enum option to a rule
   */
  addEnum(ruleKey, option, points, isDealbreaker = false) {
    const ruleId = this.getRuleByKey(ruleKey)?.id;
    if (!ruleId) {
      throw new Error(`Rule with key '${ruleKey}' not found`);
    }

    const stmt = this.db.prepare(`
      INSERT INTO scoring_enums (rule_id, option, points, is_dealbreaker)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(ruleId, option, points, isDealbreaker);
  }

  /**
   * Update an enum option
   */
  updateEnum(enumId, points, isDealbreaker) {
    const stmt = this.db.prepare(`
      UPDATE scoring_enums 
      SET points = ?, is_dealbreaker = ?
      WHERE id = ?
    `);
    return stmt.run(points, isDealbreaker, enumId);
  }

  /**
   * Delete an enum option
   */
  deleteEnum(enumId) {
    const stmt = this.db.prepare('DELETE FROM scoring_enums WHERE id = ?');
    return stmt.run(enumId);
  }

  /**
   * Replace all enum options for a rule
   */
  replaceEnumsForRule(ruleKey, enums) {
    const ruleId = this.getRuleByKey(ruleKey)?.id;
    if (!ruleId) {
      throw new Error(`Rule with key '${ruleKey}' not found`);
    }

    // Delete existing enums
    const deleteStmt = this.db.prepare('DELETE FROM scoring_enums WHERE rule_id = ?');
    deleteStmt.run(ruleId);

    // Insert new enums
    const insertStmt = this.db.prepare(`
      INSERT INTO scoring_enums (rule_id, option, points, is_dealbreaker)
      VALUES (?, ?, ?, ?)
    `);

    for (const enumOption of enums) {
      insertStmt.run(ruleId, enumOption.option, enumOption.points, enumOption.is_dealbreaker);
    }
  }

  // ===== CONVENIENCE METHODS =====

  /**
   * Get complete rule configuration including bands and enums
   */
  getCompleteRuleConfig(ruleKey) {
    const rule = this.getRuleByKey(ruleKey);
    if (!rule) return null;

    const config = { ...rule };
    
    if (rule.type === 'banded') {
      config.bands = this.getBandsForRule(ruleKey);
    } else if (rule.type === 'enum') {
      config.enums = this.getEnumsForRule(ruleKey);
    }

    return config;
  }

  /**
   * Get all rules with their complete configuration
   */
  getAllCompleteRuleConfigs() {
    const rules = this.getAllRules();
    return rules.map(rule => this.getCompleteRuleConfig(rule.key));
  }

  /**
   * Reset a rule to its default configuration
   */
  resetRuleToDefaults(ruleKey) {
    const rule = this.getRuleByKey(ruleKey);
    if (!rule) {
      throw new Error(`Rule with key '${ruleKey}' not found`);
    }

    // Reset rule fields to defaults
    const defaultUpdates = {
      default_threshold: rule.default_threshold,
      default_points: rule.default_points,
      weight: 1.0,
      is_dealbreaker: rule.is_dealbreaker
    };
    this.updateRule(ruleKey, defaultUpdates);

    // Reset bands/enums based on rule type
    if (rule.type === 'banded') {
      this.resetBandsToDefaults(ruleKey);
    } else if (rule.type === 'enum') {
      this.resetEnumsToDefaults(ruleKey);
    }
  }

  /**
   * Reset bands to default values (implement based on your default data)
   */
  resetBandsToDefaults(ruleKey) {
    // This would need to be implemented based on your default band configurations
    // For now, we'll leave it as a placeholder
    console.log(`Resetting bands to defaults for rule: ${ruleKey}`);
  }

  /**
   * Reset enums to default values (implement based on your default data)
   */
  resetEnumsToDefaults(ruleKey) {
    // This would need to be implemented based on your default enum configurations
    // For now, we'll leave it as a placeholder
    console.log(`Resetting enums to defaults for rule: ${ruleKey}`);
  }

  // ===== LEGACY COMPATIBILITY METHODS =====
  // These methods maintain backward compatibility with the old API

  getScoringConfig() {
    const rules = this.getAllRules();
    const config = {};
    for (const rule of rules) {
      config[rule.key] = rule.value || rule.default_threshold || rule.default_points;
    }
    return config;
  }

  updateScoringConfig(key, value) {
    return this.updateRule(key, { default_threshold: value });
  }

  // Legacy methods for backward compatibility
  getTotalAreaBands() {
    return this.getBandsForRule('total_area_min_sqm');
  }

  getBudgetBands() {
    return this.getBandsForRule('budget_max_price');
  }

  getKitchenPoints() {
    return this.getEnumsForRule('kitchen_layout');
  }
}

export default ScoringConfigRepository;