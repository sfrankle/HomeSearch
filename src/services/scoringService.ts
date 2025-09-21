import { Property } from '../types/Property';

export interface ScoreBreakdown {
  bedroom_size?: { score: number; reason: string };
  total_area?: { score: number; reason: string };
  floor_entrance?: { score: number; reason: string };
  budget?: { score: number; reason: string };
  kitchen_layout?: { score: number; reason: string };
}

export interface ScoringResult {
  score_raw: number;
  score_max_possible: number;
  score_normalized: number;
  score_breakdown: ScoreBreakdown;
  dealbreakers: string[];
  // Legacy field for backward compatibility
  total_score?: number;
}

/**
 * Calculate property score based on HomeScoringSystem.md v1.2 rules
 * This is a frontend fallback implementation - the real calculation happens on the backend
 */
export function calculatePropertyScore(property: Property): ScoringResult {
  // This is a simplified frontend implementation for display purposes
  // The real calculation with database config happens on the backend
  const breakdown: ScoreBreakdown = {};
  const dealbreakers: string[] = [];
  let scoreRaw = 0;
  let scoreMaxPossible = 50; // Default max possible score

  // Use existing scoring data if available (from backend calculation)
  if (property.scoring?.score_breakdown) {
    const existingBreakdown = property.scoring.score_breakdown;
    breakdown.bedroom_size = existingBreakdown.bedroom_size;
    breakdown.total_area = existingBreakdown.total_area;
    breakdown.floor_entrance = existingBreakdown.floor_entrance;
    breakdown.budget = existingBreakdown.budget;
    breakdown.kitchen_layout = existingBreakdown.kitchen_layout;
    
    scoreRaw = property.scoring.score_raw || 0;
    scoreMaxPossible = property.scoring.score_max_possible || 50;
    
    if (property.scoring.dealbreakers) {
      dealbreakers.push(...property.scoring.dealbreakers);
    }
  } else {
    // Fallback to simple calculation for display
    const bedroomSize = property.scoring?.main_bedroom_sqm;
    if (bedroomSize !== undefined) {
      if (bedroomSize < 8) {
        breakdown.bedroom_size = { score: 0, reason: `Bedroom too small (${bedroomSize} m² < 8 m² required)` };
        dealbreakers.push('Bedroom too small');
      } else {
        breakdown.bedroom_size = { score: 10, reason: `Bedroom size acceptable (${bedroomSize} m² ≥ 8 m²)` };
        scoreRaw += 10;
      }
    } else {
      breakdown.bedroom_size = { score: 0, reason: 'Bedroom size not specified' };
    }

    const totalArea = property.details?.area_sqm;
    if (totalArea !== undefined) {
      if (totalArea < 77) {
        breakdown.total_area = { score: 0, reason: `Total area too small (${totalArea} m² < 77 m² required)` };
        dealbreakers.push('Total area too small');
      } else {
        let areaScore = 0;
        let reason = '';
        
        if (totalArea >= 77 && totalArea <= 79) {
          areaScore = 5;
          reason = `Area acceptable (${totalArea} m², 77-79 m² range)`;
        } else if (totalArea >= 80 && totalArea <= 85) {
          areaScore = 7;
          reason = `Area good (${totalArea} m², 80-85 m² range)`;
        } else if (totalArea >= 86 && totalArea <= 90) {
          areaScore = 9;
          reason = `Area very good (${totalArea} m², 86-90 m² range)`;
        } else if (totalArea > 90) {
          areaScore = 10;
          reason = `Area excellent (${totalArea} m² > 90 m²)`;
        }
        
        breakdown.total_area = { score: areaScore, reason };
        scoreRaw += areaScore;
      }
    } else {
      breakdown.total_area = { score: 0, reason: 'Total area not specified' };
    }

    const floorInfo = property.details?.floor_info;
    if (floorInfo !== undefined) {
      const floorNumber = parseFloorNumber(floorInfo);
      if (floorNumber !== null && floorNumber >= 3) {
        breakdown.floor_entrance = { score: 0, reason: `Floor too high (${floorInfo} ≥ 3rd floor)` };
        dealbreakers.push('Floor too high');
      } else {
        breakdown.floor_entrance = { score: 10, reason: `Floor acceptable (${floorInfo} ≤ 2nd floor)` };
        scoreRaw += 10;
      }
    } else {
      breakdown.floor_entrance = { score: 0, reason: 'Floor information not specified' };
    }

    const askingPrice = property.price?.asking_price_eur;
    if (askingPrice !== undefined) {
      let budgetScore = 0;
      let reason = '';
      
      if (askingPrice <= 750000) {
        budgetScore = 10;
        reason = `Price excellent (€${askingPrice.toLocaleString()} ≤ €750k)`;
      } else if (askingPrice >= 751000 && askingPrice <= 790000) {
        budgetScore = 5;
        reason = `Price acceptable (€${askingPrice.toLocaleString()}, €751k-€790k range)`;
      } else if (askingPrice > 790000) {
        budgetScore = -5;
        reason = `Price high (€${askingPrice.toLocaleString()} > €790k)`;
      }
      
      breakdown.budget = { score: budgetScore, reason };
      scoreRaw += budgetScore;
    } else {
      breakdown.budget = { score: 0, reason: 'Price not specified' };
    }

    const kitchenType = property.scoring?.kitchen_type;
    if (kitchenType !== undefined) {
      if (kitchenType === 'closed') {
        breakdown.kitchen_layout = { score: 0, reason: 'Kitchen layout closed (dealbreaker)' };
        dealbreakers.push('Kitchen layout closed');
      } else if (kitchenType === 'open') {
        breakdown.kitchen_layout = { score: 10, reason: 'Kitchen layout open (preferred)' };
        scoreRaw += 10;
      } else if (kitchenType === 'relocatable') {
        breakdown.kitchen_layout = { score: 5, reason: 'Kitchen layout relocatable (acceptable)' };
        scoreRaw += 5;
      }
    } else {
      breakdown.kitchen_layout = { score: 0, reason: 'Kitchen type not specified' };
    }

    if (dealbreakers.length > 0) {
      scoreRaw = 0;
    }
  }

  const scoreNormalized = scoreMaxPossible > 0 ? Math.round(10 * scoreRaw / scoreMaxPossible * 10) / 10 : 0;
  const scoreNormalizedClipped = Math.max(0, Math.min(10, scoreNormalized));

  return {
    score_raw: scoreRaw,
    score_max_possible: scoreMaxPossible,
    score_normalized: scoreNormalizedClipped,
    score_breakdown: breakdown,
    dealbreakers,
    total_score: scoreNormalizedClipped // Legacy field for backward compatibility
  };
}

