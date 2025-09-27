package com.rules.core

import java.util.UUID

/**
 * A rule that defines how an attribute should be evaluated and scored.
 *
 * @param id Unique identifier for the rule
 * @param attributeId Reference to the AttributeDefinition this rule applies to
 * @param condition The evaluation condition for this rule
 * @param score Points awarded if the condition is met (ignored for InfoOnly)
 */
data class Rule(
    val id: UUID = UUID.randomUUID(),
    val attributeId: UUID,
    val condition: RuleCondition,
    val score: Int = 0,
)
