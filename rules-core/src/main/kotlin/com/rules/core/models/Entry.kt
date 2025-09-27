package com.rules.core.models

import java.util.UUID

/**
 * A record of data to be evaluated against rules.
 *
 * @param values Map of attribute IDs to their corresponding values
 * @param evaluatedScore The computed total score (set by RuleEngine)
 * @param id Unique identifier for the entry
 */
data class Entry(
    val values: Map<UUID, AttributeValue>,
    val evaluatedScore: Int = 0,
    val id: UUID = UUID.randomUUID(),
)
