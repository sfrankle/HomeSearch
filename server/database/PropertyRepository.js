import PropertyTransformer from './PropertyTransformer.js';

/**
 * Handles property CRUD operations
 * Single Responsibility: Property data access
 */
class PropertyRepository {
  constructor(db) {
    this.db = db;
    this.transformer = new PropertyTransformer();
  }

  async getPropertyById(id) {
    const stmt = this.db.prepare('SELECT * FROM properties WHERE id = ?');
    const result = stmt.get(id);
    return result ? await this.transformer.transformProperty(result) : null;
  }

  async getAllProperties() {
    const stmt = this.db.prepare(`
      SELECT * FROM properties 
      ORDER BY created_at DESC
    `);
    const results = stmt.all();
    return Promise.all(results.map(result => this.transformer.transformProperty(result)));
  }

  async createProperty(property) {
    const dbProperty = this.transformer.transformToDbFormat(property);
    
    const stmt = this.db.prepare(`
      INSERT INTO properties (
        link, address_street, address_house_number, address_postal_code, address_city,
        price_asking_price_eur, details_area_sqm, details_floor_info, details_year_built, details_energy_label,
        ownership_type, ownership_lease_details, ownership_perceel, vve_monthly_fee_eur,
        metadata_source, metadata_date_added, main_bedroom_long_edge, main_bedroom_short_edge,
        guest_room_long_edge, guest_room_short_edge, main_bedroom_sqm, kitchen_type,
        foundation_status, street_noise, smelly_business_below, commute_time_central_min,
        commute_time_mark_min, commute_time_sarah_min, workspace_count, viewing_status,
        status, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      dbProperty.link, dbProperty.address_street, dbProperty.address_house_number,
      dbProperty.address_postal_code, dbProperty.address_city, dbProperty.price_asking_price_eur,
      dbProperty.details_area_sqm, dbProperty.details_floor_info, dbProperty.details_year_built,
      dbProperty.details_energy_label, dbProperty.ownership_type, dbProperty.ownership_lease_details,
      dbProperty.ownership_perceel, dbProperty.vve_monthly_fee_eur, dbProperty.metadata_source,
      dbProperty.metadata_date_added, dbProperty.main_bedroom_long_edge, dbProperty.main_bedroom_short_edge,
      dbProperty.guest_room_long_edge, dbProperty.guest_room_short_edge, dbProperty.main_bedroom_sqm,
      dbProperty.kitchen_type, dbProperty.foundation_status, dbProperty.street_noise,
      dbProperty.smelly_business_below, dbProperty.commute_time_central_min, dbProperty.commute_time_mark_min,
      dbProperty.commute_time_sarah_min, dbProperty.workspace_count, dbProperty.viewing_status,
      dbProperty.status, dbProperty.comments
    );

    return await this.getPropertyById(result.lastInsertRowid);
  }

  async updateProperty(id, updates) {
    const updateFields = [];
    const updateValues = [];

    // Handle nested object updates
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && value !== undefined) {
        if (key === 'roomDimensions') {
          const roomDims = value;
          if (roomDims.mainBedroom) {
            updateFields.push('main_bedroom_long_edge = ?', 'main_bedroom_short_edge = ?');
            updateValues.push(roomDims.mainBedroom.longEdge, roomDims.mainBedroom.shortEdge);
          }
          if (roomDims.guestRoom) {
            updateFields.push('guest_room_long_edge = ?', 'guest_room_short_edge = ?');
            updateValues.push(roomDims.guestRoom.longEdge, roomDims.guestRoom.shortEdge);
          }
        } else if (key === 'address') {
          const address = value;
          if (address.street !== undefined) updateFields.push('address_street = ?');
          if (address.house_number !== undefined) updateFields.push('address_house_number = ?');
          if (address.postal_code !== undefined) updateFields.push('address_postal_code = ?');
          if (address.city !== undefined) updateFields.push('address_city = ?');
          if (address.street !== undefined) updateValues.push(address.street);
          if (address.house_number !== undefined) updateValues.push(address.house_number);
          if (address.postal_code !== undefined) updateValues.push(address.postal_code);
          if (address.city !== undefined) updateValues.push(address.city);
        } else if (key === 'price') {
          const price = value;
          if (price.asking_price_eur !== undefined) {
            updateFields.push('price_asking_price_eur = ?');
            updateValues.push(price.asking_price_eur);
          }
        } else if (key === 'details') {
          const details = value;
          if (details.area_sqm !== undefined) updateFields.push('details_area_sqm = ?');
          if (details.floor_info !== undefined) updateFields.push('details_floor_info = ?');
          if (details.year_built !== undefined) updateFields.push('details_year_built = ?');
          if (details.energy_label !== undefined) updateFields.push('details_energy_label = ?');
          if (details.area_sqm !== undefined) updateValues.push(details.area_sqm);
          if (details.floor_info !== undefined) updateValues.push(details.floor_info);
          if (details.year_built !== undefined) updateValues.push(details.year_built);
          if (details.energy_label !== undefined) updateValues.push(details.energy_label);
        } else if (key === 'ownership') {
          const ownership = value;
          if (ownership.type !== undefined) updateFields.push('ownership_type = ?');
          if (ownership.lease_details !== undefined) updateFields.push('ownership_lease_details = ?');
          if (ownership.perceel !== undefined) updateFields.push('ownership_perceel = ?');
          if (ownership.type !== undefined) updateValues.push(ownership.type);
          if (ownership.lease_details !== undefined) updateValues.push(ownership.lease_details);
          if (ownership.perceel !== undefined) updateValues.push(ownership.perceel);
        } else if (key === 'vve') {
          const vve = value;
          if (vve.monthly_fee_eur !== undefined) {
            updateFields.push('vve_monthly_fee_eur = ?');
            updateValues.push(vve.monthly_fee_eur);
          }
        } else if (key === 'metadata') {
          const metadata = value;
          if (metadata.source !== undefined) updateFields.push('metadata_source = ?');
          if (metadata.date_added !== undefined) updateFields.push('metadata_date_added = ?');
          if (metadata.source !== undefined) updateValues.push(metadata.source);
          if (metadata.date_added !== undefined) updateValues.push(metadata.date_added);
        } else if (key === 'scoring') {
          const scoring = value;
          if (scoring.main_bedroom_sqm !== undefined) updateFields.push('main_bedroom_sqm = ?');
          if (scoring.kitchen_type !== undefined) updateFields.push('kitchen_type = ?');
          if (scoring.foundation_status !== undefined) updateFields.push('foundation_status = ?');
          if (scoring.street_noise !== undefined) updateFields.push('street_noise = ?');
          if (scoring.smelly_business_below !== undefined) updateFields.push('smelly_business_below = ?');
          if (scoring.commute_time_central_min !== undefined) updateFields.push('commute_time_central_min = ?');
          if (scoring.commute_time_mark_min !== undefined) updateFields.push('commute_time_mark_min = ?');
          if (scoring.commute_time_sarah_min !== undefined) updateFields.push('commute_time_sarah_min = ?');
          if (scoring.workspace_count !== undefined) updateFields.push('workspace_count = ?');
          if (scoring.viewing_status !== undefined) updateFields.push('viewing_status = ?');
          if (scoring.main_bedroom_sqm !== undefined) updateValues.push(scoring.main_bedroom_sqm);
          if (scoring.kitchen_type !== undefined) updateValues.push(scoring.kitchen_type);
          if (scoring.foundation_status !== undefined) updateValues.push(scoring.foundation_status);
          if (scoring.street_noise !== undefined) updateValues.push(scoring.street_noise);
          if (scoring.smelly_business_below !== undefined) updateValues.push(scoring.smelly_business_below);
          if (scoring.commute_time_central_min !== undefined) updateValues.push(scoring.commute_time_central_min);
          if (scoring.commute_time_mark_min !== undefined) updateValues.push(scoring.commute_time_mark_min);
          if (scoring.commute_time_sarah_min !== undefined) updateValues.push(scoring.commute_time_sarah_min);
          if (scoring.workspace_count !== undefined) updateValues.push(scoring.workspace_count);
          if (scoring.viewing_status !== undefined) updateValues.push(scoring.viewing_status);
        } else {
          // Handle flat fields
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      return await this.getPropertyById(id);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const stmt = this.db.prepare(`
      UPDATE properties 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...updateValues);
    return await this.getPropertyById(id);
  }

  deleteProperty(id) {
    const stmt = this.db.prepare('DELETE FROM properties WHERE id = ?');
    return stmt.run(id);
  }
}

export default PropertyRepository;
