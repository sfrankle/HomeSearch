package com.rules.core

/**
 * Example usage of the rules-core library. This demonstrates how to set up attributes, rules, and
 * evaluate entries.
 */
object Examples {

    /** Demonstrates the basic usage pattern from the project overview. */
    fun basicExample() {
        // 1. Define attributes
        val mainBedroomSqm =
                AttributeDefinition(
                        name = "main_bedroom_sqm",
                        displayName = "Main Bedroom Size",
                        type = AttributeType.INTEGER,
                        category = "Sizing"
                )

        // 2. Create rules
        val minValueRule =
                Rule(
                        attributeId = mainBedroomSqm.id,
                        condition = RuleCondition.MinValue(8),
                        score = 0 // Filtering rule, not scoring
                )

        val band1Rule =
                Rule(
                        attributeId = mainBedroomSqm.id,
                        condition = RuleCondition.ThresholdBand(77, 79, 5)
                )

        val band2Rule =
                Rule(
                        attributeId = mainBedroomSqm.id,
                        condition = RuleCondition.ThresholdBand(80, 85, 7)
                )

        val band3Rule =
                Rule(
                        attributeId = mainBedroomSqm.id,
                        condition = RuleCondition.ThresholdBand(90, null, 10)
                )

        // 3. Create entry
        val entry = Entry(values = mapOf(mainBedroomSqm.id to AttributeValue.IntegerValue(82)))

        // 4. Evaluate
        val ruleEngine = RuleEngine()
        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(mainBedroomSqm),
                        rules = listOf(minValueRule, band1Rule, band2Rule, band3Rule)
                )

        // 5. Check results
        println("Main bedroom score: ${result.attributeScores[mainBedroomSqm.id]}")
        println("Total score: ${result.totalScore}")
        // Expected: Main bedroom score: 7, Total score: 7
    }

    /** Demonstrates multi-attribute evaluation. */
    fun multiAttributeExample() {
        // Define multiple attributes
        val bedroomSize =
                AttributeDefinition(
                        name = "bedroom_size",
                        displayName = "Bedroom Size",
                        type = AttributeType.INTEGER,
                        category = "Sizing"
                )

        val price =
                AttributeDefinition(
                        name = "price",
                        displayName = "Price",
                        type = AttributeType.DECIMAL,
                        category = "Financial"
                )

        val location =
                AttributeDefinition(
                        name = "location",
                        displayName = "Location",
                        type = AttributeType.STRING,
                        category = "Location"
                )

        // Create rules for each attribute
        val bedroomRule =
                Rule(
                        attributeId = bedroomSize.id,
                        condition = RuleCondition.ThresholdBand(80, 85, 7)
                )

        val priceRule =
                Rule(attributeId = price.id, condition = RuleCondition.MinValue(200), score = 5)

        val locationRule =
                Rule(attributeId = location.id, condition = RuleCondition.Equals("Amsterdam", 10))

        // Create entry with multiple values
        val entry =
                Entry(
                        values =
                                mapOf(
                                        bedroomSize.id to AttributeValue.IntegerValue(82),
                                        price.id to AttributeValue.DecimalValue(250.0),
                                        location.id to AttributeValue.StringValue("Amsterdam")
                                )
                )

        // Evaluate
        val ruleEngine = RuleEngine()
        val result =
                ruleEngine.evaluate(
                        entry = entry,
                        attributes = listOf(bedroomSize, price, location),
                        rules = listOf(bedroomRule, priceRule, locationRule)
                )

        // Check results
        println("Bedroom score: ${result.attributeScores[bedroomSize.id]}")
        println("Price score: ${result.attributeScores[price.id]}")
        println("Location score: ${result.attributeScores[location.id]}")
        println("Total score: ${result.totalScore}")
        // Expected: Bedroom score: 7, Price score: 5, Location score: 10, Total score: 22
    }
}
