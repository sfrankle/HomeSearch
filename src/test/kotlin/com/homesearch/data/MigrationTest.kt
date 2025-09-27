package com.homesearch.data

import com.homesearch.core.AppPaths
import com.homesearch.data.db.DatabaseFactory
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow

class MigrationTest {

    private val testDbFile = File(AppPaths.dataDir, "test-migration-home-search.db")

    @BeforeEach
    fun setUp() {
        // Clean up any existing test database
        if (testDbFile.exists()) {
            testDbFile.delete()
        }
    }

    @AfterEach
    fun tearDown() {
        // Clean up test database
        if (testDbFile.exists()) {
            testDbFile.delete()
        }
    }

    @Test
    fun `migrations are applied only once`() {
        // First initialization
        assertDoesNotThrow { DatabaseFactory.init() }

        // Check that user_settings table exists and has default data
        transaction {
            val userSettingsCount =
                    exec("SELECT COUNT(*) as count FROM user_settings") { rs ->
                        rs.next()
                        rs.getInt("count")
                    }
                            ?: 0

            assertEquals(1, userSettingsCount, "Should have exactly 1 user settings record")

            val defaultSettings =
                    exec("SELECT * FROM user_settings WHERE id = 1") { rs ->
                        if (rs.next()) {
                            Triple(
                                    rs.getString("language"),
                                    rs.getString("measurement_system"),
                                    rs.getString("currency")
                            )
                        } else null
                    }

            assertNotNull(defaultSettings)
            assertEquals("en", defaultSettings?.first)
            assertEquals("metric", defaultSettings?.second)
            assertEquals("EUR", defaultSettings?.third)
        }

        // Second initialization should not create duplicate data
        assertDoesNotThrow { DatabaseFactory.init() }

        transaction {
            val userSettingsCount =
                    exec("SELECT COUNT(*) as count FROM user_settings") { rs ->
                        rs.next()
                        rs.getInt("count")
                    }
                            ?: 0

            assertEquals(
                    1,
                    userSettingsCount,
                    "Should still have exactly 1 user settings record after second init"
            )
        }
    }

    @Test
    fun `schema_version table tracks applied migrations`() {
        assertDoesNotThrow { DatabaseFactory.init() }

        transaction {
            val appliedMigrations =
                    exec("SELECT version FROM schema_version ORDER BY version") { rs ->
                        val versions = mutableListOf<Int>()
                        while (rs.next()) {
                            versions.add(rs.getInt("version"))
                        }
                        versions
                    }
                            ?: emptyList()

            assertTrue(appliedMigrations.isNotEmpty(), "Should have at least one applied migration")
            assertTrue(appliedMigrations.contains(1), "Should have V1 migration applied")
        }
    }

    @Test
    fun `user_settings table has correct schema`() {
        assertDoesNotThrow { DatabaseFactory.init() }

        transaction {
            // Check that all expected columns exist
            val columns =
                    exec("PRAGMA table_info(user_settings)") { rs ->
                        val columnNames = mutableListOf<String>()
                        while (rs.next()) {
                            columnNames.add(rs.getString("name"))
                        }
                        columnNames
                    }
                            ?: emptyList()

            assertTrue(columns.contains("id"), "Should have id column")
            assertTrue(columns.contains("language"), "Should have language column")
            assertTrue(
                    columns.contains("measurement_system"),
                    "Should have measurement_system column"
            )
            assertTrue(columns.contains("currency"), "Should have currency column")
            assertTrue(columns.contains("updated_at"), "Should have updated_at column")
        }
    }
}
