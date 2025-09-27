package com.homesearch

import com.homesearch.core.AppPaths
import com.homesearch.data.ConfigManager
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApplicationTest {

    @Test
    fun `config file path should be under Preferences or AppData`() {
        val path = AppPaths.configFile.absolutePath
        assertTrue(path.contains("HomeSearch"), "Config path should contain app name")
    }

    @Test
    fun `app metadata should match yaml`() {
        val metadata = ConfigManager.appMetadata
        assertEquals("HomeSearch", metadata.name)
        assertEquals("1.0.0", metadata.version)
    }
}
