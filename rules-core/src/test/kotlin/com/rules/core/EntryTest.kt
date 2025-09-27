package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID

class EntryTest {

    @Test
    fun `should create entry with default values`() {
        val values = mapOf<UUID, AttributeValue>()

        val entry = Entry(values = values)

        assertNotNull(entry.id)
        assertEquals(values, entry.values)
        assertEquals(0, entry.evaluatedScore)
    }

    @Test
    fun `should create entry with all fields`() {
        val id = UUID.randomUUID()
        val attributeId = UUID.randomUUID()
        val values = mapOf(attributeId to AttributeValue.IntegerValue(15))

        val entry = Entry(id = id, values = values, evaluatedScore = 10)

        assertEquals(id, entry.id)
        assertEquals(values, entry.values)
        assertEquals(10, entry.evaluatedScore)
    }

    @Test
    fun `should create different attribute value types`() {
        val integerValue = AttributeValue.IntegerValue(42)
        val decimalValue = AttributeValue.DecimalValue(3.14)
        val stringValue = AttributeValue.StringValue("test")
        val enumValue = AttributeValue.EnumValue("OPTION_A")

        assertEquals(42, integerValue.value)
        assertEquals(3.14, decimalValue.value)
        assertEquals("test", stringValue.value)
        assertEquals("OPTION_A", enumValue.value)
    }
}
