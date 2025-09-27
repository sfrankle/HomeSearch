package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/**
 * Example usage test demonstrating the real-world scenario from the project overview. This test
 * shows how to set up attributes, rules, and evaluate entries.
 */
class ExampleUsageTest {

    private lateinit var ruleEngine: RuleEngine
    private lateinit var mainBedroomSqmAttr: AttributeDefinition

    @BeforeEach
    fun setUp() {
        ruleEngine = RuleEngine()

        mainBedroomSqmAttr =
                AttributeDefinition(
                        name = "main_bedroom_sqm",
                        displayName = "Main Bedroom Size",
                        type = AttributeType.INTEGER,
                        category = "Sizing"
                )
    }

    @Test
    fun `should demonstrate example from project overview`() {
        // Create rules as described in the project overview
        val minValueRule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.MinValue(8),
                        score = 0 // This rule is for filtering, not scoring
                )

        val band1Rule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.ThresholdBand(77, 79, 5)
                )

        val band2Rule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.ThresholdBand(80, 85, 7)
                )

        val band3Rule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.ThresholdBand(90, null, 10)
                )

        // Create entry with value 82 (as in the example)
        val entry = Entry(values = mapOf(mainBedroomSqmAttr.id to AttributeValue.IntegerValue(82)))

        // Evaluate the entry
        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(mainBedroomSqmAttr),
                        rules = listOf(minValueRule, band1Rule, band2Rule, band3Rule)
                )

        // Verify the result matches the expected outcome from the project overview
        assertEquals(7, result.attributeScores[mainBedroomSqmAttr.id])
        assertEquals(7, result.totalScore)
    }

    @Test
    fun `should demonstrate multiple attribute evaluation`() {
        // Create additional attributes
        val priceAttr =
                AttributeDefinition(
                        name = "price",
                        displayName = "Price",
                        type = AttributeType.DECIMAL,
                        category = "Financial"
                )

        val locationAttr =
                AttributeDefinition(
                        name = "location",
                        displayName = "Location",
                        type = AttributeType.STRING,
                        category = "Location"
                )

        // Create rules for each attribute
        val bedroomRule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.ThresholdBand(80, 85, 7)
                )

        val priceRule =
                Rule(attributeId = priceAttr.id, condition = RuleCondition.MinValue(200), score = 5)

        val locationRule =
                Rule(
                        attributeId = locationAttr.id,
                        condition = RuleCondition.Equals("Amsterdam", 10)
                )

        // Create entry with multiple values
        val entry =
                Entry(
                        values =
                                mapOf(
                                        mainBedroomSqmAttr.id to AttributeValue.IntegerValue(82),
                                        priceAttr.id to AttributeValue.DecimalValue(250.0),
                                        locationAttr.id to AttributeValue.StringValue("Amsterdam")
                                )
                )

        // Evaluate the entry
        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(mainBedroomSqmAttr, priceAttr, locationAttr),
                        rules = listOf(bedroomRule, priceRule, locationRule)
                )

        // Verify individual scores and total
        assertEquals(7, result.attributeScores[mainBedroomSqmAttr.id])
        assertEquals(5, result.attributeScores[priceAttr.id])
        assertEquals(10, result.attributeScores[locationAttr.id])
        assertEquals(22, result.totalScore)
    }

    @Test
    fun `should demonstrate edge cases`() {
        // Test boundary values
        val boundaryRule =
                Rule(
                        attributeId = mainBedroomSqmAttr.id,
                        condition = RuleCondition.ThresholdBand(80, 85, 5)
                )

        // Test exact minimum boundary
        val entryMin =
                Entry(values = mapOf(mainBedroomSqmAttr.id to AttributeValue.IntegerValue(80)))

        val resultMin =
                ruleEngine.evaluate(
                        entry = entryMin,
                        attributes = listOf(mainBedroomSqmAttr),
                        rules = listOf(boundaryRule)
                )

        assertEquals(5, resultMin.attributeScores[mainBedroomSqmAttr.id])

        // Test exact maximum boundary
        val entryMax =
                Entry(values = mapOf(mainBedroomSqmAttr.id to AttributeValue.IntegerValue(85)))

        val resultMax =
                ruleEngine.evaluate(
                        entry = entryMax,
                        attributes = listOf(mainBedroomSqmAttr),
                        rules = listOf(boundaryRule)
                )

        assertEquals(5, resultMax.attributeScores[mainBedroomSqmAttr.id])

        // Test just outside boundaries
        val entryBelow =
                Entry(values = mapOf(mainBedroomSqmAttr.id to AttributeValue.IntegerValue(79)))

        val resultBelow =
                ruleEngine.evaluate(
                        entry = entryBelow,
                        attributes = listOf(mainBedroomSqmAttr),
                        rules = listOf(boundaryRule)
                )

        assertEquals(0, resultBelow.attributeScores[mainBedroomSqmAttr.id])

        val entryAbove =
                Entry(values = mapOf(mainBedroomSqmAttr.id to AttributeValue.IntegerValue(86)))

        val resultAbove =
                ruleEngine.evaluate(
                        entry = entryAbove,
                        attributes = listOf(mainBedroomSqmAttr),
                        rules = listOf(boundaryRule)
                )

        assertEquals(0, resultAbove.attributeScores[mainBedroomSqmAttr.id])
    }
}
