package com.rules.core

/**
 * Represents a value that can be stored against an attribute.
 * Sealed class to handle different data types safely.
 */
sealed class AttributeValue {
    data class IntegerValue(val value: Int) : AttributeValue()
    data class DecimalValue(val value: Double) : AttributeValue()
    data class StringValue(val value: String) : AttributeValue()
    data class EnumValue(val value: String) : AttributeValue()
}
