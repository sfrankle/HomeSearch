import express from 'express';
import DatabaseManager from '../database/DatabaseManager.js';

const router = express.Router();
const db = new DatabaseManager();

// GET /api/properties - Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await db.getAllProperties();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await db.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    const property = await db.createProperty(req.body);
    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await db.updateProperty(id, req.body);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = db.deleteProperty(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// POST /api/properties/import - Import from JSON
router.post('/import', (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!Array.isArray(properties)) {
      return res.status(400).json({ error: 'Properties must be an array' });
    }
    
    const createdProperties = properties.map(property => db.createProperty(property));
    res.status(201).json(createdProperties);
  } catch (error) {
    console.error('Error importing properties:', error);
    res.status(500).json({ error: 'Failed to import properties' });
  }
});

// GET /api/properties/export - Export all data
router.get('/export', (req, res) => {
  try {
    const properties = db.getAllProperties();
    res.json({ properties, exportedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error exporting properties:', error);
    res.status(500).json({ error: 'Failed to export properties' });
  }
});

// POST /api/properties/:id/calculate-score - Calculate property score (now returns dynamic calculation)
router.post('/:id/calculate-score', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await db.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Scores are now calculated dynamically in transformProperty
    // This endpoint now just returns the property with current scores
    res.json(property);
  } catch (error) {
    console.error('Error getting property with dynamic scores:', error);
    res.status(500).json({ error: 'Failed to get property scores' });
  }
});

// Scoring Configuration API endpoints

// GET /api/scoring/config - Get all scoring configuration
router.get('/scoring/config', (req, res) => {
  try {
    const config = db.getScoringConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching scoring config:', error);
    res.status(500).json({ error: 'Failed to fetch scoring configuration' });
  }
});

// PUT /api/scoring/config/:key - Update scoring configuration value
router.put('/scoring/config/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const result = db.updateScoringConfig(key, value);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Configuration key not found' });
    }
    
    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Error updating scoring config:', error);
    res.status(500).json({ error: 'Failed to update scoring configuration' });
  }
});

// GET /api/scoring/bands/total-area - Get total area scoring bands
router.get('/scoring/bands/total-area', (req, res) => {
  try {
    const bands = db.getTotalAreaBands();
    res.json(bands);
  } catch (error) {
    console.error('Error fetching total area bands:', error);
    res.status(500).json({ error: 'Failed to fetch total area bands' });
  }
});

// POST /api/scoring/bands/total-area - Add new total area band
router.post('/scoring/bands/total-area', (req, res) => {
  try {
    const { min_sqm, max_sqm, points, weight } = req.body;
    
    if (min_sqm === undefined || points === undefined) {
      return res.status(400).json({ error: 'min_sqm and points are required' });
    }
    
    const result = db.addTotalAreaBand(min_sqm, max_sqm, points, weight);
    res.status(201).json({ id: result.lastInsertRowid, min_sqm, max_sqm, points, weight });
  } catch (error) {
    console.error('Error adding total area band:', error);
    res.status(500).json({ error: 'Failed to add total area band' });
  }
});

// PUT /api/scoring/bands/total-area/:id - Update total area band
router.put('/scoring/bands/total-area/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { min_sqm, max_sqm, points, weight } = req.body;
    
    const result = db.updateTotalAreaBand(id, min_sqm, max_sqm, points, weight);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Total area band not found' });
    }
    
    res.json({ success: true, id, min_sqm, max_sqm, points, weight });
  } catch (error) {
    console.error('Error updating total area band:', error);
    res.status(500).json({ error: 'Failed to update total area band' });
  }
});

// DELETE /api/scoring/bands/total-area/:id - Delete total area band
router.delete('/scoring/bands/total-area/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = db.deleteTotalAreaBand(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Total area band not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting total area band:', error);
    res.status(500).json({ error: 'Failed to delete total area band' });
  }
});

// GET /api/scoring/bands/budget - Get budget scoring bands
router.get('/scoring/bands/budget', (req, res) => {
  try {
    const bands = db.getBudgetBands();
    res.json(bands);
  } catch (error) {
    console.error('Error fetching budget bands:', error);
    res.status(500).json({ error: 'Failed to fetch budget bands' });
  }
});

