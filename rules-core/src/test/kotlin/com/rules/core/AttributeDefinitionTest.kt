package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID

class AttributeDefinitionTest {

    @Test
    fun `should create attribute definition with default values`() {
        val attr =
            AttributeDefinition(
                name = "bedroom_size",
                displayName = "Bedroom Size",
                type = AttributeType.INTEGER,
            )

        assertAll(
            { assertNotNull(attr.id) },
            { assertEquals("bedroom_size", attr.name) },
            { assertEquals("Bedroom Size", attr.displayName) },
            { assertEquals(AttributeType.INTEGER, attr.type) },
            { assertNull(attr.category) },
            { assertNull(attr.order) },
        )
    }

    @Test
    fun `should create attribute definition with all fields`() {
        val id = UUID.randomUUID()
        val attr =
            AttributeDefinition(
                id = id,
                name = "price",
                displayName = "Price",
                type = AttributeType.DECIMAL,
                category = "Financial",
                order = 1,
            )

        assertAll(
            { assertEquals(id, attr.id) },
            { assertEquals("price", attr.name) },
            { assertEquals("Price", attr.displayName) },
            { assertEquals(AttributeType.DECIMAL, attr.type) },
            { assertEquals("Financial", attr.category) },
            { assertEquals(1, attr.order) },
        )
    }

    @Test
    fun `should generate unique ids when not provided`() {
        val a1 = AttributeDefinition("attr1", "Attr 1", AttributeType.INTEGER)
        val a2 = AttributeDefinition("attr2", "Attr 2", AttributeType.INTEGER)

        assertNotEquals(a1.id, a2.id)
    }
}
