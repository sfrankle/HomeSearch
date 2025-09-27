package com.rules.core.models

import java.util.UUID

/**
 * Represents a field that users can store values against.
 *
 * @param name Machine-readable name (e.g., "main_bedroom_sqm")
 * @param displayName User-facing label (e.g., "Main Bedroom Size")
 * @param type The data type of this attribute
 * @param category Optional grouping for UI organization
 * @param order Optional ordering for UI display
 * @param id Unique identifier for the attribute
 */
data class AttributeDefinition(
    val name: String,
    val displayName: String,
    val type: AttributeType,
    val category: String? = null,
    val order: Int? = null,
    val id: UUID = UUID.randomUUID(),
)