// POST /api/scoring/bands/budget - Add new budget band
router.post('/scoring/bands/budget', (req, res) => {
  try {
    const { min_price, max_price, points, weight } = req.body;
    
    if (min_price === undefined || points === undefined) {
      return res.status(400).json({ error: 'min_price and points are required' });
    }
    
    const result = db.addBudgetBand(min_price, max_price, points, weight);
    res.status(201).json({ id: result.lastInsertRowid, min_price, max_price, points, weight });
  } catch (error) {
    console.error('Error adding budget band:', error);
    res.status(500).json({ error: 'Failed to add budget band' });
  }
});

// PUT /api/scoring/bands/budget/:id - Update budget band
router.put('/scoring/bands/budget/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { min_price, max_price, points, weight } = req.body;
    
    const result = db.updateBudgetBand(id, min_price, max_price, points, weight);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget band not found' });
    }
    
    res.json({ success: true, id, min_price, max_price, points, weight });
  } catch (error) {
    console.error('Error updating budget band:', error);
    res.status(500).json({ error: 'Failed to update budget band' });
  }
});

// DELETE /api/scoring/bands/budget/:id - Delete budget band
router.delete('/scoring/bands/budget/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = db.deleteBudgetBand(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget band not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting budget band:', error);
    res.status(500).json({ error: 'Failed to delete budget band' });
  }
});

// GET /api/scoring/kitchen - Get kitchen layout scoring points
router.get('/scoring/kitchen', (req, res) => {
  try {
    const kitchenPoints = db.getKitchenPoints();
    res.json(kitchenPoints);
  } catch (error) {
    console.error('Error fetching kitchen points:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen points' });
  }
});

// PUT /api/scoring/kitchen/:id - Update kitchen layout points
router.put('/scoring/kitchen/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { points, is_dealbreaker, weight } = req.body;
    
    const result = db.updateKitchenPoints(id, points, is_dealbreaker, weight);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Kitchen points not found' });
    }
    
    res.json({ success: true, id, points, is_dealbreaker, weight });
  } catch (error) {
    console.error('Error updating kitchen points:', error);
    res.status(500).json({ error: 'Failed to update kitchen points' });
  }
});

// POST /api/scoring/reset - Reset all scoring configuration to defaults
router.post('/scoring/reset', (req, res) => {
  try {
    // Reset configuration values to defaults
    const defaultConfig = [
      { key: 'bedroom_min_sqm', value: '8.0' },
      { key: 'bedroom_points', value: '10' },
      { key: 'weight_bedroom', value: '1.0' },
      { key: 'total_area_min_sqm', value: '77.0' },
      { key: 'weight_total_area', value: '1.0' },
      { key: 'floor_max_entrance', value: '2' },
      { key: 'weight_floor_entrance', value: '1.0' },
      { key: 'weight_budget', value: '1.0' },
      { key: 'weight_kitchen_layout', value: '1.0' }
    ];

    for (const config of defaultConfig) {
      db.updateScoringConfig(config.key, config.value);
    }

    // Reset total area bands
    db.resetTotalAreaBands();
    const areaBands = [
      { min_sqm: 77, max_sqm: 79, points: 5 },
      { min_sqm: 80, max_sqm: 85, points: 7 },
      { min_sqm: 86, max_sqm: 90, points: 9 },
      { min_sqm: 91, max_sqm: null, points: 10 }
    ];
    for (const band of areaBands) {
      db.addTotalAreaBand(band.min_sqm, band.max_sqm, band.points);
    }

    // Reset budget bands
    db.resetBudgetBands();
    const budgetBands = [
      { min_price: 0, max_price: 750000, points: 10 },
      { min_price: 751000, max_price: 790000, points: 5 },
      { min_price: 791000, max_price: null, points: -5 }
    ];
    for (const band of budgetBands) {
      db.addBudgetBand(band.min_price, band.max_price, band.points);
    }

    // Reset kitchen points
    db.resetKitchenPoints();
    const kitchenTypes = [
      { kitchen_type: 'open', points: 10, is_dealbreaker: 0 },
      { kitchen_type: 'relocatable', points: 5, is_dealbreaker: 0 },
      { kitchen_type: 'closed', points: 0, is_dealbreaker: 1 }
    ];
    for (const kitchen of kitchenTypes) {
      db.addKitchenPoints(kitchen.kitchen_type, kitchen.points, kitchen.is_dealbreaker);
    }

    res.json({ success: true, message: 'Configuration reset to defaults' });
  } catch (error) {
    console.error('Error resetting scoring config:', error);
    res.status(500).json({ error: 'Failed to reset scoring configuration' });
  }
});

export default router;
