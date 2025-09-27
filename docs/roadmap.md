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


### Todo List

1. **Add database dependencies to build.gradle.kts**
   - Add SQLite JDBC driver (`org.xerial:sqlite-jdbc`)
   - Add Exposed ORM dependencies (`exposed-core`, `exposed-dao`, `exposed-jdbc`)

2. **Create DatabaseFactory.kt**
   - Create singleton `DatabaseFactory` object in `com.homesearch.data.db`
   - Implement `init()` function to connect to SQLite at `AppPaths.dataDir/home-search.db`
   - Implement migration runner that reads SQL files in order
   - Track applied versions in `schema_version` table
   - Only apply new migrations

3. **Create migration system**
   - Create directory `src/main/resources/db/migrations/`
   - Create `V1__init.sql` migration file with user_settings table schema
   - Include default data insertion (en, metric, EUR)

4. **Create UserSettings data class**
   - Define UserSettings data class with language, measurement_system, currency fields

5. **Create UserSettingsService**
   - Implement `getSettings(): UserSettings` function
   - Implement `updateSettings(new: UserSettings): UserSettings` function
   - Handle database operations using Exposed

6. **Initialize database in Main.kt**
   - Call `DatabaseFactory.init()` on app startup

7. **Write comprehensive tests**
   - Test database initialization
   - Test settings CRUD operations
   - Test migration system (applied only once)
   - Verify default data is created

8. **Verify acceptance criteria**
   - Confirm auto-creation of home-search.db
   - Confirm user_settings table with default row
   - Confirm CRUD operations work
   - Confirm all tests pass

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
