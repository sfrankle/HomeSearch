/**
 * Calculate property score based on generic scoring rules from database
 */
export async function calculatePropertyScore(property, dbManager) {
  const breakdown = {};
  const dealbreakers = [];
  let scoreRaw = 0;
  let scoreMaxPossible = 0;

  // Get all scoring rules with their complete configuration
  const ScoringConfigRepository = (await import('../database/ScoringConfigRepository.js')).default;
  const scoringRepo = new ScoringConfigRepository(dbManager.db);
  const rules = scoringRepo.getAllCompleteRuleConfigs();

  // Process each rule
  for (const rule of rules) {
    const ruleResult = evaluateRule(rule, property);
    
    breakdown[rule.key] = {
      score: ruleResult.score,
      reason: ruleResult.reason,
      category: rule.category,
      type: rule.type
    };

    if (ruleResult.isDealbreaker) {
      dealbreakers.push(ruleResult.reason);
    } else {
      scoreRaw += ruleResult.score;
    }

    scoreMaxPossible += ruleResult.maxPossible;
  }

  // If any dealbreakers, score_raw is 0
  if (dealbreakers.length > 0) {
    scoreRaw = 0;
  }

  // Calculate normalized score (0-10 with 1 decimal)
  const scoreNormalized = scoreMaxPossible > 0 ? Math.round(10 * scoreRaw / scoreMaxPossible * 10) / 10 : 0;
  const scoreNormalizedClipped = Math.max(0, Math.min(10, scoreNormalized));

  return {
    score_raw: scoreRaw,
    score_max_possible: scoreMaxPossible,
    score_normalized: scoreNormalizedClipped,
    score_breakdown: breakdown,
    dealbreakers
  };
}

/**
 * Evaluate a single scoring rule against a property
 */
function evaluateRule(rule, property) {
  const weightedScore = rule.weight || 1.0;
  
  switch (rule.type) {
    case 'threshold':
      return evaluateThresholdRule(rule, property, weightedScore);
    case 'banded':
      return evaluateBandedRule(rule, property, weightedScore);
    case 'enum':
      return evaluateEnumRule(rule, property, weightedScore);
    case 'dealbreaker':
      return evaluateDealbreakerRule(rule, property, weightedScore);
    default:
      return {
        score: 0,
        maxPossible: 0,
        reason: `Unknown rule type: ${rule.type}`,
        isDealbreaker: false
      };
  }
}

/**
 * Evaluate a threshold rule (e.g., bedroom size, floor entrance)
 */
function evaluateThresholdRule(rule, property, weight) {
  const threshold = rule.default_threshold;
  const points = rule.default_points || 10;
  const isDealbreaker = rule.is_dealbreaker;
  
  // Get property value based on rule key
  const propertyValue = getPropertyValue(rule.key, property);
  
  if (propertyValue === undefined || propertyValue === null) {
    return {
      score: 0,
      maxPossible: points * weight,
      reason: `${rule.description || rule.key} not specified`,
      isDealbreaker: false
    };
  }

  // Special logic for floor entrance (higher values are worse)
  let meetsThreshold;
  let reason;
  
  if (rule.key === 'floor_max_entrance') {
    meetsThreshold = propertyValue <= threshold;
    reason = meetsThreshold 
      ? `${rule.description || rule.key} acceptable (${propertyValue} ≤ ${threshold})`
      : `${rule.description || rule.key} too high (${propertyValue} > ${threshold})`;
  } else {
    // Standard logic for other rules (higher values are better)
    meetsThreshold = propertyValue >= threshold;
    reason = meetsThreshold 
      ? `${rule.description || rule.key} meets threshold (${propertyValue} ≥ ${threshold})`
      : `${rule.description || rule.key} below threshold (${propertyValue} < ${threshold})`;
  }
  
  const weightedScore = meetsThreshold ? points * weight : 0;
  
  if (isDealbreaker && !meetsThreshold) {
    return {
      score: 0,
      maxPossible: points * weight,
      reason: reason,
      isDealbreaker: true
    };
  }

  return {
    score: weightedScore,
    maxPossible: points * weight,
    reason: reason,
    isDealbreaker: false
  };
}

/**
 * Evaluate a banded rule (e.g., total area, budget)
 */
