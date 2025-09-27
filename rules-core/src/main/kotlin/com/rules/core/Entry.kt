package com.rules.core

import java.util.UUID

/**
 * Represents a value that can be stored against an attribute. Sealed class to handle different data
 * types safely.
 */
sealed class AttributeValue {
    data class IntegerValue(val value: Int) : AttributeValue()
    data class DecimalValue(val value: Double) : AttributeValue()
    data class StringValue(val value: String) : AttributeValue()
    data class EnumValue(val value: String) : AttributeValue()
}

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
        val evaluatedScore: Int = 0
)
