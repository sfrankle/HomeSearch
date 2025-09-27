package com.rules.core

import java.util.UUID

/**
 * Represents a field that users can store values against.
 *
 * @param id Unique identifier for the attribute
 * @param name Machine-readable name (e.g., "main_bedroom_sqm")
 * @param displayName User-facing label (e.g., "Main Bedroom Size")
 * @param type The data type of this attribute
 * @param category Optional grouping for UI organization
 * @param order Optional ordering for UI display
 */
data class AttributeDefinition(
        val id: UUID = UUID.randomUUID(),
        val name: String,
        val displayName: String,
        val type: AttributeType,
        val category: String? = null,
        val order: Int? = null
)
