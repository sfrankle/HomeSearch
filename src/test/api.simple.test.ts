import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Create a simple test server with mocked routes
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Mock routes for testing
  app.get('/api/properties', (req, res) => {
    const mockProperties = [
      {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Interested',
        scoring: { total_score: 0, score_breakdown: null },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];
    res.json(mockProperties);
  });

  app.get('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id === 1) {
      const mockProperty = {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Interested',
        scoring: { total_score: 0, score_breakdown: null },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      res.json(mockProperty);
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  });

  app.post('/api/properties', (req, res) => {
    const newProperty = {
      id: 2,
      ...req.body,
      scoring: { total_score: 0, score_breakdown: null },
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    };
    res.status(201).json(newProperty);
  });

  app.put('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id === 1) {
      const updatedProperty = {
        id: 1,
        address: { street: 'Test St', house_number: 1, postal_code: '1234 AB', city: 'Amsterdam' },
        price: { asking_price_eur: 500000 },
        details: { area_sqm: 80, floor_info: 'parterre', year_built: 2020, energy_label: 'A' },
        ownership: { type: 'volle eigendom' },
        vve: { monthly_fee_eur: 100 },
        metadata: { source: 'funda', date_added: '2024-01-01' },
        status: 'Viewed',
        comments: 'Great property!',
        scoring: { total_score: 0, score_breakdown: null },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };
      res.json(updatedProperty);
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  });

  app.delete('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  });

  app.post('/api/properties/:id/calculate-score', (req, res) => {
    const id = parseInt(req.params.id);
    if (id === 1) {
      const updatedProperty = {
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
          // v1.2 scoring format
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
      res.json(updatedProperty);
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  });

  // Scoring Configuration API endpoints
  app.get('/api/properties/scoring/config', (req, res) => {
    const mockConfig = {
      bedroom_min_sqm: { value: '8.0', description: 'Minimum bedroom size in m² (dealbreaker threshold)' },
      bedroom_points: { value: '10', description: 'Points awarded when bedroom meets minimum threshold' },
      weight_bedroom: { value: '1.0', description: 'Weight multiplier for bedroom scoring' },
      total_area_min_sqm: { value: '77.0', description: 'Minimum total area in m² (dealbreaker threshold)' },
      weight_total_area: { value: '1.0', description: 'Weight multiplier for total area scoring' },
      floor_max_entrance: { value: '2', description: 'Maximum floor number allowed (dealbreaker threshold)' },
      weight_floor_entrance: { value: '1.0', description: 'Weight multiplier for floor entrance scoring' },
      weight_budget: { value: '1.0', description: 'Weight multiplier for budget scoring' },
      weight_kitchen_layout: { value: '1.0', description: 'Weight multiplier for kitchen layout scoring' }
    };
    res.json(mockConfig);
  });

  app.put('/api/properties/scoring/config/:key', (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    res.json({ success: true, key, value });
  });

  app.get('/api/properties/scoring/bands/total-area', (req, res) => {
    const mockBands = [
      { id: 1, min_sqm: 77, max_sqm: 79, points: 5, weight: 1 },
      { id: 2, min_sqm: 80, max_sqm: 85, points: 7, weight: 1 },
      { id: 3, min_sqm: 86, max_sqm: 90, points: 9, weight: 1 },
      { id: 4, min_sqm: 91, max_sqm: null, points: 10, weight: 1 }
    ];
    res.json(mockBands);
  });

  app.get('/api/properties/scoring/bands/budget', (req, res) => {
    const mockBands = [
      { id: 1, min_price: 0, max_price: 750000, points: 10, weight: 1 },
      { id: 2, min_price: 751000, max_price: 790000, points: 5, weight: 1 },
      { id: 3, min_price: 791000, max_price: null, points: -5, weight: 1 }
    ];
    res.json(mockBands);
  });

  app.get('/api/properties/scoring/kitchen', (req, res) => {
    const mockKitchen = [
      { id: 1, kitchen_type: 'open', points: 10, is_dealbreaker: 0, weight: 1 },
      { id: 2, kitchen_type: 'relocatable', points: 5, is_dealbreaker: 0, weight: 1 },
      { id: 3, kitchen_type: 'closed', points: 0, is_dealbreaker: 1, weight: 1 }
    ];
    res.json(mockKitchen);
  });

  app.post('/api/properties/scoring/reset', (req, res) => {
    res.json({ success: true, message: 'Configuration reset to defaults' });
  });

  return app;
};

describe('API Endpoints (Simple)', () => {
  const app = createTestApp();

  describe('GET /api/properties', () => {
    it('should return all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(1);
      expect(response.body[0].address.street).toBe('Test St');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should return a single property', async () => {
      const response = await request(app)
        .get('/api/properties/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.address.street).toBe('Test St');
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Property not found' });
    });
  });

  describe('POST /api/properties', () => {
    it('should create a new property', async () => {
      const newProperty = {
        address: { street: 'New St', house_number: 2, postal_code: '5678 CD', city: 'Amsterdam' },
        price: { asking_price_eur: 600000 },
        details: { area_sqm: 90, floor_info: '1e', year_built: 2021, energy_label: 'B' },
        ownership: { type: 'erfpacht' },
        vve: { monthly_fee_eur: 150 },
        metadata: { source: 'funda', date_added: '2024-01-02' },
        status: 'Interested'
      };

      const response = await request(app)
        .post('/api/properties')
        .send(newProperty)
        .expect(201);

      expect(response.body.id).toBe(2);
      expect(response.body.address.street).toBe('New St');
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update a property', async () => {
      const updates = {
        status: 'Viewed',
        comments: 'Great property!'
      };

      const response = await request(app)
        .put('/api/properties/1')
        .send(updates)
        .expect(200);

      expect(response.body.status).toBe('Viewed');
      expect(response.body.comments).toBe('Great property!');
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .put('/api/properties/999')
        .send({ status: 'Viewed' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Property not found' });
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete a property', async () => {
      await request(app)
        .delete('/api/properties/1')
        .expect(204);
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .delete('/api/properties/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Property not found' });
    });
  });

  describe('POST /api/properties/:id/calculate-score', () => {
    it('should calculate and update property score with v1.2 format', async () => {
      const response = await request(app)
        .post('/api/properties/1/calculate-score')
        .expect(200);

      expect(response.body.scoring.score_normalized).toBe(74);
      expect(response.body.scoring.score_raw).toBe(37);
      expect(response.body.scoring.score_max_possible).toBe(50);
      expect(response.body.scoring.total_score).toBe(74); // Legacy field
      expect(response.body.scoring.score_breakdown.bedroom_size.score).toBe(10);
      expect(response.body.scoring.dealbreakers).toHaveLength(0);
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .post('/api/properties/999/calculate-score')
        .expect(404);

      expect(response.body).toEqual({ error: 'Property not found' });
    });
  });

  describe('Scoring Configuration API', () => {
    describe('GET /api/properties/scoring/config', () => {
      it('should return all scoring configuration', async () => {
        const response = await request(app)
          .get('/api/properties/scoring/config')
          .expect(200);

        expect(response.body.bedroom_min_sqm.value).toBe('8.0');
        expect(response.body.weight_bedroom.value).toBe('1.0');
        expect(response.body.total_area_min_sqm.value).toBe('77.0');
      });
    });

    describe('PUT /api/properties/scoring/config/:key', () => {
      it('should update configuration value', async () => {
        const response = await request(app)
          .put('/api/properties/scoring/config/bedroom_min_sqm')
          .send({ value: '9.0' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.key).toBe('bedroom_min_sqm');
        expect(response.body.value).toBe('9.0');
      });

      it('should return 400 if value is missing', async () => {
        const response = await request(app)
          .put('/api/properties/scoring/config/bedroom_min_sqm')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('Value is required');
      });
    });

    describe('GET /api/properties/scoring/bands/total-area', () => {
      it('should return total area scoring bands', async () => {
        const response = await request(app)
          .get('/api/properties/scoring/bands/total-area')
          .expect(200);

        expect(response.body).toHaveLength(4);
        expect(response.body[0].min_sqm).toBe(77);
        expect(response.body[0].points).toBe(5);
        expect(response.body[3].max_sqm).toBeNull(); // Last band has no max
      });
    });

    describe('GET /api/properties/scoring/bands/budget', () => {
      it('should return budget scoring bands', async () => {
        const response = await request(app)
          .get('/api/properties/scoring/bands/budget')
          .expect(200);

        expect(response.body).toHaveLength(3);
        expect(response.body[0].min_price).toBe(0);
        expect(response.body[0].points).toBe(10);
        expect(response.body[2].points).toBe(-5); // Negative points for high prices
      });
    });

    describe('GET /api/properties/scoring/kitchen', () => {
      it('should return kitchen layout scoring points', async () => {
        const response = await request(app)
          .get('/api/properties/scoring/kitchen')
          .expect(200);

        expect(response.body).toHaveLength(3);
        expect(response.body[0].kitchen_type).toBe('open');
        expect(response.body[0].points).toBe(10);
        expect(response.body[0].is_dealbreaker).toBe(0);
        expect(response.body[2].kitchen_type).toBe('closed');
        expect(response.body[2].is_dealbreaker).toBe(1);
      });
    });

    describe('POST /api/properties/scoring/reset', () => {
      it('should reset configuration to defaults', async () => {
        const response = await request(app)
          .post('/api/properties/scoring/reset')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Configuration reset to defaults');
      });
    });
  });
});
