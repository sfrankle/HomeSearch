package com.rules.core

import java.util.UUID

/** Core evaluation engine that applies rules to entries and calculates scores. */
class RuleEngine {

    /**
     * Evaluates an entry against a set of attribute definitions and rules.
     *
     * @param entry The entry to evaluate
     * @param attributes List of attribute definitions
     * @param rules List of rules to apply
     * @return EvaluationResult with individual attribute scores and total score
     */
    fun evaluate(entry: Entry, attributes: List<AttributeDefinition>, rules: List<Rule>): EvaluationResult {
        val attributeScores = mutableMapOf<UUID, Int>()

        // Initialize all attributes with 0 score
        attributes.forEach { attr -> attributeScores[attr.id] = 0 }

        // Apply rules to each attribute - find the best matching rule
        attributes.forEach { attribute ->
            val entryValue = entry.values[attribute.id]
            if (entryValue != null) {
                val applicableRules = rules.filter { it.attributeId == attribute.id }
                var bestScore = 0

                applicableRules.forEach { rule ->
                    val score = evaluateRule(rule, entryValue, attribute)
                    if (score > bestScore) {
                        bestScore = score
                    }
                }

                attributeScores[attribute.id] = bestScore
            }
        }

        val totalScore = attributeScores.values.sum()

        return EvaluationResult(attributeScores = attributeScores, totalScore = totalScore)
    }

    /** Evaluates a single rule against an attribute value. */
    private fun evaluateRule(
        rule: Rule,
        value: AttributeValue,
        @Suppress("UNUSED_PARAMETER") attribute: AttributeDefinition,
    ): Int {
        return when (rule.condition) {
            is RuleCondition.InfoOnly -> 0
            is RuleCondition.MinValue -> {
                when (value) {
                    is AttributeValue.IntegerValue -> {
                        if (value.value >= rule.condition.min) rule.score else 0
                    }
                    is AttributeValue.DecimalValue -> {
                        if (value.value >= rule.condition.min) rule.score else 0
                    }
                    else -> 0 // Type mismatch
                }
            }
            is RuleCondition.ThresholdBand -> {
                when (value) {
                    is AttributeValue.IntegerValue -> {
                        val intValue = value.value
                        val min = rule.condition.min ?: Int.MIN_VALUE
                        val max = rule.condition.max ?: Int.MAX_VALUE
                        if (intValue >= min && intValue <= max) rule.condition.score else 0
                    }
                    is AttributeValue.DecimalValue -> {
                        val doubleValue = value.value
                        val min = rule.condition.min?.toDouble() ?: Double.MIN_VALUE
                        val max = rule.condition.max?.toDouble() ?: Double.MAX_VALUE
                        if (doubleValue >= min && doubleValue <= max) rule.condition.score else 0
                    }
                    else -> 0 // Type mismatch
                }
            }
            is RuleCondition.Equals -> {
                when (value) {
                    is AttributeValue.StringValue -> {
                        if (value.value == rule.condition.value) rule.condition.score else 0
                    }
                    is AttributeValue.EnumValue -> {
                        if (value.value == rule.condition.value) rule.condition.score else 0
                    }
                    else -> 0 // Type mismatch
                }
            }
        }
    }
}
