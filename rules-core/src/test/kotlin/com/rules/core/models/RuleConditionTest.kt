package com.rules.core.models

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RuleConditionTest {

    @Test
    fun `should create MinValue condition`() {
        val condition = RuleCondition.MinValue(10)
        assertEquals(10, condition.min)
    }

    @Test
    fun `should create ThresholdBand condition with min and max`() {
        val condition = RuleCondition.ThresholdBand(5, 10)
        assertEquals(5, condition.min)
        assertEquals(10, condition.max)
    }

    @Test
    fun `should create ThresholdBand condition with only min`() {
        val condition = RuleCondition.ThresholdBand(5, null)
        assertEquals(5, condition.min)
        assertNull(condition.max)
    }

    @Test
    fun `should create ThresholdBand condition with only max`() {
        val condition = RuleCondition.ThresholdBand(null, 10)
        assertNull(condition.min)
        assertEquals(10, condition.max)
    }

    @Test
    fun `should create Equals condition`() {
        val condition = RuleCondition.Equals("Amsterdam")
        assertEquals("Amsterdam", condition.value)
    }
}
