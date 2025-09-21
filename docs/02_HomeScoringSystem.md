# Home Scoring System

> **👤 USER-MAINTAINED DOCUMENT**  
> This document is maintained by the user. AI assistants should not modify this file.

This document defines how we evaluate Funda listings in our app.
It explains the **types of rules**, the **fields we need to capture**, and the **scoring algorithm (with dynamic & normalized outputs)**.

---

## 1. Rule Types

We evaluate each home with a combination of rules:

* **Dealbreaker** → If not satisfied, the entire listing is disqualified (score = 0).
* **Threshold** → Minimum requirement. If not met, listing is disqualified; if met, adds baseline points.
* **Weighted Score** → Adds or subtracts points depending on how well the listing matches our preferences.

Total score is the sum of weighted rules, unless a dealbreaker is triggered.
The total score is the sum of weighted rules unless a dealbreaker triggers. Scores are returned as:

- `score_raw` (dynamic, depends on config)
- `score_max_possible` (dynamic, from current config)
- `score_normalized` = round(10 * score_raw / score_max_possible * 10) / 10 clipped to [0, 10]

---

## 2. Fields Needed

These fields should exist in the database (SQLite table). Some come from the Funda listing (scraped), others are entered manually by the user.

### From Funda (already scraped)

* `id` (Funda listing ID, integer)
* `price_eur` (asking price, integer)
* `area_sqm` (total living area, float)
* `floor_info` (string: "parterre", "1e", "2e", etc.)
* `year_built` (integer)
* `energy_label` (string, A–G)
* `ownership_type` (string: "erfpacht" / "volle eigendom")
* `lease_details` (string)
* `vve_monthly_fee_eur` (float)

### Entered Manually

* `main_bedroom_sqm` (float, usable area of bedroom)
* `kitchen_type` (enum: `open`, `relocatable`, `closed`)
* `foundation_status` (enum: `ok`, `unknown`, `concern`)
* `street_noise` (enum: `quiet`, `medium`, `noisy`)
* `smelly_business_below` (boolean)
* `commute_time_central_min` (integer, minutes via OV)
* `commute_time_mark_min` (integer, minutes via OV + bike)
* `commute_time_sarah_min` (integer, minutes via OV + bike)
* `workspace_count` (integer, number of desk spaces possible)
* `viewing_status` (enum: `wishlist`, `scheduled`, `viewed`, `offer_made`)
* `notes` (text)

---

## 3. Scoring Rules 
### v1.1

#### Bedroom Size (Threshold)

* **Rule:** Main bedroom must be ≥ 8 m².
* **If < 8 m²:** score = 0 (dealbreaker).
* **If ≥ 8 m²:** +10 points.

---

#### Total Living Area (Threshold + Weighted)

* **Rule:** Must be ≥ 77 m².
* **If < 77 m²:** score = 0.
* **Scoring:**

  * 77–79 m² → +5 points
  * 80–85 m² → +7 points
  * 86–90 m² → +9 points
  * > 90 m² → +10 points

---

#### Floor Entrance (Dealbreaker)

* **Rule:** Lowest floor must be ≤ 2nd floor.
* **If ≥ 3rd floor:** score = 0.
* **If ≤ 2nd floor:** +10 points.

---

#### Budget (Weighted)

* **Rule:** Asking price compared to max €750k.
* **Scoring:**

  * ≤ €750k → +10 points
  * €751k–€790k → +5 points
  * > €790k → −5 points

---

#### Kitchen Layout (Dealbreaker + Penalty Option)

* **Rule:** Kitchen must allow open layout.
* **Scoring:**

  * `open` → +10 points
  * `relocatable` → +5 points
  * `closed` → score = 0

---

### v1.2
Rules reference DB config rather than hardcoded numbers.

#### Bedroom Size (Threshold)

- Config: scoring_config.bedroom_min_sqm (default 8.0)
- Logic:
  - If main_bedroom_sqm < threshold → dealbreaker
  - Else → add +10 points × weight_bedroom

#### Total Living Area (Threshold + Weighted Bands)

- Config: total_area_min_sqm (default 77.0), bands in scoring_bands_total_area
- Logic:
  - If area_sqm < threshold → dealbreaker
  - Else → find matching band → add band.points × weight_total_area

#### Floor Entrance (Dealbreaker)

- Config: floor_max_entrance (default 2)
- Logic:
  - Compute lowest_floor_num from floor_info (parterre/begane grond=0, 1e=1, 2e=2, …).
  - If lowest_floor_num > floor_max_entrance → dealbreaker
  - Else → add +10 points × weight_floor_entrance

#### Budget (Weighted Bands)

- Config: bands in scoring_bands_budget
- Logic:
  - Find matching price band for price_eur → add band.points × weight_budget
  - (Not a dealbreaker; bands may be negative.)

#### Kitchen Layout (Dealbreaker + Weighted)

- Config: points & dealbreaker flag in scoring_kitchen_points
- Logic:
  - If kitchen_type row has is_dealbreaker=1 → dealbreaker
  - Else → add points × weight_kitchen_layout


## 5. Scoring Algorithm (Spec)

Status flow:

1. If any required manual field is missing → that value = 0.
2. Evaluate rules in order; if any dealbreaker triggers → `status = dealbreaker`, score_raw = 0, score_normalized = 0.
3. Otherwise accumulate `score_raw` and compute `score_max_possible` as the sum of the maximum attainable positive points per enabled rule × its weight, given current config.
4. `score_normalized = round(10 * score_raw / score_max_possible * 10) / 10` clipped to [0,10].
5. Return a per-rule breakdown for transparency.

## 6. Score Configuration Page

This page is a page dedicated only to editing scoring configuration. It is backed by the scoring_config (and band tables where applicable).

### Rules Display

- Show all rules in a list.
- Dealbreaker-only rules (e.g. Floor Entrance) → listed but read-only, no config inputs.
- Other rules → must expose at least:
  - Threshold value(s)
  - Points awarded at minimum threshold
  - Optional bands (for area, budget, etc.)
  - Weight (multiplier, default = 1.0)

### Configurable Inputs (examples)
- Bedroom Size
  - bedroom_min_sqm
  - bedroom_points (int, default = 10)
  - weight_bedroom (float slider 0–2.0 step 0.1)

- Total Living Area
  - total_area_min_sqm
  - Editable band table (`min`, `max`, `points`)
  - weight_total_area

- Budget
  - Editable band table (`min`, `max`, `points`) — allows negative points
  - `weight_budget` 

### DB Requirements

- Store default values from this document in scoring_config and band tables.
- On first run, seed DB with these defaults via migration files.
- All config values are editable and persisted.

### UI Elements
- Editable Form/Table for each rule’s parameters.
- Save Button → commits changes to DB.
- Reset Button → restores DB values to defaults defined in this doc.

### Behavior
- On any config change → immediately recompute all listing scores.
- On any manual field change in listings (e.g. filling in bedroom size) → recompute scores live.