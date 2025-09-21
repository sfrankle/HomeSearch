import { calculatePropertyScore } from '../services/scoringService.js';

/**
 * Handles property data transformation between database and API formats
 * Single Responsibility: Data transformation logic
 */
class PropertyTransformer {
  /**
   * Transform database row to API property format
   * @param {Object} dbProperty - Raw database row
   * @returns {Promise<Object>} Transformed property object
   */
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
        source: dbProperty.metadata_source,
        date_added: dbProperty.metadata_date_added,
      },
      roomDimensions: {
        mainBedroom: {
          longEdge: dbProperty.main_bedroom_long_edge,
          shortEdge: dbProperty.main_bedroom_short_edge,
        },
        guestRoom: {
          longEdge: dbProperty.guest_room_long_edge,
          shortEdge: dbProperty.guest_room_short_edge,
        },
      },
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
      },
      status: dbProperty.status,
      comments: dbProperty.comments,
      created_at: dbProperty.created_at,
      updated_at: dbProperty.updated_at,
    };

    // Calculate dynamic scores using current configuration
    try {
      const scoreResult = await calculatePropertyScore(property);
      property.scoring.score_raw = scoreResult.score_raw;
      property.scoring.score_max_possible = scoreResult.score_max_possible;
      property.scoring.score_normalized = scoreResult.score_normalized;
      property.scoring.score_breakdown = scoreResult.score_breakdown;
      property.scoring.dealbreakers = scoreResult.dealbreakers;
      
      // Maintain backward compatibility - set both locations
      property.scoring.total_score = scoreResult.score_normalized;
      property.total_score = scoreResult.score_normalized;
    } catch (error) {
      console.error('Error calculating property score:', error);
      property.scoring.score_raw = 0;
      property.scoring.score_max_possible = 0;
      property.scoring.score_normalized = 0;
      property.scoring.score_breakdown = {};
      property.scoring.dealbreakers = [];
      property.scoring.total_score = 0;
      property.total_score = 0;
    }

    return property;
  }

  /**
   * Transform API property format to database row format
   * @param {Object} property - API property object
   * @returns {Object} Database row object
   */
  transformToDbFormat(property) {
    return {
      link: property.link,
      address_street: property.address?.street,
      address_house_number: property.address?.house_number,
      address_postal_code: property.address?.postal_code,
      address_city: property.address?.city,
      price_asking_price_eur: property.price?.asking_price_eur,
      details_area_sqm: property.details?.area_sqm,
      details_floor_info: property.details?.floor_info,
      details_year_built: property.details?.year_built,
      details_energy_label: property.details?.energy_label,
      ownership_type: property.ownership?.type,
      ownership_lease_details: property.ownership?.lease_details,
      ownership_perceel: property.ownership?.perceel,
      vve_monthly_fee_eur: property.vve?.monthly_fee_eur,
      metadata_source: property.metadata?.source,
      metadata_date_added: property.metadata?.date_added,
      main_bedroom_long_edge: property.roomDimensions?.mainBedroom?.longEdge,
      main_bedroom_short_edge: property.roomDimensions?.mainBedroom?.shortEdge,
      guest_room_long_edge: property.roomDimensions?.guestRoom?.longEdge,
      guest_room_short_edge: property.roomDimensions?.guestRoom?.shortEdge,
      main_bedroom_sqm: property.scoring?.main_bedroom_sqm,
      kitchen_type: property.scoring?.kitchen_type,
      foundation_status: property.scoring?.foundation_status,
      street_noise: property.scoring?.street_noise,
      smelly_business_below: property.scoring?.smelly_business_below,
      commute_time_central_min: property.scoring?.commute_time_central_min,
      commute_time_mark_min: property.scoring?.commute_time_mark_min,
      commute_time_sarah_min: property.scoring?.commute_time_sarah_min,
      workspace_count: property.scoring?.workspace_count,
      viewing_status: property.scoring?.viewing_status,
      status: property.status,
      comments: property.comments,
    };
  }
}

export default PropertyTransformer;
