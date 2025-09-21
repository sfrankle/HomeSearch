# Roadmap & Project Status

This file tracks ideas, experiments, and upcoming features.  
Items can move from here → changelog once complete.

---

## 🚧 In Progress
  - SQLite setup with Exposed
    - AppPaths.dataDir/home-search.db
    - com.homesearch.data.db.DatabaseFactory.kt
        - singleton DatabaseFactory object
        - Function init() → connect, run migrations
        - Runner: in DatabaseFactory.kt
            - Read migration SQL files in order.
            - Track applied versions in schema_version.
            - Only apply new ones.
  - Migration system (V1 rules table)
    - Migration location: src/main/resources/db/migrations/
    - File naming: V1__init.sql
  - configure initial data set: user settings:
    - language
    - meters vs feet
    - currency
    ```sql
        CREATE TABLE user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT NOT NULL DEFAULT 'en',
            measurement_system TEXT NOT NULL DEFAULT 'metric', -- 'metric' or 'imperial'
            currency TEXT NOT NULL DEFAULT 'EUR',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ```
  - basic crud service for data access
    - fun getSettings(): UserSettings
    - fun updateSettings(new: UserSettings): UserSettings
  - write tests

✅ Acceptance Criteria

- Running the app auto-creates home-search.db in AppPaths.dataDir.
- After first run:
- user_settings table exists with 1 row of defaults (en, metric, EUR).
- UserSettingsService.getSettings() returns the default row.
- UserSettingsService.updateSettings() modifies and persists values.
- Tests pass:
    - Confirm DB initializes.
    - Confirm settings CRUD works.
    - Confirm migrations applied only once.

---

## 📋 Next Ideas
- Rules Engine foundation
  - RuleEngine stub
  - Basic unit test

- Add scoring system (e.g. sum of effects → numeric score).
- Implement user-defined rules in UI (add/remove/edit rules).
- Persist applied rule history to database.
- Support rule categories (filter vs scoring vs alerts).

---

## 💡 Future Brain Dump
- Export/import rules to JSON/YAML for sharing.
- Integrate with other HomeSearch modules (e.g. property data).
- Configurable weights for rules.
- Pluggable rule types (range checks, regex, custom Kotlin).
- Visualization in UI (rule tree, scoring breakdown).
