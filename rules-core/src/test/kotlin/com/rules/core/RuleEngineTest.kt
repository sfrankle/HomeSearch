package com.rules.core

import com.rules.core.models.AttributeDefinition
import com.rules.core.models.AttributeType
import com.rules.core.models.AttributeValue
import com.rules.core.models.Entry
import com.rules.core.models.Rule
import com.rules.core.models.RuleCondition
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RuleEngineTest {

    private lateinit var ruleEngine: RuleEngine
    private lateinit var intAttr: AttributeDefinition
    private lateinit var decAttr: AttributeDefinition
    private lateinit var strAttr: AttributeDefinition

    @BeforeEach
    fun setup() {
        ruleEngine = RuleEngine()
        intAttr = AttributeDefinition("size", "Size", AttributeType.INTEGER)
        decAttr = AttributeDefinition("price", "Price", AttributeType.DECIMAL)
        strAttr = AttributeDefinition("city", "City", AttributeType.STRING)
    }

    @Test
    fun `InfoOnly rule always 0`() {
        val rule = Rule(intAttr.id, RuleCondition.InfoOnly, score = 99) // score ignored
        val entry = Entry(mapOf(intAttr.id to AttributeValue.IntegerValue(123)))

        val result = ruleEngine.evaluate(entry, listOf(intAttr), listOf(rule))

        assertEquals(0, result.attributeScores[intAttr.id])
        assertEquals(0, result.totalScore)
    }

    @Test
    fun `MinValue pass`() {
        val rule = Rule(intAttr.id, RuleCondition.MinValue(10), score = 5)
        val entry = Entry(mapOf(intAttr.id to AttributeValue.IntegerValue(12)))

        val result = ruleEngine.evaluate(entry, listOf(intAttr), listOf(rule))

        assertEquals(5, result.attributeScores[intAttr.id])
        assertEquals(5, result.totalScore)
    }

    @Test
    fun `ThresholdBand open-ended`() {
        val rule = Rule(intAttr.id, RuleCondition.ThresholdBand(min = 10, max = null), score = 7)
        val entry = Entry(mapOf(intAttr.id to AttributeValue.IntegerValue(20)))

        val result = ruleEngine.evaluate(entry, listOf(intAttr), listOf(rule))

        assertEquals(7, result.attributeScores[intAttr.id])
    }

    @Test
    fun `Equals string match`() {
        val rule = Rule(strAttr.id, RuleCondition.Equals("Amsterdam"), score = 10)
        val entry = Entry(mapOf(strAttr.id to AttributeValue.StringValue("Amsterdam")))

        val result = ruleEngine.evaluate(entry, listOf(strAttr), listOf(rule))

        assertEquals(10, result.attributeScores[strAttr.id])
    }

    @Test
    fun `multiple rules pick highest`() {
        val rules =
            listOf(
                Rule(intAttr.id, RuleCondition.ThresholdBand(77, 79), score = 5),
                Rule(intAttr.id, RuleCondition.ThresholdBand(80, 85), score = 7),
                Rule(intAttr.id, RuleCondition.ThresholdBand(90, null), score = 10),
            )
        val entry = Entry(mapOf(intAttr.id to AttributeValue.IntegerValue(82)))

        val result = ruleEngine.evaluate(entry, listOf(intAttr), rules)

        assertEquals(7, result.attributeScores[intAttr.id]) // picked best
        assertEquals(7, result.totalScore)
    }

    @Test
    fun `multiple attributes sum scores`() {
        val rules =
            listOf(
                Rule(intAttr.id, RuleCondition.MinValue(10), score = 3),
                Rule(decAttr.id, RuleCondition.MinValue(100), score = 5),
            )
        val entry =
            Entry(
                mapOf(
                    intAttr.id to AttributeValue.IntegerValue(12),
                    decAttr.id to AttributeValue.DecimalValue(200.0),
                ),
            )

        val result = ruleEngine.evaluate(entry, listOf(intAttr, decAttr), rules)

        assertEquals(8, result.totalScore)
    }
}
