package com.rules.core

import java.util.UUID

/**
 * A record of real-world data to be evaluated against rules.
 *
 * @param id Unique identifier for the entry
 * @param values Map of attribute IDs to their corresponding values
 * @param evaluatedScore The computed total score (set by RuleEngine)
 */
data class Entry(
    val id: UUID = UUID.randomUUID(),
    val values: Map<UUID, AttributeValue>,
    val evaluatedScore: Int = 0,
)
