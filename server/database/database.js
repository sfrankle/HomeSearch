import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DatabaseMigrations from './migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
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



  async getPropertyById(id) {
    const stmt = this.db.prepare('SELECT * FROM properties WHERE id = ?');
    const result = stmt.get(id);
    return result ? await this.transformProperty(result) : null;
  }

  async getAllProperties() {
    const stmt = this.db.prepare(`
      SELECT * FROM properties 
      ORDER BY created_at DESC
    `);
    const results = stmt.all();
    return Promise.all(results.map(result => this.transformProperty(result)));
  }

  async transformProperty(dbProperty) {
    const property = {
      id: dbProperty.id,
      link: dbProperty.link,
      address: {
        street: dbProperty.address_street,
        house_number: dbProperty.address_house_number,
        postal_code: dbProperty.address_postal_code,
        city: dbProperty.address_city,
      },
      price: {
        asking_price_eur: dbProperty.price_asking_price_eur,
      },
      details: {
        area_sqm: dbProperty.details_area_sqm,
        floor_info: dbProperty.details_floor_info,
        year_built: dbProperty.details_year_built,
        energy_label: dbProperty.details_energy_label,
      },
      ownership: {
        type: dbProperty.ownership_type,
        lease_details: dbProperty.ownership_lease_details,
        perceel: dbProperty.ownership_perceel,
      },
      vve: {
        monthly_fee_eur: dbProperty.vve_monthly_fee_eur,
      },
      metadata: {
        source: dbProperty.metadata_source || 'funda',
        date_added: dbProperty.metadata_date_added || dbProperty.created_at,
      },
      roomDimensions: (dbProperty.main_bedroom_long_edge || dbProperty.guest_room_long_edge) ? {
        mainBedroom: dbProperty.main_bedroom_long_edge ? {
          longEdge: dbProperty.main_bedroom_long_edge,
          shortEdge: dbProperty.main_bedroom_short_edge,
        } : undefined,
        guestRoom: dbProperty.guest_room_long_edge ? {
          longEdge: dbProperty.guest_room_long_edge,
          shortEdge: dbProperty.guest_room_short_edge,
        } : undefined,
      } : undefined,
      status: dbProperty.status,
      comments: dbProperty.comments,
      // Scoring fields (input data only, no calculated scores)
      scoring: {
        main_bedroom_sqm: dbProperty.main_bedroom_sqm,
        kitchen_type: dbProperty.kitchen_type,
        foundation_status: dbProperty.foundation_status,
        street_noise: dbProperty.street_noise,
        smelly_business_below: dbProperty.smelly_business_below,
        commute_time_central_min: dbProperty.commute_time_central_min,
        commute_time_mark_min: dbProperty.commute_time_mark_min,
        commute_time_sarah_min: dbProperty.commute_time_sarah_min,
        workspace_count: dbProperty.workspace_count,
        viewing_status: dbProperty.viewing_status,
        notes: dbProperty.notes,
      },
      createdAt: dbProperty.created_at,
      updatedAt: dbProperty.updated_at,
    };

    // Dynamically calculate scores using current configuration
    try {
      const { calculatePropertyScore } = await import('../services/scoringService.js');
      const scoringResult = calculatePropertyScore(property, this);
      
      // Add calculated scores to the property
      property.scoring = {
        ...property.scoring,
        score_raw: scoringResult.score_raw,
        score_max_possible: scoringResult.score_max_possible,
        score_normalized: scoringResult.score_normalized,
        score_breakdown: scoringResult.score_breakdown,
        dealbreakers: scoringResult.dealbreakers,
        // Legacy field for backward compatibility
        total_score: scoringResult.score_normalized,
      };
    } catch (error) {
      console.error('Error calculating dynamic score for property', dbProperty.id, ':', error);
      // Fallback to stored scores if calculation fails
      property.scoring = {
        ...property.scoring,
        total_score: dbProperty.total_score || 0,
        score_breakdown: dbProperty.score_breakdown ? JSON.parse(dbProperty.score_breakdown) : null,
      };
    }

    return property;
  }

  async createProperty(property) {
    const stmt = this.db.prepare(`
      INSERT INTO properties (
        link, address_street, address_house_number, address_postal_code, address_city,
        price_asking_price_eur, details_area_sqm, details_floor_info, details_year_built, details_energy_label,
        ownership_type, ownership_lease_details, ownership_perceel, vve_monthly_fee_eur,
        metadata_source, metadata_date_added, main_bedroom_long_edge, main_bedroom_short_edge,
        guest_room_long_edge, guest_room_short_edge, status, comments,
        main_bedroom_sqm, kitchen_type, foundation_status, street_noise, smelly_business_below,
        commute_time_central_min, commute_time_mark_min, commute_time_sarah_min, workspace_count, viewing_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      property.link || null,
      property.address.street,
      property.address.house_number,
      property.address.postal_code,
      property.address.city,
      property.price.asking_price_eur,
      property.details?.area_sqm || null,
      property.details?.floor_info || null,
      property.details?.year_built || null,
      property.details?.energy_label || null,
      property.ownership?.type || null,
      property.ownership?.lease_details || null,
      property.ownership?.perceel || null,
      property.vve?.monthly_fee_eur || null,
      property.metadata?.source || 'funda',
      property.metadata?.date_added || new Date().toISOString().split('T')[0],
      property.roomDimensions?.mainBedroom?.longEdge || null,
      property.roomDimensions?.mainBedroom?.shortEdge || null,
      property.roomDimensions?.guestRoom?.longEdge || null,
      property.roomDimensions?.guestRoom?.shortEdge || null,
      property.status || 'Interested',
      property.comments || null,
      // Scoring input fields only (no calculated scores)
      property.scoring?.main_bedroom_sqm || null,
      property.scoring?.kitchen_type || null,
      property.scoring?.foundation_status || null,
      property.scoring?.street_noise || null,
      property.scoring?.smelly_business_below || null,
      property.scoring?.commute_time_central_min || null,
      property.scoring?.commute_time_mark_min || null,
      property.scoring?.commute_time_sarah_min || null,
      property.scoring?.workspace_count || null,
      property.scoring?.viewing_status || null,
      property.scoring?.notes || null
    );
    
    return await this.getPropertyById(result.lastInsertRowid);
  }

  async updateProperty(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        if (key === 'roomDimensions') {
          // Handle room dimensions specially
          const roomDims = updates[key];
          if (roomDims.mainBedroom) {
            fields.push('main_bedroom_long_edge = ?', 'main_bedroom_short_edge = ?');
            values.push(
              roomDims.mainBedroom.longEdge || null,
              roomDims.mainBedroom.shortEdge || null
            );
          }
          if (roomDims.guestRoom) {
            fields.push('guest_room_long_edge = ?', 'guest_room_short_edge = ?');
            values.push(
              roomDims.guestRoom.longEdge || null,
              roomDims.guestRoom.shortEdge || null
            );
          }
        } else if (key === 'address') {
          // Handle address specially
          const address = updates[key];
          if (address) {
            fields.push(
              'address_street = ?',
              'address_house_number = ?',
              'address_postal_code = ?',
              'address_city = ?'
            );
            values.push(
              address.street || null,
              address.house_number || null,
              address.postal_code || null,
              address.city || null
            );
          }
        } else if (key === 'price') {
          // Handle price specially
          const price = updates[key];
          if (price) {
            fields.push('price_asking_price_eur = ?');
            values.push(price.asking_price_eur || null);
          }
        } else if (key === 'details') {
          // Handle details specially
          const details = updates[key];
          if (details) {
            fields.push(
              'details_area_sqm = ?',
              'details_floor_info = ?',
              'details_year_built = ?',
              'details_energy_label = ?'
            );
            values.push(
              details.area_sqm || null,
              details.floor_info || null,
              details.year_built || null,
              details.energy_label || null
            );
          }
        } else if (key === 'ownership') {
          // Handle ownership specially
          const ownership = updates[key];
          if (ownership) {
            fields.push(
              'ownership_type = ?',
              'ownership_lease_details = ?',
              'ownership_perceel = ?'
            );
            values.push(
              ownership.type || null,
              ownership.lease_details || null,
              ownership.perceel || null
            );
          }
        } else if (key === 'vve') {
          // Handle vve specially
          const vve = updates[key];
          if (vve) {
            fields.push('vve_monthly_fee_eur = ?');
            values.push(vve.monthly_fee_eur || null);
          }
        } else if (key === 'metadata') {
          // Handle metadata specially
          const metadata = updates[key];
          if (metadata) {
            fields.push(
              'metadata_source = ?',
              'metadata_date_added = ?'
            );
            values.push(
              metadata.source || null,
              metadata.date_added || null
            );
          }
        } else if (key === 'scoring') {
          // Handle scoring input fields only (no calculated scores)
          const scoring = updates[key];
          if (scoring) {
            fields.push(
              'main_bedroom_sqm = ?',
              'kitchen_type = ?',
              'foundation_status = ?',
              'street_noise = ?',
              'smelly_business_below = ?',
              'commute_time_central_min = ?',
              'commute_time_mark_min = ?',
              'commute_time_sarah_min = ?',
              'workspace_count = ?',
              'viewing_status = ?',
              'notes = ?'
            );
            values.push(
              scoring.main_bedroom_sqm || null,
              scoring.kitchen_type || null,
              scoring.foundation_status || null,
              scoring.street_noise || null,
              scoring.smelly_business_below || null,
              scoring.commute_time_central_min || null,
              scoring.commute_time_mark_min || null,
              scoring.commute_time_sarah_min || null,
              scoring.workspace_count || null,
              scoring.viewing_status || null,
              scoring.notes || null
            );
          }
        } else {
          // Handle regular fields
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbKey} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (fields.length === 0) return await this.getPropertyById(id);
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE properties 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return await this.getPropertyById(id);
  }

  deleteProperty(id) {
    const stmt = this.db.prepare('DELETE FROM properties WHERE id = ?');
    return stmt.run(id);
  }

  // Scoring Configuration Methods (using new generic repository)
  getScoringConfig() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getScoringConfig();
  }

  updateScoringConfig(key, value) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.updateScoringConfig(key, value);
  }

  // Generic rule management methods
  getAllScoringRules() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getAllRules();
  }

  getScoringRule(key) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getRuleByKey(key);
  }

  createScoringRule(rule) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.createRule(rule);
  }

  updateScoringRule(key, updates) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.updateRule(key, updates);
  }

  deleteScoringRule(key) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.deleteRule(key);
  }

  // Band management methods
  getBandsForRule(ruleKey) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getBandsForRule(ruleKey);
  }

  addBandToRule(ruleKey, minValue, maxValue, points) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.addBand(ruleKey, minValue, maxValue, points);
  }

  updateBand(bandId, minValue, maxValue, points) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.updateBand(bandId, minValue, maxValue, points);
  }

  deleteBand(bandId) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.deleteBand(bandId);
  }

  replaceBandsForRule(ruleKey, bands) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.replaceBandsForRule(ruleKey, bands);
  }

  // Enum management methods
  getEnumsForRule(ruleKey) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getEnumsForRule(ruleKey);
  }

  addEnumToRule(ruleKey, option, points, isDealbreaker = false) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.addEnum(ruleKey, option, points, isDealbreaker);
  }

  updateEnum(enumId, points, isDealbreaker) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.updateEnum(enumId, points, isDealbreaker);
  }

  deleteEnum(enumId) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.deleteEnum(enumId);
  }

  replaceEnumsForRule(ruleKey, enums) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.replaceEnumsForRule(ruleKey, enums);
  }

  // Convenience methods
  getCompleteRuleConfig(ruleKey) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getCompleteRuleConfig(ruleKey);
  }

  getAllCompleteRuleConfigs() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getAllCompleteRuleConfigs();
  }

  resetRuleToDefaults(ruleKey) {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.resetRuleToDefaults(ruleKey);
  }

  // Legacy compatibility methods (for backward compatibility)
  getTotalAreaBands() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getTotalAreaBands();
  }

  getBudgetBands() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getBudgetBands();
  }

  getKitchenPoints() {
    const ScoringConfigRepository = require('./ScoringConfigRepository.js').default;
    const scoringRepo = new ScoringConfigRepository(this.db);
    return scoringRepo.getKitchenPoints();
  }

  close() {
    this.db.close();
  }
}

export default DatabaseManager;
