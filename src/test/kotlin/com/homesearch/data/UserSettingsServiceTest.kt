package com.homesearch.data

import com.homesearch.data.db.DatabaseFactory
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow

class UserSettingsServiceTest {

    @BeforeEach
    fun setUp() {
        DatabaseFactory.init()
    }

    @AfterEach
    fun tearDown() {
        // Database cleanup is handled by DatabaseFactory
    }

    @Test
    fun `getSettings returns default settings`() {
        val settings = assertDoesNotThrow { UserSettingsService.getSettings() }

        assertNotNull(settings)
        assertEquals(1, settings.id)
        assertEquals("en", settings.language)
        assertEquals("metric", settings.measurementSystem)
        assertEquals("EUR", settings.currency)
    }

    @Test
    fun `updateSettings modifies and persists values`() {
        val originalSettings = UserSettingsService.getSettings()

        val updatedSettings =
                UserSettings(
                        id = originalSettings.id,
                        language = "es",
                        measurementSystem = "imperial",
                        currency = "USD",
                        updatedAt = originalSettings.updatedAt
                )

        val result = assertDoesNotThrow { UserSettingsService.updateSettings(updatedSettings) }

        assertEquals("es", result.language)
        assertEquals("imperial", result.measurementSystem)
        assertEquals("USD", result.currency)
        assertEquals(originalSettings.id, result.id)

        // Verify persistence by getting settings again
        val persistedSettings = UserSettingsService.getSettings()
        assertEquals("es", persistedSettings.language)
        assertEquals("imperial", persistedSettings.measurementSystem)
        assertEquals("USD", persistedSettings.currency)
    }

    @Test
    fun `updateSettings returns updated settings`() {
        val originalSettings = UserSettingsService.getSettings()

        val updatedSettings =
                UserSettings(
                        id = originalSettings.id,
                        language = "fr",
                        measurementSystem = "metric",
                        currency = "GBP",
                        updatedAt = originalSettings.updatedAt
                )

        val result = UserSettingsService.updateSettings(updatedSettings)

        // Should return the updated settings, not the input
        assertEquals("fr", result.language)
        assertEquals("metric", result.measurementSystem)
        assertEquals("GBP", result.currency)
    }
}
