package com.homesearch.data

import com.homesearch.core.AppPaths
import com.homesearch.data.db.DatabaseFactory
import java.io.File
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class DatabaseFactoryTest {

    private val testDbFile = File(AppPaths.dataDir, "test-home-search.db")

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
    fun `database initialization creates database file`() {
        assertFalse(testDbFile.exists(), "Database file should not exist before initialization")

        assertDoesNotThrow { DatabaseFactory.init() }

        assertTrue(testDbFile.exists(), "Database file should exist after initialization")
    }

    @Test
    fun `database initialization is idempotent`() {
        assertDoesNotThrow { DatabaseFactory.init() }
        assertDoesNotThrow { DatabaseFactory.init() }

        assertTrue(
                testDbFile.exists(),
                "Database file should still exist after multiple initializations"
        )
    }

    @Test
    fun `getDatabase throws exception when not initialized`() {
        assertThrows<IllegalStateException> { DatabaseFactory.getDatabase() }
    }

    @Test
    fun `getDatabase returns database after initialization`() {
        DatabaseFactory.init()

        assertDoesNotThrow {
            val db = DatabaseFactory.getDatabase()
            assertTrue(db != null, "Database should not be null")
        }
    }
}
