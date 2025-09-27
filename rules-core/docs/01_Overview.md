# Rules Core Overview

`rules-core` is a small library that powers HomeSearch’s scoring system.  
It can also be reused in other apps where you want to **evaluate items against configurable rules**.

At its heart:
- **Attributes** define what can be scored (e.g., Home Size (m²), Price, commute time).
- **Rules** define how to score those attributes (e.g., “80–85m² → +7 points”, “≥40 (min) → pass”).
- **Entries** represent real-world data (e.g., “this house has 82m²; this house has 2 bedrooms”).
- The **RuleEngine** evaluates entries and produces a total score.

The library is **generic and in-memory**:
- 🚫 It does **not** store data (no DB).
- ✅ It just defines models and scoring logic.

## Example (HomeSearch)

- Attribute: `home_size`
- Rules:
  - `< 80 → 0 (dealbreaker)`
  - `80–85 → +7`
  - `≥90 → +10`
- Entry: home_size = 82  
- Result: +7 points (total score 7)

