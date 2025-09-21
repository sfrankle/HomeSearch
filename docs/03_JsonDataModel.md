# 📄 Data Model: JSON from ChatGPT (Funda Listings)

> **👤 USER-MAINTAINED DOCUMENT**  
> This document is maintained by the user. AI assistants should not modify this file.

This schema defines the standardized structure of JSON returned by ChatGPT when extracting property details from a Funda listing.
It is **read-only data from the listing**, which can later be extended with user-specific fields (ratings, notes, etc.).

---

## Root Object

```json
{
  "id": xxx,
  "link": "https://www.funda.nl/detail/koop/amsterdam/{{slug}}/{{id}}/",
  "address": { ... },
  "price": { ... },
  "details": { ... },
  "ownership": { ... },
  "vve": { ... },
  "metadata": { ... }
}
```

---

## Field Definitions

### 🔑 `id`

* **Type:** integer
* **Description:** Unique Funda listing ID (from the URL).
* **Example:** `89522692`

### 🔗 `link`

* **Type:** string (URL)
* **Description:** Direct link to the property listing on Funda.
* **Example:**
  `"https://www.funda.nl/detail/koop/amsterdam/appartement-archimedesweg-18-1/43152191/"`

---

### 🏠 `address` (object)

| Field          | Type   | Example          | Notes                  |
| -------------- | ------ | ---------------- | ---------------------- |
| `street`       | string | `"Hectorstraat"` | Street name            |
| `house_number` | int    | `20`             | House number           |
| `postal_code`  | string | `"1076 PR"`      | Always uppercase in NL |
| `city`         | string | `"Amsterdam"`    | City name              |

---

### 💰 `price` (object)

| Field              | Type   | Example  | Notes                 |
| ------------------ | ------ | -------- | --------------------- |
| `asking_price_eur` | number | `699000` | Asking price in euros |

---

### 📏 `details` (object)

| Field          | Type   | Example      | Notes                                                |
| -------------- | ------ | ------------ | ---------------------------------------------------- |
| `area_sqm`     | number | `84`         | Usable living area in m²                             |
| `floor_info`   | string | `"parterre"` | Dutch floor info (e.g. `"1e"`, `"2e"`, `"parterre"`) |
| `year_built`   | int    | `1930`       | Year construction completed                          |
| `energy_label` | string | `"C"`        | A–G energy efficiency                                |

---

### 📜 `ownership` (object)

| Field           | Type           | Example                      | Notes                                                     |
| --------------- | -------------- | ---------------------------- | --------------------------------------------------------- |
| `type`          | string         | `"erfpacht"`                 | `"erfpacht"` (leasehold) or `"volle eigendom"` (freehold) |
| `lease_details` | string         | `"afgekocht tot 21-05-2063"` | Lease conditions, incl. end date if applicable            |
| `perceel`       | string \| null | `null`                       | Kadastral parcel reference, if available                  |

---

### 🏢 `vve` (object)

| Field             | Type   | Example  | Notes                                                 |
| ----------------- | ------ | -------- | ----------------------------------------------------- |
| `monthly_fee_eur` | number | `168.96` | Monthly contribution to VvE (homeowners’ association) |

---

### 🗂️ `metadata` (object)

| Field        | Type              | Example        | Notes                                     |
| ------------ | ----------------- | -------------- | ----------------------------------------- |
| `source`     | string            | `"funda"`      | Always `"funda"` for now                  |
| `date_added` | string (ISO date) | `"2025-09-20"` | When the listing was added to our dataset |

---

## Example

```json
{
  "id": 89522692,
  "link": "https://www.funda.nl/detail/koop/amsterdam/appartement-hectorstraat-20/89522692/",
  "address": {
    "street": "Hectorstraat",
    "house_number": 20,
    "postal_code": "1076 PR",
    "city": "Amsterdam"
  },
  "price": {
    "asking_price_eur": 699000
  },
  "details": {
    "area_sqm": 84,
    "floor_info": "parterre",
    "year_built": 1930,
    "energy_label": "C"
  },
  "ownership": {
    "type": "erfpacht",
    "lease_details": "afgekocht tot 21-05-2063",
    "perceel": null
  },
  "vve": {
    "monthly_fee_eur": 168.96
  },
  "metadata": {
    "source": "funda",
    "date_added": "2025-09-20"
  }
}
```
