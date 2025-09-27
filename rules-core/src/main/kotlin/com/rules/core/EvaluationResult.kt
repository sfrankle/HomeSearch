package com.rules.core

import java.util.UUID

/**
 * Result of evaluating an entry against a set of rules.
 *
 * @param attributeScores Map of attribute IDs to their individual scores
 * @param totalScore Sum of all attribute scores
 */
data class EvaluationResult(val attributeScores: Map<UUID, Int>, val totalScore: Int)
