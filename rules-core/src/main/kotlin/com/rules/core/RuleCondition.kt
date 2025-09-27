package com.rules.core

/**
 * Defines how attribute values are evaluated against rules. Sealed class pattern allows for
 * type-safe rule conditions.
 */
sealed class RuleCondition {

    /** No scoring, informational only - always passes evaluation */
    object InfoOnly : RuleCondition()

    /**
     * Minimum value check - if value < min, score is 0, otherwise passes
     * @param min The minimum threshold value
     */
    data class MinValue(val min: Int) : RuleCondition()

    /**
     * Threshold band evaluation - value ranges mapped to specific scores
     * @param min Minimum value for this band (inclusive, null for no lower bound)
     * @param max Maximum value for this band (inclusive, null for no upper bound)
     * @param score Points awarded if value falls within this band
     */
    data class ThresholdBand(val min: Int?, val max: Int?) : RuleCondition()

    /**
     * Exact match evaluation - for string or enum values
     * @param value The exact value to match against
     * @param score Points awarded if value matches exactly
     */
    data class Equals(val value: String) : RuleCondition()
}
