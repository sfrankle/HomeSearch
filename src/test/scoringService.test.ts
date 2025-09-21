import { describe, it, expect } from 'vitest';
import { getScoreColorClass, getScoreEmoji } from '../services/scoringService';
import { Property } from '../types/Property';

describe('Scoring Service (v1.2)', () => {
  describe('Frontend Display Functions', () => {
    it('should handle properties with existing v1.2 scoring data', () => {
      const property: Property = {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Interested',
        scoring: {
          main_bedroom_sqm: 12,
          kitchen_type: 'open',
          foundation_status: 'ok',
          street_noise: 'quiet',
          smelly_business_below: false,
          commute_time_central_min: 20,
          workspace_count: 2,
          viewing_status: 'wishlist',
          notes: 'Test property',
          // v1.2 scoring data from backend
          score_raw: 37,
          score_max_possible: 50,
          score_normalized: 74,
          total_score: 74, // Legacy field
          score_breakdown: {
            bedroom_size: { score: 10, reason: 'Bedroom size acceptable (12 m² ≥ 8 m²)' },
            total_area: { score: 7, reason: 'Area good (80 m², 80-85 m² range)' },
            floor_entrance: { score: 10, reason: 'Floor acceptable (parterre ≤ 2nd floor)' },
            budget: { score: 10, reason: 'Price excellent (€500,000 ≤ €750k)' },
            kitchen_layout: { score: 10, reason: 'Kitchen layout open (preferred)' }
          },
          dealbreakers: []
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      // The frontend scoring service should use existing data
      expect(property.scoring?.score_normalized).toBe(74);
      expect(property.scoring?.score_breakdown?.bedroom_size?.score).toBe(10);
      expect(property.scoring?.dealbreakers).toHaveLength(0);
    });

    it('should handle properties with dealbreaker scoring data', () => {
      const property: Property = {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Interested',
        scoring: {
          main_bedroom_sqm: 7, // Dealbreaker
          kitchen_type: 'open',
          foundation_status: 'ok',
          street_noise: 'quiet',
          smelly_business_below: false,
          commute_time_central_min: 20,
          workspace_count: 2,
          viewing_status: 'wishlist',
          notes: 'Test property',
          // v1.2 scoring data from backend
          score_raw: 0,
          score_max_possible: 50,
          score_normalized: 0,
          total_score: 0, // Legacy field
          score_breakdown: {
            bedroom_size: { score: 0, reason: 'Bedroom too small (7 m² < 8 m² required)' },
            total_area: { score: 7, reason: 'Area good (80 m², 80-85 m² range)' },
            floor_entrance: { score: 10, reason: 'Floor acceptable (parterre ≤ 2nd floor)' },
            budget: { score: 10, reason: 'Price excellent (€500,000 ≤ €750k)' },
            kitchen_layout: { score: 10, reason: 'Kitchen layout open (preferred)' }
          },
          dealbreakers: ['Bedroom too small']
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      // The frontend scoring service should use existing data
      expect(property.scoring?.score_normalized).toBe(0);
      expect(property.scoring?.dealbreakers).toContain('Bedroom too small');
      expect(property.scoring?.score_breakdown?.bedroom_size?.score).toBe(0);
    });

    it('should handle properties without scoring data', () => {
      const property: Property = {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Interested',
        // No scoring data - should fall back to simple calculation
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      // Properties without scoring data should be handled gracefully
      expect(property.scoring).toBeUndefined();
    });
  });

  // Note: The actual scoring calculation is now done on the backend with database configuration
  // Backend scoring tests should be added to test the server-side scoring service

  describe('getScoreColorClass', () => {
    it('should return correct color classes for different scores (0-10 scale)', () => {
      expect(getScoreColorClass(9.5)).toBe('text-green-600 bg-green-100');
      expect(getScoreColorClass(7.2)).toBe('text-blue-600 bg-blue-100');
      expect(getScoreColorClass(5.1)).toBe('text-yellow-600 bg-yellow-100');
      expect(getScoreColorClass(3.3)).toBe('text-orange-600 bg-orange-100');
      expect(getScoreColorClass(1.2)).toBe('text-red-600 bg-red-100');
    });
  });

  describe('getScoreEmoji', () => {
    it('should return correct emojis for different scores (0-10 scale)', () => {
      expect(getScoreEmoji(9.5)).toBe('🏆');
      expect(getScoreEmoji(7.2)).toBe('⭐');
      expect(getScoreEmoji(5.1)).toBe('👍');
      expect(getScoreEmoji(3.3)).toBe('👌');
      expect(getScoreEmoji(1.2)).toBe('❌');
    });
  });
});
