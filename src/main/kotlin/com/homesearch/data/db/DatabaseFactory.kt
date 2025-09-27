package com.homesearch.data.db

import com.homesearch.core.AppPaths
import java.io.File
import mu.KotlinLogging
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction

private val logger = KotlinLogging.logger {}

object DatabaseFactory {
    private var database: Database? = null
    private val dbFile = File(AppPaths.dataDir, "home-search.db")

    fun init() {
        if (database != null) {
            logger.warn { "Database already initialized" }
            return
        }

        logger.info { "Initializing database at: ${dbFile.absolutePath}" }

        database =
                Database.connect(
                        url = "jdbc:sqlite:${dbFile.absolutePath}",
                        driver = "org.sqlite.JDBC",
                )

        // Enable foreign keys
        transaction { exec("PRAGMA foreign_keys = ON") }

        runMigrations()
        logger.info { "Database initialized successfully" }
    }

    fun getDatabase(): Database {
        return database
                ?: throw IllegalStateException("Database not initialized. Call init() first.")
    }

    private fun runMigrations() {
        transaction {
            // Create schema_version table if it doesn't exist
            exec(
                    """
                CREATE TABLE IF NOT EXISTS schema_version (
                    version INTEGER PRIMARY KEY,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """.trimIndent(),
            )

            // Get list of applied migrations
            val appliedVersions =
                    exec("SELECT version FROM schema_version ORDER BY version") { rs ->
                        val versions = mutableSetOf<Int>()
                        while (rs.next()) {
                            versions.add(rs.getInt("version"))
                        }
                        versions
                    }
                            ?: emptySet()

            // Find and apply new migrations
            val migrationFiles = findMigrationFiles()
            for (migrationFile in migrationFiles) {
                val version = extractVersionFromFilename(migrationFile.name)
                if (version !in appliedVersions) {
                    logger.info { "Applying migration: ${migrationFile.name}" }
                    val sql = migrationFile.readText()
                    exec(sql)

                    // Record that this migration was applied
                    exec("INSERT INTO schema_version (version) VALUES ($version)")
                    logger.info { "Migration ${migrationFile.name} applied successfully" }
                }
            }
        }
    }

    private fun findMigrationFiles(): List<File> {
        val migrationsDir = File("src/main/resources/db/migrations")
        if (!migrationsDir.exists()) {
            logger.warn { "Migrations directory does not exist: ${migrationsDir.absolutePath}" }
            return emptyList()
        }

        return migrationsDir
                .listFiles { file -> file.isFile && file.name.matches(Regex("V\\d+__.*\\.sql")) }
                ?.sortedBy { extractVersionFromFilename(it.name) }
                ?: emptyList()
    }

    private fun extractVersionFromFilename(filename: String): Int {
        val match = Regex("V(\\d+)__.*").find(filename)
        return match?.groupValues?.get(1)?.toInt()
                ?: throw IllegalArgumentException("Invalid migration filename format: $filename")
    }
}
