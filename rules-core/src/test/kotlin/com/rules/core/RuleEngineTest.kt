package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RuleEngineTest {

    private lateinit var ruleEngine: RuleEngine
    private lateinit var bedroomSizeAttr: AttributeDefinition
    private lateinit var priceAttr: AttributeDefinition
    private lateinit var locationAttr: AttributeDefinition

    @BeforeEach
    fun setUp() {
        ruleEngine = RuleEngine()

        bedroomSizeAttr =
                AttributeDefinition(
                        name = "bedroom_size",
                        displayName = "Bedroom Size",
                        type = AttributeType.INTEGER
                )

        priceAttr =
                AttributeDefinition(
                        name = "price",
                        displayName = "Price",
                        type = AttributeType.DECIMAL
                )

        locationAttr =
                AttributeDefinition(
                        name = "location",
                        displayName = "Location",
                        type = AttributeType.STRING
                )
    }

    @Test
    fun `should evaluate InfoOnly rule`() {
        val rule = Rule(attributeId = bedroomSizeAttr.id, condition = RuleCondition.InfoOnly)

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(15)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should evaluate MinValue rule - pass`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.MinValue(10),
                        score = 5
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(15)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(5, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(5, result.totalScore)
    }

    @Test
    fun `should evaluate MinValue rule - fail`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.MinValue(10),
                        score = 5
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(8)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should evaluate MinValue rule with decimal`() {
        val rule =
                Rule(
                        attributeId = priceAttr.id,
                        condition = RuleCondition.MinValue(100),
                        score = 10
                )

        val entry = Entry(values = mapOf(priceAttr.id to AttributeValue.DecimalValue(150.5)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(priceAttr),
                        rules = listOf(rule)
                )

        assertEquals(10, result.attributeScores[priceAttr.id])
        assertEquals(10, result.totalScore)
    }

    @Test
    fun `should evaluate ThresholdBand rule - within range`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(10, 15, 7)
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(12)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(7, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(7, result.totalScore)
    }

    @Test
    fun `should evaluate ThresholdBand rule - below range`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(10, 15, 7)
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(8)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should evaluate ThresholdBand rule - above range`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(10, 15, 7)
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(20)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should evaluate ThresholdBand rule with only min`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(10, null, 5)
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(15)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(5, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(5, result.totalScore)
    }

    @Test
    fun `should evaluate ThresholdBand rule with only max`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(null, 15, 3)
                )

        val entry = Entry(values = mapOf(bedroomSizeAttr.id to AttributeValue.IntegerValue(12)))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(3, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(3, result.totalScore)
    }

    @Test
    fun `should evaluate Equals rule - match`() {
        val rule =
                Rule(
                        attributeId = locationAttr.id,
                        condition = RuleCondition.Equals("Amsterdam", 10)
                )

        val entry =
                Entry(values = mapOf(locationAttr.id to AttributeValue.StringValue("Amsterdam")))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(locationAttr),
                        rules = listOf(rule)
                )

        assertEquals(10, result.attributeScores[locationAttr.id])
        assertEquals(10, result.totalScore)
    }

    @Test
    fun `should evaluate Equals rule - no match`() {
        val rule =
                Rule(
                        attributeId = locationAttr.id,
                        condition = RuleCondition.Equals("Amsterdam", 10)
                )

        val entry = Entry(values = mapOf(locationAttr.id to AttributeValue.StringValue("Berlin")))

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(locationAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[locationAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should evaluate multiple rules and sum scores`() {
        val bedroomRule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.ThresholdBand(10, 15, 5)
                )

        val priceRule =
                Rule(
                        attributeId = priceAttr.id,
                        condition = RuleCondition.MinValue(100),
                        score = 10
                )

        val entry =
                Entry(
                        values =
                                mapOf(
                                        bedroomSizeAttr.id to AttributeValue.IntegerValue(12),
                                        priceAttr.id to AttributeValue.DecimalValue(150.0)
                                )
                )

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr, priceAttr),
                        rules = listOf(bedroomRule, priceRule)
                )

        assertEquals(5, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(10, result.attributeScores[priceAttr.id])
        assertEquals(15, result.totalScore)
    }

    @Test
    fun `should handle missing attribute values`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.MinValue(10),
                        score = 5
                )

        val entry =
                Entry(
                        values = emptyMap() // No values provided
                )

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `should handle type mismatches gracefully`() {
        val rule =
                Rule(
                        attributeId = bedroomSizeAttr.id,
                        condition = RuleCondition.MinValue(10),
                        score = 5
                )

        val entry =
                Entry(
                        values =
                                mapOf(
                                        bedroomSizeAttr.id to
                                                AttributeValue.StringValue("not_a_number")
                                )
                )

        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSizeAttr),
                        rules = listOf(rule)
                )

        assertEquals(0, result.attributeScores[bedroomSizeAttr.id])
        assertEquals(0, result.totalScore)
    }
}