/**
 * Parse floor number from Dutch floor info string
 */
function parseFloorNumber(floorInfo: string): number | null {
  const lower = floorInfo.toLowerCase();
  
  if (lower === 'parterre' || lower === 'begane grond') {
    return 0;
  }
  
  // Match patterns like "1e", "2e", "3e", etc.
  const match = lower.match(/(\d+)e/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Match patterns like "1ste", "2de", "3de", etc.
  const matchSte = lower.match(/(\d+)ste/);
  if (matchSte) {
    return parseInt(matchSte[1]);
  }
  
  // Match patterns like "1st", "2nd", "3rd", etc.
  const matchOrdinal = lower.match(/(\d+)(st|nd|rd|th)/);
  if (matchOrdinal) {
    return parseInt(matchOrdinal[1]);
  }
  
  return null;
}

/**
 * Get score color class for UI display (0-10 scale)
 */
export function getScoreColorClass(score: number): string {
  if (score >= 8.0) return 'text-green-600 bg-green-100';
  if (score >= 6.0) return 'text-blue-600 bg-blue-100';
  if (score >= 4.0) return 'text-yellow-600 bg-yellow-100';
  if (score >= 2.0) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

/**
 * Get score emoji for UI display (0-10 scale)
 */
export function getScoreEmoji(score: number): string {
  if (score >= 8.0) return '🏆';
  if (score >= 6.0) return '⭐';
  if (score >= 4.0) return '👍';
  if (score >= 2.0) return '👌';
  return '❌';
}

