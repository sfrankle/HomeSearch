package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID

class RuleTest {

    @Test
    fun `should create rule with default values`() {
        val attributeId = UUID.randomUUID()
        val condition = RuleCondition.MinValue(10)

        val rule = Rule(attributeId = attributeId, condition = condition)

        assertNotNull(rule.id)
        assertEquals(attributeId, rule.attributeId)
        assertEquals(condition, rule.condition)
        assertEquals(0, rule.score)
    }

    @Test
    fun `should create rule with all fields`() {
        val id = UUID.randomUUID()
        val attributeId = UUID.randomUUID()
        val condition = RuleCondition.ThresholdBand(5, 10)

        val rule = Rule(id = id, attributeId = attributeId, condition = condition, score = 20)

        assertEquals(id, rule.id)
        assertEquals(attributeId, rule.attributeId)
        assertEquals(condition, rule.condition)
        assertEquals(20, rule.score)
    }
}
