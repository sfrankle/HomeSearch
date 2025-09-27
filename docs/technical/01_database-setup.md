# Database Setup (SQLite + Exposed)

- Use SQLite as the embedded database.
- Database file path: `AppPaths.dataDir/home-search.db`
- Driver: `org.xerial:sqlite-jdbc`
- ORM / DSL: `org.jetbrains.exposed:exposed-core`, `exposed-dao`, `exposed-jdbc`

## Tasks
1. Add dependencies to `build.gradle.kts`.
2. Create `DatabaseFactory.kt` under `com.homesearch.data.db`.
   - Connect to SQLite.
   - Run migrations at startup.
3. Store migration files in `src/main/resources/db/migrations/`.
   - Use explicit versioned files: `V1__init.sql`, `V2__whatever.sql`.
4. Track schema version in `schema_version` table.
