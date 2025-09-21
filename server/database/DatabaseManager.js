import DatabaseConnection from './DatabaseConnection.js';
import PropertyRepository from './PropertyRepository.js';
import ScoringConfigRepository from './ScoringConfigRepository.js';

/**
 * Main database manager that coordinates between repositories
 * Single Responsibility: Database coordination and facade
 */
class DatabaseManager {
  constructor() {
    this.connection = new DatabaseConnection();
    this.db = this.connection.getConnection();
    this.propertyRepo = new PropertyRepository(this.db);
    this.scoringConfigRepo = new ScoringConfigRepository(this.db);
  }

  init() {
    this.connection.init();
  }

  close() {
    this.connection.close();
  }

  // Property operations - delegate to PropertyRepository
  async getPropertyById(id) {
    return await this.propertyRepo.getPropertyById(id);
  }

  async getAllProperties() {
    return await this.propertyRepo.getAllProperties();
  }

  async createProperty(property) {
    return await this.propertyRepo.createProperty(property);
  }

  async updateProperty(id, updates) {
    return await this.propertyRepo.updateProperty(id, updates);
  }

  deleteProperty(id) {
    return this.propertyRepo.deleteProperty(id);
  }

  // Scoring configuration operations - delegate to ScoringConfigRepository
  getScoringConfig() {
    return this.scoringConfigRepo.getScoringConfig();
  }

  updateScoringConfig(key, value) {
    return this.scoringConfigRepo.updateScoringConfig(key, value);
  }

  // Total Area Bands
  getTotalAreaBands() {
    return this.scoringConfigRepo.getTotalAreaBands();
  }

  updateTotalAreaBand(id, minSqm, maxSqm, points, weight = 1.0) {
    return this.scoringConfigRepo.updateTotalAreaBand(id, minSqm, maxSqm, points, weight);
  }

  addTotalAreaBand(minSqm, maxSqm, points, weight = 1.0) {
    return this.scoringConfigRepo.addTotalAreaBand(minSqm, maxSqm, points, weight);
  }

  deleteTotalAreaBand(id) {
    return this.scoringConfigRepo.deleteTotalAreaBand(id);
  }

  // Budget Bands
  getBudgetBands() {
    return this.scoringConfigRepo.getBudgetBands();
  }

  updateBudgetBand(id, minPrice, maxPrice, points, weight = 1.0) {
    return this.scoringConfigRepo.updateBudgetBand(id, minPrice, maxPrice, points, weight);
  }

  addBudgetBand(minPrice, maxPrice, points, weight = 1.0) {
    return this.scoringConfigRepo.addBudgetBand(minPrice, maxPrice, points, weight);
  }

  deleteBudgetBand(id) {
    return this.scoringConfigRepo.deleteBudgetBand(id);
  }

  // Kitchen Points
  getKitchenPoints() {
    return this.scoringConfigRepo.getKitchenPoints();
  }

  updateKitchenPoints(id, points, isDealbreaker, weight = 1.0) {
    return this.scoringConfigRepo.updateKitchenPoints(id, points, isDealbreaker, weight);
  }

  addKitchenPoints(kitchenType, points, isDealbreaker, weight = 1.0) {
    return this.scoringConfigRepo.addKitchenPoints(kitchenType, points, isDealbreaker, weight);
  }

  deleteKitchenPoints(id) {
    return this.scoringConfigRepo.deleteKitchenPoints(id);
  }

  // Reset methods
  resetTotalAreaBands() {
    return this.scoringConfigRepo.resetTotalAreaBands();
  }

  resetBudgetBands() {
    return this.scoringConfigRepo.resetBudgetBands();
  }

  resetKitchenPoints() {
    return this.scoringConfigRepo.resetKitchenPoints();
  }
}

export default DatabaseManager;
