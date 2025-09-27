# Rules Core Library (rules-core)

A reusable library for defining **scoring rules** against configurable attributes and applying them to entries.  
This will power HomeSearch but should stay **generic** so it can be reused in other projects (job hunting, fitness tracking, etc).

> Persistence (SQLite, Postgres, etc.) should be implemented in the consuming app. `rules-core` only provides interfaces and in-memory stubs for testing.
---

## Core Concepts

### AttributeDefinition
Represents a *field* that users can store values against.

- `id`: UUID (unique per attribute)
- `name`: String (machine name, e.g. `main_bedroom_sqm`)
- `displayName`: String (user-facing label, e.g. `Main Bedroom Size`)
- `type`: `AttributeType` (enum: `INTEGER`, `DECIMAL`, `STRING`, `ENUM`)
- `category`: String (optional grouping, e.g. `Sizing`, `Location`)
- `order`: Int (optional, for UI ordering)

---

### AttributeType (enum)
- `INTEGER`
- `DECIMAL`
- `STRING`
- `ENUM` (dropdown options)

---

### RuleCondition (sealed class)
Defines how values are evaluated:

- `INFO_ONLY`: No scoring, informational only.
- `MIN_VALUE`: If value < min → 0, else pass.
- `THRESHOLD_BANDS`: Value ranges mapped to scores (e.g. `77–79 → +5`).
- `EQUALS`: String or enum value matches → score.

```kotlin
sealed class RuleCondition {
    data class MinValue(val min: Int) : RuleCondition()
    data class ThresholdBand(val min: Int?, val max: Int?, val score: Int) : RuleCondition()
    data class Equals(val value: String, val score: Int) : RuleCondition()
}
```

---

### Rule
A condition applied to an `AttributeDefinition`.

- `id`: UUID
- `attributeId`: FK to `AttributeDefinition`
- `type`: RuleType
- `condition`: Generic JSON blob / sealed class depending on type
  - For `MIN_VALUE`: `{ "min": 8 }`
  - For `THRESHOLD_BANDS`: list of `{ "min": 77, "max": 79, "score": 5 }`
  - For `EQUALS`: `{ "value": "Amsterdam", "score": 10 }`
- `score`: Int (points assigned if condition met)

---

### Entry
A record of real-world data, evaluated against rules.

- `id`: UUID
- `values`: `Map<AttributeId, Value>`  
  - e.g. `{ main_bedroom_sqm: 12, location: "Amsterdam" }`
- `evaluatedScore`: Int (computed by RuleEngine)

---

### EvaluationResult
- `attributeScores`: Map<AttributeId, Int>
- `totalScore`: Int

---

### RuleEngine
Core evaluator logic.  

**Input**:  
- `Entry`
- List of `AttributeDefinitions`
- List of `Rules`

**Output**:  
- `EvaluationResult`:
  - `attributeScores: Map<AttributeId, Int>`
  - `totalScore: Int`


---

## Data Flow

1. Define attributes (`AttributeDefinition`)
2. Attach rules (`Rule`)
3. Create entries with values (`Entry`)
4. Pass to `RuleEngine.evaluate(entry, attributes, rules)`
5. Get back `EvaluationResult`

---

## Roadmap

### Phase 1 (MVP)
- Attribute types: INTEGER, DECIMAL
- Rule types: INFO_ONLY, MIN_VALUE, THRESHOLD_BANDS
- RuleEngine: evaluation logic + tests
 
---

## Example

**Config (Attributes + Rules):**
- Attribute: `main_bedroom_sqm`, type = INTEGER
  - Rule: MIN_VALUE, condition = `{ "min": 8 }`, score = 0
  - Rule: THRESHOLD_BANDS
    - 77–79 → +5
    - 80–85 → +7
    - >90 → +10

**Entry:**  
```json
{
  "main_bedroom_sqm": 82
}

Result:

main_bedroom_sqm score: +7

Total score: 7




thoughts:

what is the object the app(s) will use?
it seems like to get a good UI you need (entry: Entry, attributes: List<AttributeDefinition>, rules: List<Rule>)
which seems like a lot if we know we'll always want to return all those things