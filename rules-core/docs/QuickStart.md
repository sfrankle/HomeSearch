# Quick Start

This example shows how to use `rules-core` in a Kotlin project.

```kotlin
val homeSize =
    AttributeDefinition(
        name = "home_size",
        displayName = "Home Size (m²)",
        type = AttributeType.INTEGER
    )

val rules = listOf(
    Rule(homeSize.id, RuleCondition.MinValue(40), score = 0), // must be ≥ 40
    Rule(homeSize.id, RuleCondition.ThresholdBand(80, 85), score = 7),
    Rule(homeSize.id, RuleCondition.ThresholdBand(90, null), score = 10),
)

val entry = Entry(values = mapOf(homeSize.id to AttributeValue.IntegerValue(82)))

val engine = RuleEngine()
val result = engine.evaluate(entry, attributes = listOf(homeSize), rules = rules)

println(result.totalScore) // 7
