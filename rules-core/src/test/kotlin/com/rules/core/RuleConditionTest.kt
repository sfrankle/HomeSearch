package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RuleConditionTest {

    @Test
    fun `should create InfoOnly condition`() {
        val condition = RuleCondition.InfoOnly
        assertTrue(condition is RuleCondition.InfoOnly)
    }

    @Test
    fun `should create MinValue condition`() {
        val condition = RuleCondition.MinValue(10)
        assertTrue(condition is RuleCondition.MinValue)
        assertEquals(10, condition.min)
    }

    @Test
    fun `should create ThresholdBand condition with min and max`() {
        val condition = RuleCondition.ThresholdBand(5, 10, 15)
        assertTrue(condition is RuleCondition.ThresholdBand)
        assertEquals(5, condition.min)
        assertEquals(10, condition.max)
        assertEquals(15, condition.score)
    }

    @Test
    fun `should create ThresholdBand condition with only min`() {
        val condition = RuleCondition.ThresholdBand(5, null, 20)
        assertTrue(condition is RuleCondition.ThresholdBand)
        assertEquals(5, condition.min)
        assertNull(condition.max)
        assertEquals(20, condition.score)
    }

    @Test
    fun `should create ThresholdBand condition with only max`() {
        val condition = RuleCondition.ThresholdBand(null, 10, 25)
        assertTrue(condition is RuleCondition.ThresholdBand)
        assertNull(condition.min)
        assertEquals(10, condition.max)
        assertEquals(25, condition.score)
    }

    @Test
    fun `should create Equals condition`() {
        val condition = RuleCondition.Equals("Amsterdam", 30)
        assertTrue(condition is RuleCondition.Equals)
        assertEquals("Amsterdam", condition.value)
        assertEquals(30, condition.score)
    }
}