function evaluateBandedRule(rule, property, weight) {
  const threshold = rule.default_threshold;
  const isDealbreaker = rule.is_dealbreaker;
  const bands = rule.bands || [];
  
  // Get property value based on rule key
  const propertyValue = getPropertyValue(rule.key, property);
  
  if (propertyValue === undefined || propertyValue === null) {
    return {
      score: 0,
      maxPossible: Math.max(...bands.map(band => band.points * weight), 0),
      reason: `${rule.description || rule.key} not specified`,
      isDealbreaker: false
    };
  }

  // Check threshold first (if it's a dealbreaker)
  if (isDealbreaker && threshold !== undefined && propertyValue < threshold) {
    return {
      score: 0,
      maxPossible: Math.max(...bands.map(band => band.points * weight), 0),
      reason: `${rule.description || rule.key} below threshold (${propertyValue} < ${threshold})`,
      isDealbreaker: true
    };
  }

  // Find matching band
  let matchedBand = null;
  for (const band of bands) {
    if (propertyValue >= band.min_value && (band.max_value === null || propertyValue <= band.max_value)) {
      matchedBand = band;
      break;
    }
  }

  if (!matchedBand) {
    return {
      score: 0,
      maxPossible: Math.max(...bands.map(band => band.points * weight), 0),
      reason: `${rule.description || rule.key} value ${propertyValue} doesn't match any band`,
      isDealbreaker: false
    };
  }

  const weightedScore = matchedBand.points * weight;
  const range = matchedBand.max_value 
    ? `${matchedBand.min_value}-${matchedBand.max_value}` 
    : `${matchedBand.min_value}+`;
  
  return {
    score: weightedScore,
    maxPossible: Math.max(...bands.map(band => band.points * weight), 0),
    reason: `${rule.description || rule.key} in range ${range} (${propertyValue}, ${matchedBand.points} points)`,
    isDealbreaker: false
  };
}

/**
 * Evaluate an enum rule (e.g., kitchen layout)
 */
function evaluateEnumRule(rule, property, weight) {
  const enums = rule.enums || [];
  
  // Get property value based on rule key
  const propertyValue = getPropertyValue(rule.key, property);
  
  if (propertyValue === undefined || propertyValue === null) {
    return {
      score: 0,
      maxPossible: Math.max(...enums.filter(e => !e.is_dealbreaker).map(e => e.points * weight), 0),
      reason: `${rule.description || rule.key} not specified`,
      isDealbreaker: false
    };
  }

  // Find matching enum option
  const matchedEnum = enums.find(e => e.option === propertyValue);
  
  if (!matchedEnum) {
    return {
      score: 0,
      maxPossible: Math.max(...enums.filter(e => !e.is_dealbreaker).map(e => e.points * weight), 0),
      reason: `Unknown ${rule.description || rule.key}: ${propertyValue}`,
      isDealbreaker: false
    };
  }

  const weightedScore = matchedEnum.points * weight;
  
  if (matchedEnum.is_dealbreaker) {
    return {
      score: 0,
      maxPossible: Math.max(...enums.filter(e => !e.is_dealbreaker).map(e => e.points * weight), 0),
      reason: `${rule.description || rule.key} ${propertyValue} (dealbreaker)`,
      isDealbreaker: true
    };
  }

  return {
    score: weightedScore,
    maxPossible: Math.max(...enums.filter(e => !e.is_dealbreaker).map(e => e.points * weight), 0),
    reason: `${rule.description || rule.key} ${propertyValue} (${matchedEnum.points} points)`,
    isDealbreaker: false
  };
}

/**
 * Evaluate a dealbreaker rule (simple pass/fail)
 */
function evaluateDealbreakerRule(rule, property, weight) {
  const threshold = rule.default_threshold;
  const points = rule.default_points || 10;
  
  // Get property value based on rule key
  const propertyValue = getPropertyValue(rule.key, property);
  
  if (propertyValue === undefined || propertyValue === null) {
    return {
      score: 0,
      maxPossible: points * weight,
      reason: `${rule.description || rule.key} not specified`,
      isDealbreaker: false
    };
  }

  const passes = propertyValue >= threshold;
  const weightedScore = passes ? points * weight : 0;
  
  return {
    score: weightedScore,
    maxPossible: points * weight,
    reason: passes 
      ? `${rule.description || rule.key} passes (${propertyValue} ≥ ${threshold})`
      : `${rule.description || rule.key} fails (${propertyValue} < ${threshold})`,
    isDealbreaker: !passes
  };
}

/**
 * Get property value based on rule key
 * Maps rule keys to property field paths
 */
function getPropertyValue(ruleKey, property) {
  const valueMap = {
    'bedroom_min_sqm': property.scoring?.main_bedroom_sqm,
    'total_area_min_sqm': property.details?.area_sqm,
    'floor_max_entrance': parseFloorNumber(property.details?.floor_info),
    'budget_max_price': property.price?.asking_price_eur,
    'kitchen_layout': property.scoring?.kitchen_type,
    'foundation_status': property.scoring?.foundation_status,
    'street_noise': property.scoring?.street_noise,
    'smelly_business_below': property.scoring?.smelly_business_below,
    'commute_time_central_min': property.scoring?.commute_time_central_min,
    'commute_time_mark_min': property.scoring?.commute_time_mark_min,
    'commute_time_sarah_min': property.scoring?.commute_time_sarah_min,
    'workspace_count': property.scoring?.workspace_count,
    'viewing_status': property.scoring?.viewing_status
  };

  return valueMap[ruleKey];
}

/**
 * Parse floor number from Dutch floor info string
 */
function parseFloorNumber(floorInfo) {
  if (!floorInfo) return null;
  
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